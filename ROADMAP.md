# AwareBC roadmap (by Josh Singer)

🟢 done · 🟠 in progress · 🔴 still to build. Updated Nov 25, 2026 (evening).

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
- 🔴 Firebase project for push alerts when the app is closed (send google-services.json)
- 🔴 Google sign-in setup (Google Cloud Client ID) — optional
- 🔴 Apple developer account ($99/yr) + Mac or cloud Mac for iPhone builds
Together:
- 🔴 Play listing: screenshots, description, content rating, Data safety form
- 🔴 Play closed test: 12+ testers for 14 days in a row (new personal accounts)
- 🔴 iPhone native features to pass Apple's "more than a website" rule (4.2)
- 🔴 Owner tool: delete a rider by tag (for emailed deletion requests)

## 🟢 Done for production
- 🟢 Polish pass + older-phone speed-ups
- 🟢 Live planes for everyone (hidden key) + FlyItalyADSB credits
- 🟢 Full in-app account deletion (Settings ▸ Account)
- 🟢 Anonymous crash reports + owner view
- 🟢 Check data sources screen; last saved data shown when a feed is down
- 🟢 Free-tier headroom (planes 10 s, quiet friends checks)
- 🟢 Accessibility pass (44 px chips, tap areas, screen-reader messages)
- 🟢 Support page (support.html) + awarebc.help@gmail.com

Suggested order: release key → Play account → Firebase push → Play listing + closed test → iPhone.

