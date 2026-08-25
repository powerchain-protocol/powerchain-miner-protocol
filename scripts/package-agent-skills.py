#!/usr/bin/env python3
from pathlib import Path
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / "skills"
OUT = ROOT / "target" / "skills"
OUT.mkdir(parents=True, exist_ok=True)

for skill in sorted(p for p in SKILLS.iterdir() if p.is_dir()):
    archive = OUT / f"{skill.name}.zip"
    if archive.exists():
        archive.unlink()

    with zipfile.ZipFile(
        archive,
        "w",
        compression=zipfile.ZIP_DEFLATED,
    ) as zf:
        for path in sorted(skill.rglob("*")):
            if not path.is_file():
                continue
            zf.write(
                path,
                Path(skill.name) / path.relative_to(skill),
            )

    with zipfile.ZipFile(archive, "r") as zf:
        bad = zf.testzip()
        if bad:
            raise SystemExit(
                f"{archive}: corrupt member {bad}"
            )

    print(archive.relative_to(ROOT))
