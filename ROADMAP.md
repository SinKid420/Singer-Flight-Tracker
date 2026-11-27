# AwareBC roadmap (by Josh Singer)

🟢 done · 🟠 in progress · 🔴 still to build. Updated Nov 26, 2026.

## 🟢 Finished
- 🟢 Live map (satellite, street, 3D), On-road / Off-road modes
- 🟢 Live planes for everyone (FlyItalyADSB key hidden on the server as FIA_KEY)
- 🟢 Road closures, highway cameras, ferries, airports, weather, temperature, rain/snow effects
- 🟢 Wildfires, Alerts / Emergency hub (shows last saved while loading), space weather
- 🟢 Avalanche & winter info, sled zones, trails & FSR roads
- 🟢 Rig Link: nearby riders, profiles, badges, 20-colour top-down rigs that turn with you
- 🟢 Friends, groups, chat, SOS, block/report, delete my friends & chat data
- 🟢 Showroom, trail reports, add a place
- 🟢 Directions + driving mode
- 🟢 Aware voice co-pilot with volume meter
- 🟢 Tools page, Layers page, safety timer, survival tools
- 🟢 Offline maps, Home card (ETA, sunset), works with no signal
- 🟢 Welcome screens, quick tour, update pop-up, back button closes pages
- 🟢 Rough-area fallback + GPS check
- 🟢 Privacy, Terms & Rider Rules page
- 🟢 Automatic smoke + regression tests (tests/run.sh)

## 🟠 In progress
- 🟠 Live testing on real devices (map rotation ✓ on phone; desktop Chrome location still blocked)
- 🟢 Android release signing key + .aab store bundle (AwareBC-store.aab on the android-store release)

## 🔴 Still to build (app stores)
You:
- 🔴 Google Play developer account ($25 once)
- 🔴 Google sign-in setup (Google Cloud Client ID) — optional
- 🔴 Apple developer account ($99/yr) + Mac or cloud Mac for iPhone builds
Together:
- 🟠 Play listing: pack ready (doc + graphics); fill it in once the Play account exists
- 🔴 Play closed test: 12+ testers for 14 days in a row (new personal accounts)
- 🔴 iPhone native features to pass Apple's "more than a website" rule (4.2)

## 🟢 Done for production
- 🟢 Trust: source + age on alerts, score explained, layer freshness, 'Couldn't check' instead of false 'None'
- 🟢 Simpler Layers/Tools with folded 'More'
- 🟢 Battery saver offer at 20%
- 🟢 'Why we ask' cards before permissions (Play prominent disclosure)
- 🟢 Rider name + password login (password never leaves the phone)
- 🟢 'What works with no signal' card on Save maps
- 🟢 Closed-app alerts in the Android app (Firebase)
- 🟢 Android crash test on virtual Android 13 + 14: no crashes ([crashtest] in a commit runs it)
- 🟢 Owner tool: delete a rider by tag
- 🟢 Pick my spot on the map (when location is blocked)
- 🟢 Tester invite page (testers.html)
- 🟢 Own map rotation code (no GPL), README, License, community files
- 🟢 Polish pass + older-phone speed-ups
- 🟢 Live planes for everyone (hidden key) + FlyItalyADSB credits
- 🟢 Full in-app account deletion (Settings ▸ Account)
- 🟢 Anonymous crash reports + owner view
- 🟢 Check data sources screen; last saved data shown when a feed is down
- 🟢 Free-tier headroom (planes 10 s, quiet friends checks)
- 🟢 Accessibility pass (44 px chips, tap areas, screen-reader messages)
- 🟢 Support page (support.html) + awarebc.help@gmail.com

Suggested order: release key → Play account → Firebase push → Play listing + closed test → iPhone.

