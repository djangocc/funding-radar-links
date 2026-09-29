# Agent notes

Read `README.md` before changing or deploying this extension. It contains the complete Chrome installation, configuration, verification, and update steps.

Keep the dashboard host configurable through the popup. Keep the Radar origin configurable with `https://47.79.37.237` as the default. This repository is loaded directly as an unpacked Manifest V3 extension, with no build step.

Run `node --test test/*.test.js` after logic changes. Reload the extension in `chrome://extensions` and refresh the dashboard before claiming a browser check passed. Do not put any particular dashboard brand or hostname in the extension's name or public instructions.
