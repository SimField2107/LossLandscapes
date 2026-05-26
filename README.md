# Loss Landscape Visualizer

An interactive, cinematic web visualization of neural network loss landscapes based on the research paper ["Visualizing the Loss Landscape of Neural Nets" (Li et al., 2018)](https://arxiv.org/pdf/1712.09913).

## Overview

This project creates a scrollytelling-style website that demonstrates how neural network architecture affects the optimization landscape. The key insight: **skip connections fundamentally reshape the loss landscape**, making it smooth and easy to optimize instead of chaotic and riddled with local minima.

## Features

- **Cinematic 3D Visualization**: Custom WebGL shaders with Viridis colormap, rim lighting, and postprocessing effects (bloom, vignette)
- **Scrollytelling Narrative**: Seven chapters that progressively explain the paper's methodology and findings
- **Interactive Morphing**: Watch the landscape transform between architectures with and without skip connections
- **Optimizer Trajectory**: Animated visualization of how SGD navigates the loss landscape
- **Interactive Explorer**: Free-roam mode with controls to switch architectures and color modes
- **Mathematical Typography**: Beautiful equations rendered with KaTeX
- **Responsive Design**: Works on desktop and mobile with smooth scroll (Lenis) and reduced motion support

## Tech Stack

### Frontend
- **Next.js 15** (App Router, TypeScript, static export)
- **React Three Fiber** + **drei** + **postprocessing** for 3D visualization
- **GSAP** + **ScrollTrigger** for scroll-based animations
- **Lenis** for smooth scrolling
- **Framer Motion** for element animations
- **Radix UI** for accessible interactive controls
- **SCSS Modules** for styling
- **KaTeX** for mathematical equations

### Compute (Offline)
- **Python** with PyTorch for loss landscape computation
- Pre-computed synthetic data mimicking the paper's results

## Project Structure

```
/
├── frontend/                    # Next.js application
│   ├── app/                     # App Router pages
│   ├── components/
│   │   ├── scene/               # 3D components (Canvas, Surface, Camera, Trajectory)
│   │   ├── chapters/            # Scrollytelling chapter components
│   │   └── ui/                  # Reusable UI components
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities and types
│   ├── styles/                  # SCSS tokens and mixins
│   └── public/landscapes/       # Pre-computed landscape data (JSON)
│
├── compute/                     # Python scripts for landscape generation
│   ├── generate_synthetic.py    # Generate synthetic landscapes
│   ├── convert_h5_to_json.py    # Convert paper's HDF5 data
│   ├── compute_landscape.py     # Full training + computation (GPU required)
│   └── models/                  # ResNet implementations
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+ (for landscape generation)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd LossLandscapes
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. (Optional) Generate fresh landscape data:
```bash
cd ../compute
python -m venv venv
source venv/bin/activate
pip install numpy scipy
python generate_synthetic.py --output ../frontend/public/landscapes/
```

### Development

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
```

The static site is exported to `frontend/out/` — ready to deploy on Vercel, Netlify, or any static host.

## Deployment

This project is configured for static export. Deploy to Vercel with zero configuration:

```bash
npm i -g vercel
vercel
```

## The Math

The visualization shows a 2D slice through the high-dimensional loss landscape:

$$f(\alpha, \beta) = L(\theta^* + \alpha\delta + \beta\eta)$$

Where:
- $\theta^*$ = trained network weights (the "center" of our slice)
- $\delta, \eta$ = random direction vectors (filter-wise normalized)
- $\alpha, \beta$ = perturbation magnitudes
- $L$ = loss function (cross-entropy on CIFAR-10)

## Credits

### Original Research
- **Paper**: [Visualizing the Loss Landscape of Neural Nets](https://arxiv.org/abs/1712.09913)
- **Authors**: Hao Li, Zheng Xu, Gavin Taylor, Christoph Studer, Tom Goldstein
- **Conference**: NeurIPS 2018
- **Code**: [github.com/tomgoldstein/loss-landscape](https://github.com/tomgoldstein/loss-landscape)

### Visualization
This interactive implementation was created to make the paper's insights accessible through an immersive web experience.

## License

MIT
