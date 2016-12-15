# Changelog

## v5.0.0
### Changed
- Gun's plugin system has changed a bunch between 0.3 and 0.4.\
`gun-level` v0.5 drops support for 0.3 in favor of gun's [new version](https://github.com/amark/gun/tree/0.5).

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
