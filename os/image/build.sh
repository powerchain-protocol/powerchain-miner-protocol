#!/usr/bin/env bash
set -euo pipefail

cat <<'EOF'
PowerChain Renewable Miner OS image profile
===========================================

Base image:
  Raspberry Pi OS Lite 64-bit
  Debian 13 (Trixie)
  Kernel 6.18 or later supported Raspberry Pi OS security update

Recommended production image workflow:
  1. Flash Raspberry Pi OS Lite 64-bit with Raspberry Pi Imager.
  2. Preconfigure hostname, SSH key and Wi-Fi/Ethernet settings in Imager.
  3. Copy the PowerChain repository to /opt/powerchain-source.
  4. Run:
       POWERCHAIN_SOURCE_ROOT=/opt/powerchain-source sudo /opt/powerchain-source/os/install.sh
  5. Configure /etc/powerchain-miner/config.toml.
  6. Remove the bootstrap token after successful enrollment.
  7. Start and verify powerchain-miner.service.

This repository treats "Miner OS" as a hardened, reproducible Raspberry Pi OS profile
instead of maintaining a separate Linux kernel/distribution fork.
EOF
