from __future__ import annotations

import argparse
import base64
import tomllib
from pathlib import Path

from cryptography.hazmat.primitives import serialization

from .helpers import source_hash
from .integrations import build_integration


def base58_encode(value: bytes) -> str:
    alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    number = int.from_bytes(value, "big")
    encoded = ""
    while number:
        number, remainder = divmod(number, 58)
        encoded = alphabet[remainder] + encoded

    leading_zeroes = len(value) - len(value.lstrip(b"\x00"))
    return "1" * leading_zeroes + (encoded or "")


def source_hash_from_config(path: str) -> str:
    with open(path, "rb") as handle:
        config = tomllib.load(handle)
    integration = build_integration(config["source"])
    return source_hash(*integration.identity_parts())


def identity_raw_bytes(path: str) -> bytes:
    private = serialization.load_pem_private_key(
        Path(path).read_bytes(),
        password=None,
    )
    return private.public_key().public_bytes(
        serialization.Encoding.Raw,
        serialization.PublicFormat.Raw,
    )


def identity_raw_base64(path: str) -> str:
    return base64.b64encode(identity_raw_bytes(path)).decode("ascii")


def identity_solana(path: str) -> str:
    return base58_encode(identity_raw_bytes(path))


def main() -> None:
    parser = argparse.ArgumentParser(description="Inspect PowerChain Miner identity/config")
    sub = parser.add_subparsers(dest="command", required=True)

    source = sub.add_parser("source-hash")
    source.add_argument("--config", required=True)

    identity = sub.add_parser("identity-raw")
    identity.add_argument("--key", required=True)

    solana = sub.add_parser("identity-solana")
    solana.add_argument("--key", required=True)

    args = parser.parse_args()

    if args.command == "source-hash":
        print(source_hash_from_config(args.config))
    elif args.command == "identity-raw":
        print(identity_raw_base64(args.key))
    elif args.command == "identity-solana":
        print(identity_solana(args.key))


if __name__ == "__main__":
    main()
