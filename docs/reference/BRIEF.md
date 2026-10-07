# Task: Refine the SoHum Panchangam app UI to match the reference screenshots

## Repo
- **Repo:** `SoHum-Digital-Services/sohum-panchangam-app`.
- **Stack:** Expo SDK 57, expo-router, React Native 0.86, TypeScript.
- **Read `AGENTS.md` first:**
  - Use `npx expo install` for packages.
  - Never hand-edit `ios/` or `android/`.
  - Run `npx tsc --noEmit` before finishing.
- **Expo Go only:** the app must run in Expo Go. Don't add libraries with native code outside what Expo Go bundles. `react-native-svg` is already installed and fine to use.
- **Language:** Telugu is the default. Every label needs a Telugu (`te`) and English (`en`) version through `usePanchangamSettings().language`.
- **Delivery:** work on a new branch and open a PR. Don't push to `main`.

## Reference
Screenshots of the Vaidika Vignanam app are in this folder (`docs/reference/`). Copy its **layout and visual style only**. Do not reuse its logo, deity artwork or brand name.
- **IMG_6158–6160, Home:**
  - orange header, then a verse carousel card;
  - horizontal rails of image cards (cream caption strip, date badge in the corner), each with a Telugu section title and a grey "View All" link.
- **IMG_6161, Search:** a search field with a filter icon, plus an empty-state illustration.
- **IMG_6162–6167, Panchānga tab (the main target):**
  - white month grid: grey cells, festival icons under the dates, selected day as an orange rounded square, `‹ Month ›` with round orange arrows;
  - below it, a day panel with a left column (moon tile, big orange date, weekday, lunar day + month) and 6 swipeable pages with dots and a floating share button.
- **IMG_6168, Library:** Continue Reading card, 2×2 Quick Access grid, collection rails.
- **IMG_6169–6172, Settings:**
  - segmented tabs with an orange underline;
  - grey rounded rows with an orange square icon, a title, an orange value on the right and a chevron.
- **IMG_6173–6174:** dark iOS home-screen widgets. **Not** the in-app style, and widgets need a dev build, so they're out of scope.
- **Shared styling across all tabs:**
  - Background is white with a single orange accent. The app itself is light; dark appears only in the widgets.
  - Tab bar icons are outline style. The active tab is orange, with a short orange bar above it.

## Current state (already merged in PR #3)
- **Tabs:** `app/(tabs)/` contains `index` (Today), `calendar`, `festivals`, `temple` and `more`. Tab bar config is in `app/(tabs)/_layout.tsx`.
- **Calendar tab:** shows the month grid, then `src/components/DayPanel.tsx`.
  - Its six pages are built by `dayPages()` in `src/panchangamUi.ts`, in the reference order: Panchangam, Sankalpam, Upcoming Festivals, Auspicious/Inauspicious, Important Times, Additional Details.
  - The share button uses React Native's `Share` (text only).
  - The moon is drawn in `src/components/MoonPhase.tsx`.
- **Today tab:** still the older cream/maroon design.
- **Other code locations:**
  - colors: `src/theme.ts`
  - time formatting (`formatClock`, `formatClockOn`, which adds `(+1)` past midnight): `src/format.ts`
  - API: `src/api/client.ts`, with types in `src/api/types.ts`

## Data rules (important)
- The API is `https://sohum.cc` (which proxies `/v1/*` to the panchangam backend). Use `GET /v1/panchangam`, `POST /v1/panchangam/range` and `GET /v1/festivals`.
- **Never invent values.** The API does **not** provide Amrita Kalam or the rashi end time, so leave them out.
- `muhurta.durmuhurtham` and `yoga.name_te` / `karana.name_te` are optional. Show them only when present.
- Reuse the existing helpers. Don't hardcode panchang values in UI code.

## Suggested priorities
1. **Calendar tab:** restyle the header, month nav and grid to match IMG_6162, and polish DayPanel spacing and typography against IMG_6162–6167.
2. **Tab bar:** outline icons, orange active state with a top indicator bar.
3. **More tab:** settings-style icon rows and segmented tabs (IMG_6169–6171).
4. **Optional:** turn Today into a Home-style feed (today's panchang summary card, upcoming-festival rail, stotram rail), using only data and assets we own.

## Verify before opening the PR
- `npx tsc --noEmit` passes.
- `npx expo export --platform ios --platform android` builds.
- Run in Expo Go with `npx expo start --tunnel` (LAN mode doesn't reach the phone on this network). Check Telugu and English, long Telugu labels wrapping, and both a Shukla and a Bahula day.
- Put before/after screenshots in the PR description.
