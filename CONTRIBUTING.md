# Contributing to AwareBC

Thanks for helping make AwareBC better. AwareBC is owned by Josh Singer and is **not open source** (see [LICENSE](LICENSE)), but bug reports, ideas and fixes are welcome.

## Report a bug

1. Check the [open issues](https://github.com/SinKid420/Singer-Flight-Tracker/issues) first.
2. Open a new issue with the **Bug report** template.
3. Include your phone or computer, browser or app version (Settings ▸ App updates), what you did, and what happened.
4. A screenshot helps a lot. Hide your location and rider tag first.

## Suggest an idea

Open an issue with the **Feature idea** template. Say whether it's for **On-road**, **Off-road** or both, and who it helps.

## Security problems

Don't open a public issue. Follow [SECURITY.md](SECURITY.md).

## Send a fix (pull request)

1. Fork the repo and make a branch from `main`.
2. Keep the style: small, dependency-free ES5 modules (one IIFE per file) that talk through `window.__…` hooks.
3. Every screen must fit a 360×640 phone with no overlap, and keep working with no signal.
4. Use only free data sources, and never put private keys in the code.
5. When you change a file, bump its `?v=` number in `index.html`, `sw.js` and `offline.js`, and bump the cache name in `sw.js`.
6. Run the tests and make sure they pass:
   ```
   bash tests/run.sh
   ```
7. Open a pull request using the template, with screenshots for anything you can see.

By sending a pull request you agree that Josh Singer may use and publish your change in AwareBC under the project's [LICENSE](LICENSE).

## Be kind

Everyone here follows the [Code of Conduct](CODE_OF_CONDUCT.md).
