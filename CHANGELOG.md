# Changelog

## v6.0.0
### Changed
- Updated for gun v0.8 (thanks @sjones6!). The default export of `gun-level` is now `gun` v0.8 which has many breaking changes.

## v5.0.0
### Changed
- Gun's plugin system has changed a bunch between 0.3 and 0.4.<br />
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
