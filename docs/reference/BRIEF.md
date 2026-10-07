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
- **Monthly observances** (Ekadashi, Pournami, Amavasya, Sankashta Chaturthi, Masa Shivaratri, Shani Trayodashi, Pitru Tarpanam, Maha Shivaratri) come from `GET /v1/tithi-days?start_date=&end_date=&latitude=&longitude=`. It returns `days.<type>` lists of `{date, weekday, tithi_at_sunrise}`.
  - Use `masa_shivaratri` (sunset rule), not `masa_shivaratri_midnight`.
  - Show `pitru_tarpanam` only when `differs_from_amavasya` is true, so it doesn't repeat Amavasya.
  - Big festivals stay on `GET /v1/festivals`.
- **Pradosham is not in the API.** Leave it out rather than computing or guessing it.
- **Never invent values.** The API does **not** provide Amrita Kalam or the rashi end time, so leave them out.
- `muhurta.durmuhurtham` and `yoga.name_te` / `karana.name_te` are optional. Show them only when present.
- Reuse the existing helpers. Don't hardcode panchang values in UI code.

## Temple content APIs (stotrams, news, gallery)
Stotrams and other temple content come from the Cheruvugattu temple backend, not the panchangam API.
- **Base URL:** `https://spjrsd-backend.onrender.com/api`. The app already calls it for sevas: copy the pattern in `src/api/temple.ts` (`TEMPLE_API_BASE`, typed `fetch`, throw on `!res.ok`).
- **Read only:** use only the public `GET` routes below. Never call `/admin/...` routes, `POST` routes or anything that needs login.
- **Speed:** the backend is on Render and can take several seconds on a cold start. Show a loading state, and don't let these calls block the panchangam screens.

| Route | Returns |
|---|---|
| `GET /stotrams` | Active stotrams in display order. Optional `?seva_id=` filter |
| `GET /stotrams/slug/{slug}` | One active stotram by slug (404 if not found) |
| `GET /stotrams/{id}` | One stotram by id |
| `GET /news` | Up to 50 active announcements, newest first; past `event_date` items are already filtered out |
| `GET /news/{id}` | One announcement |
| `GET /live-blog` | Live-blog posts, pinned first. Optional `?event_name=`, `?limit=` |
| `GET /live-blog/events` | Distinct event names with active posts |
| `GET /gallery` | Up to 50 temple photos/videos. Optional `?media_type=PHOTO` |
| `GET /sevas`, `GET /sevas/{id}` | Sevas (already typed as `Seva` in `src/api/temple.ts`) |

**Fields:**
- **Stotram:**
  - `id`, `slug`, `title`, `title_telugu`, `text_telugu` (the full text, Telugu script, may be long), `deity` (e.g. `"Shiva"`);
  - `seva_id` (or `null`), `display_order`, `active_flag`, `created_at`.
- **News:** `id`, `title`, `title_telugu`, `content`, `content_telugu`, `is_important`, `event_date` (`YYYY-MM-DD` or `null`), `active_flag`, `created_at`.
- **Live blog:** `id`, `event_name`, `event_name_telugu`, `title`, `title_telugu`, `content`, `content_telugu`, `image_url`, `is_pinned`, `posted_at`.
- **Gallery:** `id`, `title`, `image_url`, `category` (e.g. `"Deities"`, `"Temple"`), `media_type` (e.g. `"PHOTO"`), `created_at`.

**Notes:**
- `image_url` may be absolute (Cloudflare R2) or a relative path like `/Assets/Main_Temple_Full_View_Up_Hill.webp`. Relative paths are served from `https://cheruvugattu.online`, so prefix that origin.
- The temple's own gallery photos are the right artwork for Home-style image cards, instead of copying the reference app's images.
- Telugu fields (`*_telugu`) can be empty strings. Fall back to the English field.

## Suggested priorities
1. **Calendar tab:** restyle the header, month nav and grid to match IMG_6162, and polish DayPanel spacing and typography against IMG_6162–6167.
2. **Tab bar:** outline icons, orange active state with a top indicator bar.
3. **More tab:** settings-style icon rows and segmented tabs (IMG_6169–6171).
4. **Optional:** turn Today into a Home-style feed (today's panchang summary card, upcoming-festival rail, stotram rail, temple news), using only data and assets we own. Stotrams, news and temple photos come from the temple content APIs above; add typed fetchers for them in `src/api/temple.ts`.

## Verify before opening the PR
- `npx tsc --noEmit` passes.
- `npx expo export --platform ios --platform android` builds.
- Run in Expo Go with `npx expo start --tunnel` (LAN mode doesn't reach the phone on this network). Check Telugu and English, long Telugu labels wrapping, and both a Shukla and a Bahula day.
- Put before/after screenshots in the PR description.
