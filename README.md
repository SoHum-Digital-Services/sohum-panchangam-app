# SoHum Panchangam app

Expo (React Native) app for the SoHum panchangam; preview it with `npx expo start` and Expo Go.

## Website (panchangam.sohum.cc)

The same app is built as a static website and served by a Cloudflare Worker (`wrangler.jsonc`, static assets only).
In Cloudflare, Workers & Pages → the `sohum-panchangam-web` Worker → Settings → Builds is connected to this repository:
build command `npm run build:web`, deploy command `npx wrangler deploy`. Every merge to `main` redeploys the site.
