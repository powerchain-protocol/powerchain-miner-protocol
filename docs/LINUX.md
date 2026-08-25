# Linux Deployment

See `/linux`.

The reference service uses:
- dedicated `powerchain-miner` user
- systemd
- read-only `/etc/powerchain-miner`
- writable `/var/lib/powerchain-miner`
- virtual environment under `/opt/powerchain-miner`
- journald logs

Recommended commands:

```bash
minerctl health
minerctl logs
minerctl queue
```

Do not run the miner agent as an unrestricted root process.
