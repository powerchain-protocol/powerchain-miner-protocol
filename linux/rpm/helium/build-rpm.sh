#!/usr/bin/env bash
set -euo pipefail

kind="${1:-}"
version="${HELIUM_VERSION:-}"
binary="${HELIUM_BINARY:-}"

case "$kind" in
  gateway)
    package="powerchain-helium-gateway"
    binary_name="helium_gateway"
    ;;
  multi-gateway)
    package="powerchain-helium-multi-gateway"
    binary_name="helium-multi-gateway"
    ;;
  *)
    echo "Usage: HELIUM_BINARY=/path HELIUM_VERSION=x.y.z $0 gateway|multi-gateway" >&2
    exit 2
    ;;
esac

[[ -n "$version" ]] || {
  echo "HELIUM_VERSION is required." >&2
  exit 2
}
[[ "$version" =~ ^[0-9]+([.][0-9A-Za-z_-]+)*$ ]] || {
  echo "HELIUM_VERSION contains unsupported RPM characters." >&2
  exit 2
}
[[ -f "$binary" ]] || {
  echo "HELIUM_BINARY must point to an existing upstream binary." >&2
  exit 2
}
command -v rpmbuild >/dev/null 2>&1 || {
  echo "rpmbuild is required." >&2
  exit 1
}

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
top="$work/rpmbuild"
mkdir -p "$top"/{BUILD,BUILDROOT,RPMS,SOURCES,SPECS,SRPMS}

install -m 0755 "$binary" "$top/SOURCES/$binary_name"

cat > "$top/SPECS/$package.spec" <<SPEC
Name:           $package
Version:        $version
Release:        1%{?dist}
Summary:        PowerChain compatibility packaging for Helium $binary_name
License:        Apache-2.0
BuildArch:      %{_arch}
Source0:        $binary_name

%description
PowerChain compatibility RPM wrapping an explicitly supplied Helium upstream binary.
This package is not an official Helium distribution artifact.

%install
mkdir -p %{buildroot}%{_bindir}
install -m 0755 %{SOURCE0} %{buildroot}%{_bindir}/$binary_name

%files
%{_bindir}/$binary_name

%changelog
* Tue Aug 25 2026 PowerChain Maintainers <maintainers@powerchain.energy> - $version-1
- PowerChain compatibility package
SPEC

rpmbuild \
  --define "_topdir $top" \
  -bb "$top/SPECS/$package.spec"

mkdir -p target/rpms
find "$top/RPMS" -type f -name '*.rpm' -exec cp {} target/rpms/ \;
echo "RPM copied to target/rpms/"
