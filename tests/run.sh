#!/bin/bash
# Runs the AwareBC tests on this computer: smoke test first (1 min), then the regression tests (about 6 min).
#   bash tests/run.sh          → both
#   bash tests/run.sh smoke    → smoke test only
# Needs: Node 22+, Playwright with Chromium, and a copy of the AwareBC server (SinKid420/awarebc) — set AWSRV to its src/index.js.
cd "$(dirname "$0")/.."
AWSRV="${AWSRV:-$(cd ..; pwd)/awarebc-srv/src/index.js}"; [ -f "$AWSRV" ] || AWSRV=/home/claude/work/awarebc-srv/src/index.js
export AWSRV="file://$AWSRV"
[ -n "$NODE_PATH" ] || export NODE_PATH="$(npm root -g 2>/dev/null):/opt/npm-tools/node_modules"
python3 -m http.server 8766 >/dev/null 2>&1 & WEB=$!
node tests/helpers/server.mjs >/dev/null 2>&1 & API=$!
trap 'kill $WEB $API 2>/dev/null' EXIT
sleep 2
node tests/smoke.cjs; S=$?
[ "$1" = "smoke" ] && exit $S
node tests/regression.cjs; R=$?
echo; [ $S -eq 0 ] && [ $R -eq 0 ] && echo "ALL TESTS PASSED ✅" || echo "SOME TESTS FAILED ❌"
exit $((S+R))
