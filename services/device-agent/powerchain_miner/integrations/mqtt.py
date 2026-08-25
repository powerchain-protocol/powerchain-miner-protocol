from __future__ import annotations

class MqttIntegration:
    """
    Reserved integration contract.

    Production MQTT support should use a persistent client with TLS, broker identity
    verification, bounded reconnect behavior and a local last-value cache. It is kept
    explicit rather than silently adding a runtime broker dependency.
    """
    name = "mqtt"

    def __init__(self, *_args, **_kwargs):
        raise RuntimeError(
            "MQTT adapter is not enabled in the base image. "
            "Install the optional MQTT extra and configure TLS before use."
        )
