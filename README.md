# Charlotte Coffee Atlas

A curated guide to sixteen Charlotte coffee shops, organized by atmosphere rather than menu.

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
under `photos.space` (interior and exterior) or `photos.food`.

Ratings, prices and closing times come from Google listings (October 2026). Opening times,
weekend hours, crowd curves and workability are estimates and should be checked against
each shop's listing.
