# Charlotte Coffee Atlas

A curated guide to sixteen Charlotte coffee shops, organized by atmosphere rather than menu.

- **Entry page** — a sketched French cafe cup; tap it to pour in (`splash.js`). Plays on every visit and refresh.
- **Music** — an original lofi-jazz loop generated in the browser (`music.js`), with an on/off button.
- **Light and dark** — follows the device until the visitor picks one with the header switch.

- **Map and list views** — hover a shop in the list to light up its pin; hover a pin for a photo preview; click either for the full profile.
- **Atmosphere** — a headline, a short description, sound and lighting, and photos of the space (food and drink photos are kept in a separate tab).
- **Hours** — full week, with sorting by open latest, opens earliest and longest hours.
- **Workability** — a score out of 5 with seating, outlets, Wi-Fi and laptop policy.
- **Crowd levels** — an estimated hour-by-hour chart for any day, plus a "Not busy" filter.
- **Visiting** — pick a day and time and every status, filter and crowd reading updates to match.

## Run it

No build step. Serve the folder with any static server:

```
python3 -m http.server 8000
```

then open http://localhost:8000.

## Editing shops

All shop data lives in `data.js`. Photos live in `images/` and are referenced by file name
under `photos.space` (interior and exterior) or `photos.food`. The list, map and gallery thumbnails
use the smaller copies in `images/thumbs/` (640px wide), so add one there for every new photo.

After changing any file, bump the `?v=` number on the file links in `index.html` so visitors'
browsers load the new version instead of an old saved copy.

Coordinates, hours, ratings, review counts and photos come from Google Maps via the Places API
(October 2026). Each photo's author is stored under `photos.credits` and shown in the gallery.
Crowd curves and workability are estimates.

## Live ratings and hours

Put a Google API key in `config.js` and opening a shop checks its current rating, review count
and hours with Google (one lookup per shop opened, remembered in the browser for 12 hours).
The list and map use the saved values in `data.js` until then. The key is public, so restrict it
to this site's address and to the Places API (New), and cap its daily usage in Google Cloud.
