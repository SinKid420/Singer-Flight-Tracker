# AwareBC tests

Run everything: `bash tests/run.sh` (or `bash tests/run.sh smoke` for the quick check).

- **smoke.cjs** (about 1 min): the app opens in On-road and Off-road with no errors, and every main page
  (Layers, Alerts, Tools, Profile, Search, Rig Link) opens, fits a 360×640 phone screen and closes.
- **regression.cjs** (about 6 min): one check for each fix and new screen — welcome, quick tour, location help
  (phone and computer), rough-area fallback, GPS check, Layers busy warning, Tools, Profile, no piling-up pages,
  Alerts showing the last check, Off-road tab bar, Aware volume bars, rigs from above in 20 colours,
  the Update available card, and that every script's version is in the offline list.

All outside data (maps, weather, planes, fires) is faked, so the tests run with no internet.
The AwareBC server runs locally from a copy of SinKid420/awarebc (set `AWSRV` to its `src/index.js`).
