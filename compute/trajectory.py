#!/usr/bin/env python3
"""
Log optimizer trajectory during training and project onto the loss landscape plane.

Usage:
    python trajectory.py --model resnet56 --epochs 100 --output ../frontend/public/landscapes/
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

    train_dataset = datasets.CIFAR10(
        root="./data", train=True, download=True, transform=transform_train
    )

    train_loader = torch.utils.data.DataLoader(
        train_dataset, batch_size=batch_size, shuffle=True, num_workers=2
    )

    return train_loader


def flatten_weights(model: nn.Module) -> np.ndarray:
    """Flatten all model weights into a single vector."""
    return np.concatenate([p.data.cpu().numpy().flatten() for p in model.parameters()])


def project_onto_directions(
    weights: np.ndarray,
    center: np.ndarray,
    direction1: np.ndarray,
    direction2: np.ndarray,
) -> tuple:
    """Project weights onto the 2D plane defined by two directions."""
    diff = weights - center
    alpha = np.dot(diff, direction1) / np.dot(direction1, direction1)
    beta = np.dot(diff, direction2) / np.dot(direction2, direction2)
    return float(alpha), float(beta)


def train_and_log_trajectory(
    model: nn.Module,
    train_loader: torch.utils.data.DataLoader,
    device: torch.device,
    epochs: int = 100,
    lr: float = 0.1,
    log_every: int = 10,
) -> tuple:
    """Train model and log weight snapshots."""
    model.to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.SGD(model.parameters(), lr=lr, momentum=0.9, weight_decay=5e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    weight_snapshots = []
    loss_history = []

    step = 0
    for epoch in range(epochs):
        model.train()
        epoch_loss = 0.0

        for inputs, targets in train_loader:
            inputs, targets = inputs.to(device), targets.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item()

            if step % log_every == 0:
                weight_snapshots.append(flatten_weights(model))
                loss_history.append(loss.item())

            step += 1

        scheduler.step()
        print(f"Epoch {epoch + 1}/{epochs}: Loss={epoch_loss / len(train_loader):.4f}")

    final_weights = flatten_weights(model)
    weight_snapshots.append(final_weights)
    loss_history.append(epoch_loss / len(train_loader))

    return weight_snapshots, loss_history, final_weights


def generate_random_direction(size: int, seed: int) -> np.ndarray:
    """Generate a random unit direction vector."""
    np.random.seed(seed)
    direction = np.random.randn(size)
    direction = direction / np.linalg.norm(direction)
    return direction


def main():
    parser = argparse.ArgumentParser(description="Log optimizer trajectory")
    parser.add_argument(
        "--model",
        choices=["resnet56", "resnet56_noskip"],
        default="resnet56",
        help="Model architecture",
    )
    parser.add_argument(
        "--output",
        "-o",
        default="../frontend/public/landscapes/",
        help="Output directory",
    )
    parser.add_argument(
        "--epochs", "-e", type=int, default=100, help="Training epochs"
    )
    parser.add_argument(
        "--log-every", type=int, default=50, help="Log weights every N steps"
    )

    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    if args.model == "resnet56":
        model = ResNet56()
        landscape_id = "resnet56_short"
    else:
        model = ResNet56NoShortcut()
        landscape_id = "resnet56_noshort"

    train_loader = get_cifar10_loaders()

    print(f"Training {args.model} and logging trajectory...")
    weight_snapshots, loss_history, final_weights = train_and_log_trajectory(
        model, train_loader, device, epochs=args.epochs, log_every=args.log_every
    )

    print("Generating random directions for projection...")
    direction1 = generate_random_direction(len(final_weights), seed=42)
    direction2 = generate_random_direction(len(final_weights), seed=123)

    direction2 = direction2 - np.dot(direction2, direction1) * direction1
    direction2 = direction2 / np.linalg.norm(direction2)

    print("Projecting trajectory onto 2D plane...")
    trajectory = []
    for weights, loss in zip(weight_snapshots, loss_history):
        alpha, beta = project_onto_directions(weights, final_weights, direction1, direction2)
        trajectory.append({"alpha": alpha, "beta": beta, "loss": loss})

    output_path = Path(args.output)
    output_path.mkdir(parents=True, exist_ok=True)

    trajectory_path = output_path / f"{landscape_id}_trajectory.json"
    with open(trajectory_path, "w") as f:
        json.dump({"trajectory": trajectory}, f)

    print(f"Saved trajectory: {trajectory_path}")
    print(f"Total trajectory points: {len(trajectory)}")


if __name__ == "__main__":
    main()
