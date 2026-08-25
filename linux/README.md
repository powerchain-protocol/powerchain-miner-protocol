# Linux Support

PowerChain Renewable Miner supports systemd-based Linux distributions.

Validated deployment targets by design:

- Raspberry Pi OS Lite 64-bit (Debian)
- Debian 13+
- Ubuntu Server 24.04 LTS / 26.04 LTS style systemd environments
- ARM64 and x86_64 where Python dependencies are available

The device node does not require Docker.

## Install

```bash
sudo POWERCHAIN_SOURCE_ROOT="$PWD" ./linux/install.sh
sudoedit /etc/powerchain-miner/config.toml
sudo systemctl enable --now powerchain-miner
```

## Operations

```bash
sudo ./command/minerctl status
sudo ./command/minerctl health
sudo ./command/minerctl logs
sudo ./command/minerctl restart
sudo ./command/minerctl queue
```
