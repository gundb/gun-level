# Changelog

## v4.0.1
### Fixed
- Plugin system compatibility improvements (thanks swhgoon!).
- React Native babel configuration conflicts resolved.

## v4.0.0
### Added:
 - `changelog` file.

### Removed:
 - Every configuration option previously available. Now, only `level` is accepted, and it must be set to a `levelup` compatible instance. **Please note this is a breaking change**.
 - `levelup`/`leveldown` dependencies, allowing better windows and browser compatibility.
