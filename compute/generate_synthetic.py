#!/usr/bin/env python3
"""
Generate synthetic loss landscape data for development.

This creates landscapes that visually mimic the characteristics described in
Li et al. (2018):
- ResNet with skip connections: smooth, convex bowl
- ResNet without skip connections: chaotic, many local minima
- VGG: intermediate complexity

Usage:
    python generate_synthetic.py --output ../frontend/public/landscapes/
"""

import argparse
import gzip
import json
import os
from pathlib import Path

import numpy as np
from scipy.ndimage import gaussian_filter


def generate_smooth_landscape(grid_size: int = 51, seed: int = 42) -> np.ndarray:
    """Generate a smooth, convex bowl (skip connections)."""
    np.random.seed(seed)

    x = np.linspace(-1, 1, grid_size)
    y = np.linspace(-1, 1, grid_size)
    X, Y = np.meshgrid(x, y)

    base = 0.3 * (X**2 + Y**2)

    noise = np.random.randn(grid_size, grid_size) * 0.02
    noise = gaussian_filter(noise, sigma=3)

    landscape = base + noise

    landscape = landscape - landscape.min() + 0.1

    return landscape


def generate_chaotic_landscape(grid_size: int = 51, seed: int = 123) -> np.ndarray:
    """Generate a chaotic landscape with many local minima (no skip connections)."""
    np.random.seed(seed)

    x = np.linspace(-1, 1, grid_size)
    y = np.linspace(-1, 1, grid_size)
    X, Y = np.meshgrid(x, y)

    base = 0.2 * (X**2 + Y**2)

    num_bumps = 15
    bumps = np.zeros_like(X)
    for _ in range(num_bumps):
        cx, cy = np.random.uniform(-0.8, 0.8, 2)
        amplitude = np.random.uniform(0.1, 0.4)
        width = np.random.uniform(0.15, 0.35)
        bumps += amplitude * np.exp(-((X - cx) ** 2 + (Y - cy) ** 2) / (2 * width**2))

    ridges = 0.15 * np.sin(5 * X + np.random.randn()) * np.cos(4 * Y + np.random.randn())

    noise = np.random.randn(grid_size, grid_size) * 0.08
    noise = gaussian_filter(noise, sigma=1.5)

    landscape = base + bumps + ridges + noise

    landscape = landscape - landscape.min() + 0.1

    return landscape


def generate_vgg_landscape(grid_size: int = 51, seed: int = 456) -> np.ndarray:
    """Generate an intermediate complexity landscape (VGG-style)."""
    np.random.seed(seed)

    x = np.linspace(-1, 1, grid_size)
    y = np.linspace(-1, 1, grid_size)
    X, Y = np.meshgrid(x, y)

    base = 0.25 * (X**2 + 1.2 * Y**2)

    num_bumps = 6
    bumps = np.zeros_like(X)
    for _ in range(num_bumps):
        cx, cy = np.random.uniform(-0.7, 0.7, 2)
        amplitude = np.random.uniform(0.05, 0.2)
        width = np.random.uniform(0.2, 0.4)
        bumps += amplitude * np.exp(-((X - cx) ** 2 + (Y - cy) ** 2) / (2 * width**2))

    noise = np.random.randn(grid_size, grid_size) * 0.04
    noise = gaussian_filter(noise, sigma=2)

    landscape = base + bumps + noise
    landscape = landscape - landscape.min() + 0.1

    return landscape


def generate_trajectory(
    landscape: np.ndarray, grid_size: int = 51, steps: int = 100, seed: int = 789
) -> list:
    """Generate a synthetic optimizer trajectory."""
    np.random.seed(seed)

    alpha_range = np.linspace(-1, 1, grid_size)
    beta_range = np.linspace(-1, 1, grid_size)

    start_i = np.random.randint(grid_size // 4, 3 * grid_size // 4)
    start_j = np.random.randint(grid_size // 4, 3 * grid_size // 4)

    min_idx = np.unravel_index(np.argmin(landscape), landscape.shape)
    end_i, end_j = min_idx

    trajectory = []
    i, j = float(start_i), float(start_j)

    for step in range(steps):
        progress = step / (steps - 1)
        progress = progress**0.5

        target_i = start_i + (end_i - start_i) * progress
        target_j = start_j + (end_j - start_j) * progress

        noise_scale = 0.5 * (1 - progress)
        i = target_i + np.random.randn() * noise_scale * grid_size * 0.1
        j = target_j + np.random.randn() * noise_scale * grid_size * 0.1

        i = np.clip(i, 0, grid_size - 1)
        j = np.clip(j, 0, grid_size - 1)

        alpha = alpha_range[int(i)]
        beta = beta_range[int(j)]
        loss = float(landscape[int(i), int(j)])

        trajectory.append({"alpha": float(alpha), "beta": float(beta), "loss": loss})

    return trajectory


def compute_gradient_magnitude(landscape: np.ndarray) -> np.ndarray:
    """Compute approximate gradient magnitude at each point."""
    grad_y, grad_x = np.gradient(landscape)
    magnitude = np.sqrt(grad_x**2 + grad_y**2)
    return magnitude


def save_landscape(
    landscape: np.ndarray,
    output_dir: str,
    landscape_id: str,
    label: str,
    architecture: str,
    dataset: str = "cifar10",
    trajectory: list | None = None,
    notes: str = "",
) -> None:
    """Save landscape data to JSON and gzipped JSON."""
    grid_size = landscape.shape[0]
    gradient_magnitude = compute_gradient_magnitude(landscape)

    data = {
        "id": landscape_id,
        "label": label,
        "architecture": architecture,
        "dataset": dataset,
        "gridSize": grid_size,
        "alphaRange": [-1.0, 1.0],
        "betaRange": [-1.0, 1.0],
        "loss": landscape.tolist(),
        "gradientMagnitude": gradient_magnitude.tolist(),
        "notes": notes or "Synthetic data for development",
    }

    if trajectory:
        data["trajectory"] = trajectory

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    json_path = output_path / f"{landscape_id}.json"
    with open(json_path, "w") as f:
        json.dump(data, f)

    gzip_path = output_path / f"{landscape_id}.json.gz"
    with gzip.open(gzip_path, "wt", encoding="utf-8") as f:
        json.dump(data, f)

    file_size = os.path.getsize(gzip_path) / 1024
    print(f"Saved: {json_path}")
    print(f"Saved: {gzip_path} ({file_size:.1f} KB)")


def save_manifest(output_dir: str, landscapes: list) -> None:
    """Save the landscape manifest."""
    manifest = {"landscapes": landscapes, "defaultId": "resnet56_short"}

    output_path = Path(output_dir) / "manifest.json"
    with open(output_path, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"Saved: {output_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Generate synthetic loss landscape data"
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

    args = parser.parse_args()

    print("Generating synthetic loss landscapes...")
    print(f"Grid size: {args.grid_size}")
    print()

    smooth = generate_smooth_landscape(args.grid_size)
    trajectory_smooth = generate_trajectory(smooth, args.grid_size)
    save_landscape(
        smooth,
        args.output,
        "resnet56_short",
        "ResNet-56 (with skip connections)",
        "resnet56",
        trajectory=trajectory_smooth,
        notes="Synthetic smooth landscape mimicking skip connection behavior",
    )
    print()

    chaotic = generate_chaotic_landscape(args.grid_size)
    trajectory_chaotic = generate_trajectory(chaotic, args.grid_size, steps=150)
    save_landscape(
        chaotic,
        args.output,
        "resnet56_noshort",
        "ResNet-56 (without skip connections)",
        "resnet56_noskip",
        trajectory=trajectory_chaotic,
        notes="Synthetic chaotic landscape mimicking no-skip-connection behavior",
    )
    print()

    vgg = generate_vgg_landscape(args.grid_size)
    trajectory_vgg = generate_trajectory(vgg, args.grid_size, steps=120)
    save_landscape(
        vgg,
        args.output,
        "vgg9",
        "VGG-9",
        "vgg9",
        trajectory=trajectory_vgg,
        notes="Synthetic intermediate complexity landscape",
    )
    print()

    manifest_entries = [
        {
            "id": "resnet56_short",
            "label": "ResNet-56 (with skip connections)",
            "architecture": "resnet56",
            "file": "resnet56_short.json",
        },
        {
            "id": "resnet56_noshort",
            "label": "ResNet-56 (without skip connections)",
            "architecture": "resnet56_noskip",
            "file": "resnet56_noshort.json",
        },
        {
            "id": "vgg9",
            "label": "VGG-9",
            "architecture": "vgg9",
            "file": "vgg9.json",
        },
    ]
    save_manifest(args.output, manifest_entries)

    print()
    print("Done! Synthetic landscapes generated successfully.")


if __name__ == "__main__":
    main()
