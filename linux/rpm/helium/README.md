# PowerChain Helium RPM Compatibility Packages

These are **PowerChain-built compatibility RPMs**, not official Helium releases.

The builders package a local, explicitly selected upstream binary. They do not fetch
unversioned software from the network.

Build requirements:

```text
rpmbuild
install
bash
```

Example:

```bash
HELIUM_BINARY=/path/to/helium_gateway \
HELIUM_VERSION=1.2.3 \
./linux/rpm/helium/build-rpm.sh gateway

HELIUM_BINARY=/path/to/helium-multi-gateway \
HELIUM_VERSION=0.1.0 \
./linux/rpm/helium/build-rpm.sh multi-gateway
```

The input binary should be obtained from a trusted Helium release/build and verified before
packaging.
