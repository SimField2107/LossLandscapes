"""
ResNet-56 implementation for CIFAR-10.

Based on "Deep Residual Learning for Image Recognition" (He et al., 2016)
with modifications for loss landscape visualization (Li et al., 2018).
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


class BasicBlock(nn.Module):
    """Basic residual block with skip connection."""

    expansion = 1

    def __init__(
        self,
        in_planes: int,
        planes: int,
        stride: int = 1,
        use_shortcut: bool = True,
    ):
        super().__init__()
        self.use_shortcut = use_shortcut

        self.conv1 = nn.Conv2d(
            in_planes, planes, kernel_size=3, stride=stride, padding=1, bias=False
        )
        self.bn1 = nn.BatchNorm2d(planes)
        self.conv2 = nn.Conv2d(
            planes, planes, kernel_size=3, stride=1, padding=1, bias=False
        )
        self.bn2 = nn.BatchNorm2d(planes)

        self.shortcut = nn.Sequential()
        if stride != 1 or in_planes != self.expansion * planes:
            self.shortcut = nn.Sequential(
                nn.Conv2d(
                    in_planes,
                    self.expansion * planes,
                    kernel_size=1,
                    stride=stride,
                    bias=False,
                ),
                nn.BatchNorm2d(self.expansion * planes),
            )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))

        if self.use_shortcut:
            out += self.shortcut(x)

        out = F.relu(out)
        return out


class ResNet(nn.Module):
    """ResNet for CIFAR-10 (32x32 images)."""

    def __init__(
        self,
        block: type,
        num_blocks: list,
        num_classes: int = 10,
        use_shortcut: bool = True,
    ):
        super().__init__()
        self.in_planes = 16
        self.use_shortcut = use_shortcut

        self.conv1 = nn.Conv2d(3, 16, kernel_size=3, stride=1, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(16)

        self.layer1 = self._make_layer(block, 16, num_blocks[0], stride=1)
        self.layer2 = self._make_layer(block, 32, num_blocks[1], stride=2)
        self.layer3 = self._make_layer(block, 64, num_blocks[2], stride=2)

        self.linear = nn.Linear(64 * block.expansion, num_classes)

        self._initialize_weights()

    def _make_layer(
        self, block: type, planes: int, num_blocks: int, stride: int
    ) -> nn.Sequential:
        strides = [stride] + [1] * (num_blocks - 1)
        layers = []
        for stride in strides:
            layers.append(
                block(self.in_planes, planes, stride, use_shortcut=self.use_shortcut)
            )
            self.in_planes = planes * block.expansion
        return nn.Sequential(*layers)

    def _initialize_weights(self) -> None:
        for m in self.modules():
            if isinstance(m, nn.Conv2d):
                nn.init.kaiming_normal_(m.weight, mode="fan_out", nonlinearity="relu")
            elif isinstance(m, nn.BatchNorm2d):
                nn.init.constant_(m.weight, 1)
                nn.init.constant_(m.bias, 0)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.layer1(out)
        out = self.layer2(out)
        out = self.layer3(out)
        out = F.avg_pool2d(out, out.size()[3])
        out = out.view(out.size(0), -1)
        out = self.linear(out)
        return out


def ResNet56(num_classes: int = 10) -> ResNet:
    """ResNet-56 with skip connections."""
    return ResNet(BasicBlock, [9, 9, 9], num_classes=num_classes, use_shortcut=True)


def ResNet56NoShortcut(num_classes: int = 10) -> ResNet:
    """ResNet-56 without skip connections."""
    return ResNet(BasicBlock, [9, 9, 9], num_classes=num_classes, use_shortcut=False)
