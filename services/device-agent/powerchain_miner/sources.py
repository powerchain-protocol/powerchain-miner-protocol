"""Compatibility wrapper. New code should use powerchain_miner.integrations."""
from .integrations import build_integration

def build_source(config):
    return build_integration(config)
