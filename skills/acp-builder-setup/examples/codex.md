# Codex example

```bash
export POWERCHAIN_COMPUTE_API_KEY=pc_compute_...
make model-check MODEL=openai-gpt-55
make codex-setup MODEL=openai-gpt-55
```

In another terminal:

```bash
export POWERCHAIN_COMPUTE_API_KEY=pc_compute_...
make codex-proxy
```

Then:

```bash
codex
```
