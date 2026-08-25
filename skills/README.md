# PowerChain Agent Skills

This directory is the canonical source of truth for reusable AgentOS / ACP skills.

Shared skills must be self-contained:

```text
skills/<skill-name>/
├── SKILL.md
├── metadata.json
├── references/
└── examples/
```

Install or link them into agent runtimes:

```bash
make skills-codex
make skills-claude
```

Runtime locations:

```text
Codex       ~/.agents/skills/
Claude Code ~/.claude/skills/
```

Create uploadable ZIPs for Claude Desktop/web:

```bash
make skills-zip
```

Generated archives are written to:

```text
target/skills/
```

Project-specific Showcase skills may live under:

```text
showcase/<project-slug>/skills/<skill-name>/
```
