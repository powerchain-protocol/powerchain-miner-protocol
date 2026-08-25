# Agent setup matrix

| Runtime | Shared skills | Routing config | Extra router/proxy | Launch |
|---|---|---|---|---|
| Codex | `~/.agents/skills/` | `~/.codex/config.toml` | PowerChain Responses translator | `codex` |
| Claude Code | `~/.claude/skills/` | `~/.claude-code-router/config.json` | Claude Code Router | `ccr code` |
| Claude Desktop/web | upload ZIP | application-managed | none from terminal skill | upload skill ZIP |

Model IDs must come from the live Agent Compute `/models` endpoint.
