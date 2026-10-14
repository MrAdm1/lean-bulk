# Lean Bulk

A phone app for a lean bulk: tick off meals, log the morning weight, keep gym weights up to date, and follow the weekly shop and prep.

It's a Progressive Web App: open the site in Safari on iPhone, tap Share → Add to Home Screen, and it runs full screen with its own icon, offline included.

Data is stored on the phone and synced to a private GitHub repo (`lean-bulk-data`) with a fine-grained token entered in Settings, so it can also be read and analysed elsewhere.

## Develop

```bash
npm install
npm run dev        # local dev server
npm run typecheck
npm run build      # dist/ + service worker
npm run deploy     # build and publish to the gh-pages branch
npm run icons      # regenerate public/icons
```
