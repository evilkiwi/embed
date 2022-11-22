# 1.1.1 (2022-11-22)

- Move back to Evil Kiwi (`@evilkiwi/embed`)
- Update dependencies

# 1.1.0 (2022-11-15)

- Updated dependencies
- Move to `@oyed`
- Move repository to PNPM

# 1.0.25 (2022-01-18)

- Improved logging
- Updated build-time dependencies

# 1.0.20 (2021-11-13)

- Send a manual event on initialization to get around iFrames that are ready before we register the `load` listener

# 1.0.19 (2021-10-19)

- Wait for iFrame load event before registering window

# 1.0.17 (2021-10-19)

- Disallow Host-mode IPC from defaulting to `window` when an iFrame reference isn't available

# 1.0.14 (2021-10-19)

- Remove runtime debugging

# 1.0.13 (2021-10-19)

- Ensure correct statement chaining to prevent localStorage access if runtime debugging is disabled

# 1.0.12 (2021-10-13)

- Optionally allow runtime debugging

# 1.0.11 (2021-10-13)

- Updated dependencies
- Improved Parent/Child example

# 1.0.10 (2021-08-30)

- Ensure Object payload can be serialized to JSON before sending

# 1.0.8 (2021-07-31)

- Added debug option

# 1.0.7 (2021-07-25)

- Fix the handling of asynchronous payloads
  - Includes serializing `Error` instances
- Fix handling of multiple instances not triggering the correct async callback
