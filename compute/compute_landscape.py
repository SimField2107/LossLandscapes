#!/usr/bin/env python3
"""
Compute loss landscape from scratch by training a model.

This is a fallback script that:
1. Trains a ResNet-56 (with or without skip connections) on CIFAR-10
2. Generates two random filter-wise normalized direction vectors
3. Computes loss values on a 2D grid around the trained weights

Based on: Li et al. (2018) "Visualizing the Loss Landscape of Neural Nets"
https://arxiv.org/abs/1712.09913

Usage:
    python compute_landscape.py --model resnet56 --skip-connections --output ../frontend/public/landscapes/
"""

import argparse
import copy
import gzip
import json
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms

from models.resnet import ResNet56, ResNet56NoShortcut


def get_cifar10_loaders(batch_size: int = 128):
    """Get CIFAR-10 train and test data loaders."""
    transform_train = transforms.Compose(
        [
            transforms.RandomCrop(32, padding=4),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2023, 0.1994, 0.2010)),
        ]
    )

    transform_test = transforms.Compose(
        [
            transforms.ToTensor(),
            transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2023, 0.1994, 0.2010)),
        ]
    )

    train_dataset = datasets.CIFAR10(
        root="./data", train=True, download=True, transform=transform_train
    )
    test_dataset = datasets.CIFAR10(
        root="./data", train=False, download=True, transform=transform_test
    )

    train_loader = torch.utils.data.DataLoader(
        train_dataset, batch_size=batch_size, shuffle=True, num_workers=2
    )
    test_loader = torch.utils.data.DataLoader(
        test_dataset, batch_size=batch_size, shuffle=False, num_workers=2
    )

    return train_loader, test_loader


def get_weights(model: nn.Module) -> list:
    """Extract weights from model as a list of tensors."""
    return [p.data.clone() for p in model.parameters()]


def set_weights(model: nn.Module, weights: list) -> None:
    """Set model weights from a list of tensors."""
    for p, w in zip(model.parameters(), weights):
        p.data.copy_(w)


def get_random_direction(model: nn.Module) -> list:
    """Generate a random direction with the same shape as model weights."""
    direction = []
    for p in model.parameters():
        d = torch.randn_like(p.data)
        direction.append(d)
    return direction


def normalize_direction_filterwise(direction: list, weights: list) -> list:
    """
    Apply filter-wise normalization as described in the paper.

    For each filter (or neuron), scale the random direction to have the same
    norm as the corresponding filter in the trained weights.
    """
    normalized = []
    for d, w in zip(direction, weights):
        if len(w.shape) >= 2:
            for i in range(w.shape[0]):
                filter_norm = w[i].norm()
                direction_norm = d[i].norm()
                if direction_norm > 0:
                    d[i] = d[i] * (filter_norm / direction_norm)
        normalized.append(d)
    return normalized


def compute_loss(
    model: nn.Module,
    data_loader: torch.utils.data.DataLoader,
    criterion: nn.Module,
    device: torch.device,
    max_batches: int = 50,
) -> float:
    """Compute average loss over the dataset."""
    model.eval()
    total_loss = 0.0
    num_batches = 0

    with torch.no_grad():
        for inputs, targets in data_loader:
            if num_batches >= max_batches:
                break
            inputs, targets = inputs.to(device), targets.to(device)
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            total_loss += loss.item()
            num_batches += 1

    return total_loss / num_batches if num_batches > 0 else 0.0


def compute_landscape(
    model: nn.Module,
    weights_center: list,
    direction1: list,
    direction2: list,
    data_loader: torch.utils.data.DataLoader,
    criterion: nn.Module,
    device: torch.device,
    grid_size: int = 51,
    alpha_range: tuple = (-1.0, 1.0),
    beta_range: tuple = (-1.0, 1.0),
) -> np.ndarray:
    """
    Compute 2D loss landscape.

    f(alpha, beta) = L(theta* + alpha*delta + beta*eta)
    """
    alphas = np.linspace(alpha_range[0], alpha_range[1], grid_size)
    betas = np.linspace(beta_range[0], beta_range[1], grid_size)

    landscape = np.zeros((grid_size, grid_size))

    total = grid_size * grid_size
    for i, alpha in enumerate(alphas):
        for j, beta in enumerate(betas):
            new_weights = []
            for w, d1, d2 in zip(weights_center, direction1, direction2):
                new_w = w + alpha * d1 + beta * d2
                new_weights.append(new_w)

            set_weights(model, new_weights)
            loss = compute_loss(model, data_loader, criterion, device)
            landscape[i, j] = loss

            progress = (i * grid_size + j + 1) / total * 100
            print(f"\rComputing landscape: {progress:.1f}%", end="", flush=True)

    print()
    return landscape


def train_model(
    model: nn.Module,
    train_loader: torch.utils.data.DataLoader,
    device: torch.device,
    epochs: int = 100,
    lr: float = 0.1,
) -> list:
    """Train the model and return trajectory."""
    model.to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.SGD(model.parameters(), lr=lr, momentum=0.9, weight_decay=5e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    trajectory = []

    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for inputs, targets in train_loader:
            inputs, targets = inputs.to(device), targets.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += targets.size(0)
            correct += predicted.eq(targets).sum().item()

        scheduler.step()

        epoch_loss = running_loss / len(train_loader)
        accuracy = 100.0 * correct / total
        print(f"Epoch {epoch + 1}/{epochs}: Loss={epoch_loss:.4f}, Acc={accuracy:.2f}%")

        trajectory.append(get_weights(model))

    return trajectory


def main():
    parser = argparse.ArgumentParser(description="Compute loss landscape from scratch")
    parser.add_argument(
        "--model",
        choices=["resnet56"],
        default="resnet56",
        help="Model architecture",
    )
    parser.add_argument(
        "--skip-connections",
        action="store_true",
        help="Use skip connections (default: no skip connections)",
    )
    parser.add_argument(
        "--output",
        "-o",
        default="../frontend/public/landscapes/",
        help="Output directory",
    )
    parser.add_argument(
        "--grid-size", "-g", type=int, default=51, help="Grid size (default: 51)"
    )
    parser.add_argument(
        "--epochs", "-e", type=int, default=100, help="Training epochs (default: 100)"
    )
    parser.add_argument(
        "--load-weights", help="Load pre-trained weights instead of training"
    )

    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    if args.skip_connections:
        model = ResNet56()
        landscape_id = "resnet56_short"
        label = "ResNet-56 (with skip connections)"
    else:
        model = ResNet56NoShortcut()
        landscape_id = "resnet56_noshort"
        label = "ResNet-56 (without skip connections)"

    train_loader, test_loader = get_cifar10_loaders()

    if args.load_weights:
        model.load_state_dict(torch.load(args.load_weights, map_location=device))
        model.to(device)
        print(f"Loaded weights from {args.load_weights}")
    else:
        print(f"Training {label}...")
        train_model(model, train_loader, device, epochs=args.epochs)

    weights_center = get_weights(model)

    print("Generating random directions...")
    direction1 = get_random_direction(model)
    direction2 = get_random_direction(model)

    print("Applying filter-wise normalization...")
    direction1 = normalize_direction_filterwise(direction1, weights_center)
    direction2 = normalize_direction_filterwise(direction2, weights_center)

    print("Computing loss landscape...")
    criterion = nn.CrossEntropyLoss()
    landscape = compute_landscape(
        model,
        weights_center,
        direction1,
        direction2,
        test_loader,
        criterion,
        device,
        grid_size=args.grid_size,
    )

    data = {
        "id": landscape_id,
        "label": label,
        "architecture": "resnet56" if args.skip_connections else "resnet56_noskip",
        "dataset": "cifar10",
        "gridSize": args.grid_size,
        "alphaRange": [-1.0, 1.0],
        "betaRange": [-1.0, 1.0],
        "loss": landscape.tolist(),
        "notes": "Computed from scratch with filter-wise normalized directions",
    }

    output_path = Path(args.output)
    output_path.mkdir(parents=True, exist_ok=True)

    json_path = output_path / f"{landscape_id}.json"
    with open(json_path, "w") as f:
        json.dump(data, f)

    gzip_path = output_path / f"{landscape_id}.json.gz"
    with gzip.open(gzip_path, "wt", encoding="utf-8") as f:
        json.dump(data, f)

    print(f"Saved: {json_path}")
    print(f"Saved: {gzip_path}")


if __name__ == "__main__":
    main()
