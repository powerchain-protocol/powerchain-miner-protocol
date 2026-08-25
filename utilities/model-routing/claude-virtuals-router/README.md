# Claude Code → PowerChain Agent Compute

Claude Code Router (`ccr`) is the terminal routing layer.

Maintained template:

```text
utilities/model-routing/claude-virtuals-router/config.example.json
```

The provider points directly at:

```text
https://compute.powerchain.energy/v1/chat/completions
```

and reads:

```text
POWERCHAIN_COMPUTE_API_KEY
```

from the environment.

Use the setup command instead of copying the template manually:

```bash
make claude-setup MODEL=claude-sonnet-4-6
```

The switcher validates `MODEL` against the live Agent Compute `/models` endpoint before it
writes `~/.claude-code-router/config.json`.

`make claude-off` restores the exact configuration that existed before PowerChain routing
was enabled. If the managed file changed while routing was enabled, restoration refuses to
overwrite those changes unless `FORCE=1` is supplied.
