# Home restyle previews

The before images show the Today screen on `main`; the after images show the Home restyle at 393 × 852. `narrow-te.png` checks 320 × 852, and `reader-te.png` shows the full-text reader. These are React Native Web browser previews, not native device screenshots.

The after previews use unmodified responses from the public Cheruvugattu temple stotrams, news and PHOTO gallery endpoints, alongside live `https://sohum.cc` panchangam/festival data. The temple gallery photograph decorates the cards; it does not identify a particular festival or stotram deity. No reference-app artwork or generated artwork is bundled.

The temple backend currently excludes the preview origin from its CORS policy. The browser verification harness supplies the same public GET responses with a permissive CORS header only in the test browser. The app has no proxy or CORS workaround. Native Expo Go fetches still need device verification.

A Telugu-capable Noto Sans Telugu font was injected into the Linux/local browser previews to render the script. The app adds no font dependency and uses device fonts.

Verified: Telugu/English UI, full API stotram/news text, View All lists, festival date selection, Bahula/Shukla days, independent panchangam rendering during a delayed temple response, wrapping at 320px, sharing the active carousel page, empty Telugu field fallbacks, and panchangam availability when temple requests fail. Typecheck, changed-file lint, and iOS/Android exports pass. Full-project lint retains two unrelated errors in `temple.tsx` and `PlaceInput.tsx`, plus 13 warnings.
