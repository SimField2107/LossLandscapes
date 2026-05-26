import type { Metadata, Viewport } from "next";
import { Inter, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.scss";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Loss Landscape Visualizer | Neural Network Optimization",
  description:
    "An interactive visualization of neural network loss landscapes based on Li et al. (2018). Explore how network architecture affects the optimization landscape.",
  keywords: [
    "neural networks",
    "deep learning",
    "loss landscape",
    "optimization",
    "visualization",
    "ResNet",
    "skip connections",
  ],
  authors: [{ name: "Li et al.", url: "https://arxiv.org/abs/1712.09913" }],
  openGraph: {
    title: "Loss Landscape Visualizer",
    description:
      "Interactive 3D visualization of neural network loss landscapes",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loss Landscape Visualizer",
    description:
      "Interactive 3D visualization of neural network loss landscapes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
