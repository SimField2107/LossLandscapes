#!/usr/bin/env python3
"""
Convert HDF5 loss landscape files from the paper's authors into JSON format.

Source: https://github.com/tomgoldstein/loss-landscape

Usage:
    python convert_h5_to_json.py --input path/to/surface.h5 --output ../frontend/public/landscapes/
"""

import argparse
import gzip
import json
import os
from pathlib import Path

import h5py
import numpy as np


def convert_h5_to_json(
    h5_path: str,
    output_dir: str,
    landscape_id: str,
    label: str,
    architecture: str,
    dataset: str = "cifar10",
) -> str:
    """Convert an HDF5 loss landscape file to our JSON format."""
    with h5py.File(h5_path, "r") as f:
        xcoordinates = np.array(f["xcoordinates"])
        ycoordinates = np.array(f["ycoordinates"])

        if "train_loss" in f:
            loss = np.array(f["train_loss"])
        elif "test_loss" in f:
            loss = np.array(f["test_loss"])
        else:
            raise ValueError(f"No loss data found in {h5_path}")

        gradient_magnitude = None
        if "train_acc" in f:
            gradient_magnitude = np.array(f["train_acc"])
        elif "test_acc" in f:
            gradient_magnitude = np.array(f["test_acc"])

    loss = np.nan_to_num(loss, nan=np.nanmax(loss) * 1.5)
    loss = np.clip(loss, 0, np.percentile(loss, 99))

    landscape_data = {
        "id": landscape_id,
        "label": label,
        "architecture": architecture,
        "dataset": dataset,
        "gridSize": loss.shape[0],
        "alphaRange": [float(xcoordinates[0]), float(xcoordinates[-1])],
        "betaRange": [float(ycoordinates[0]), float(ycoordinates[-1])],
        "loss": loss.tolist(),
    }

    if gradient_magnitude is not None:
        landscape_data["gradientMagnitude"] = gradient_magnitude.tolist()

    landscape_data["notes"] = "Converted from paper authors' HDF5 format"

    output_path = Path(output_dir) / f"{landscape_id}.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w") as f:
        json.dump(landscape_data, f)

    gzip_path = output_path.with_suffix(".json.gz")
    with gzip.open(gzip_path, "wt", encoding="utf-8") as f:
        json.dump(landscape_data, f)

    print(f"Saved: {output_path}")
    print(f"Saved: {gzip_path}")

    return str(output_path)


def main():
    parser = argparse.ArgumentParser(
        description="Convert HDF5 loss landscape to JSON"
    )
    parser.add_argument("--input", "-i", required=True, help="Input HDF5 file")
    parser.add_argument(
        "--output",
        "-o",
        default="../frontend/public/landscapes/",
        help="Output directory",
    )
    parser.add_argument("--id", required=True, help="Landscape ID (e.g., resnet56_short)")
    parser.add_argument("--label", required=True, help="Display label")
    parser.add_argument(
        "--architecture", default="resnet56", help="Architecture name"
    )
    parser.add_argument("--dataset", default="cifar10", help="Dataset name")

    args = parser.parse_args()

    convert_h5_to_json(
        args.input,
        args.output,
        args.id,
        args.label,
        args.architecture,
        args.dataset,
    )


if __name__ == "__main__":
    main()
