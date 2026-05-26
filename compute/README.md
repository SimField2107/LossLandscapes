# Loss Landscape Compute Scripts

Offline computation scripts for generating loss landscape data based on
[Li et al. (2018) "Visualizing the Loss Landscape of Neural Nets"](https://arxiv.org/abs/1712.09913).

## Setup

```bash
cd compute
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Scripts

### convert_h5_to_json.py (Primary)

Converts HDF5 loss landscape files from the paper's authors into our JSON format.

**Source data:** https://github.com/tomgoldstein/loss-landscape

```bash
python convert_h5_to_json.py --input path/to/surface.h5 --output ../frontend/public/landscapes/
```

### generate_synthetic.py (Development)

Generates synthetic landscape data that mimics the visual characteristics of real
loss landscapes. Useful for development when real data isn't available.

```bash
python generate_synthetic.py --output ../frontend/public/landscapes/
```

### compute_landscape.py (Fallback)

Full pipeline: trains a model on CIFAR-10 and computes the loss landscape from scratch.
Requires GPU and takes significant time.

```bash
python compute_landscape.py --model resnet56 --skip-connections --output ../frontend/public/landscapes/
```

### trajectory.py

Logs optimizer trajectory during training and projects it onto the loss landscape plane.

```bash
python trajectory.py --model resnet56 --epochs 100 --output ../frontend/public/landscapes/
```

## Data Format

Output JSON files follow this schema:

```json
{
  "id": "resnet56_short",
  "label": "ResNet-56 (with skip connections)",
  "architecture": "resnet56",
  "dataset": "cifar10",
  "gridSize": 51,
  "alphaRange": [-1.0, 1.0],
  "betaRange": [-1.0, 1.0],
  "loss": [[...], ...],
  "gradientMagnitude": [[...], ...],
  "trajectory": [{"alpha": 0, "beta": 0, "loss": 2.3}, ...],
  "notes": "Filter-wise normalized directions"
}
```

## References

- Paper: https://arxiv.org/abs/1712.09913
- Authors' code: https://github.com/tomgoldstein/loss-landscape
