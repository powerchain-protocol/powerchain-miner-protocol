# Target

`target/` is primarily generated build output and must not be treated as source.

The repository retains only:
- `target/manifests/*.json` — network deployment placeholders/records
- `target/idl/.gitkeep` — expected Anchor IDL output location

Compiled binaries, keypairs, cache files and deployment secrets must remain untracked.
