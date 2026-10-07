/*
  Shop data for Charlotte Coffee Atlas.

  hours:   [open, close] in 24h decimal hours, per day (sun..sat). null = closed.
  crowd:   peak curves used to estimate how busy a shop is by hour.
           Each peak is [centerHour, intensity 0-100, spread in hours].
  work:    editorial read on how workable the space is (score out of 5).

  Ratings, review counts, prices and closing times come from Google listings
  (October 2026). Opening times, weekend hours, crowd curves and workability are
  estimates — confirm with the shop before planning around them.
*/

// Build a week of hours from a weekday range plus Saturday and Sunday ranges.
function week(weekday, sat, sun, overrides) {
  const days = [sun, weekday, weekday, weekday, weekday, weekday, sat];
  if (overrides) Object.entries(overrides).forEach(([d, v]) => (days[d] = v));
  return days;
}

const MORNING = [[8.5, 85, 1.3], [12.5, 55, 1.2]];
const MORNING_WEEKEND = [[10.5, 95, 1.8]];

window.SHOPS = [
  {
    id: "platform",
    name: "Platform Coffee + Kitchen",
    neighborhood: "Station West, FreeMoreWest",
    address: "901 Berryhill Rd, Charlotte, NC 28208",
    lat: 35.2335, lng: -80.8655,
    rating: 4.7, reviews: 559, price: 2, priceLabel: "$10–20",
    category: "Coffee shop and roastery",
    atmosphere: {
      headline: "Sunlit warehouse lounge",
      summary:
        "A community roastery set inside a former railroad warehouse. Exposed brick, floor-to-ceiling windows and woven pendant lights frame velvet sofas and blush armchairs, so the room reads more like a well-kept living room than a cafe. Daylight does most of the work here.",
      tags: ["Industrial brick", "Natural light", "Lounge seating", "Plants", "Roastery"],
      sound: "Moderate",
      lighting: "Bright, daylight",
    },
    work: { score: 4.5, seating: "Plentiful", outlets: "Good", wifi: "Yes", laptops: "Welcome", note: "Sofas for reading, tables for laptops. Arrive before 9 for a window seat." },
    hours: week([7, 18], [8, 18], [8, 17]),
    crowd: { weekday: [[8.5, 70, 1.4], [12.5, 80, 1.3]], weekend: [[11, 100, 2]] },
    photos: { space: ["platform-space-1.jpg"], food: ["platform-food-1.jpg"] },
  },
  {
    id: "rosies",
    name: "Rosie's Coffee & Wine Garden",
    neighborhood: "McGill Rose Garden, Optimist Park",
    address: "940 N Davidson St, Charlotte, NC 28206",
    lat: 35.2367, lng: -80.8226,
    rating: 4.8, reviews: 615, price: 2, priceLabel: "$10–20",
    category: "Coffee and wine bar",
    atmosphere: {
      headline: "Secret garden at golden hour",
      summary:
        "A boutique coffee and wine bar tucked inside the historic McGill Rose Garden. A coral door, string lights and cascading florals open onto two acres of roses — coffee in the morning, a glass of wine among the beds by evening. Mostly an outdoor experience.",
      tags: ["Garden", "Outdoor", "Romantic", "Historic", "Dog friendly"],
      sound: "Quiet to lively",
      lighting: "Daylight, string lights at night",
    },
    work: { score: 2, seating: "Limited indoors", outlets: "Few", wifi: "Limited", laptops: "Better for reading", note: "A place to unplug, not to set up for the afternoon." },
    hours: week([8, 22], [8, 23], [8, 22], { 5: [8, 23] }),
    crowd: { weekday: [[9, 35, 1.5], [18.5, 85, 1.8]], weekend: [[11, 70, 2], [19, 100, 2]] },
    photos: { space: ["rosies-space-1.jpg", "rosies-space-2.jpg"], food: [] },
  },
  {
    id: "hobbyist",
    name: "The Hobbyist",
    neighborhood: "Villa Heights, NoDa",
    address: "2100 N Davidson St, Charlotte, NC 28205",
    lat: 35.2405, lng: -80.8140,
    rating: 4.7, reviews: 670, price: 2, priceLabel: "$10–20",
    category: "Coffee shop and bottle shop",
    atmosphere: {
      headline: "Gallery-white market hall",
      summary:
        "Terrazzo floors, a clean white coffee bar and a skylit timber ceiling over shelves of wine and beer. It shifts from bright morning coffee counter to relaxed bottle-shop hangout after work, with communal high-tops in between.",
      tags: ["Minimal", "Skylights", "Bottle shop", "Communal tables", "Day to night"],
      sound: "Moderate",
      lighting: "Bright, skylit",
    },
    work: { score: 4, seating: "Plentiful", outlets: "Good", wifi: "Yes", laptops: "Welcome", note: "Strong daytime work spot. Gets social after 5." },
    hours: week([7, 21], [8, 22], [8, 20], { 5: [7, 22] }),
    crowd: { weekday: [[9, 60, 1.4], [13, 50, 1.5], [18.5, 75, 1.5]], weekend: [[11, 90, 2], [18, 85, 2]] },
    photos: { space: ["hobbyist-space-1.jpg", "hobbyist-space-2.jpg"], food: [] },
  },
  {
    id: "coco",
    name: "Coco and the Director",
    neighborhood: "Uptown",
    address: "100 W Trade St, Charlotte, NC 28202",
    lat: 35.2270, lng: -80.8430,
    rating: 4.4, reviews: 1194, price: 2, priceLabel: "$10–20",
    category: "Coffee shop",
    atmosphere: {
      headline: "Hotel-lobby polish",
      summary:
        "Dark wood, warm spotlighting and an open marketplace counter stocked with pastries and provisions. It has the composed, slightly cinematic feel of a hotel lobby bar — a reliable backdrop for meetings in the middle of Uptown.",
      tags: ["Moody wood", "Polished", "Meeting friendly", "Central", "Grab and go"],
      sound: "Moderate",
      lighting: "Warm, low",
    },
    work: { score: 4, seating: "Ample", outlets: "Good", wifi: "Yes", laptops: "Welcome", note: "Good for a one-on-one or an hour of email between meetings." },
    hours: week([6, 16], [7, 14], [7, 14]),
    crowd: { weekday: [[8, 95, 1.1], [12, 60, 1]], weekend: [[10, 55, 1.6]] },
    photos: { space: ["coco-space-1.jpg", "coco-space-2.jpg"], food: [] },
  },
  {
    id: "hex",
    name: "HEX Coffee, Kitchen & Natural Wines",
    neighborhood: "Camp North End",
    address: "201 Camp Rd Suite 103, Charlotte, NC 28206",
    lat: 35.2478, lng: -80.8355,
    rating: 4.6, reviews: 629, price: 2, priceLabel: "$10–20",
    category: "Cafe",
    atmosphere: {
      headline: "Cobalt and concrete",
      summary:
        "A specialty roaster's cafe with deep cobalt tables, numbered-order service and a leafy patio within the Camp North End campus. Considered and design-forward without feeling precious — come for a slow brunch outdoors.",
      tags: ["Specialty roaster", "Patio", "Design forward", "Brunch", "Natural wine"],
      sound: "Moderate",
      lighting: "Bright",
    },
    work: { score: 3, seating: "Moderate", outlets: "Some", wifi: "Yes", laptops: "Weekdays", note: "Weekday mornings are workable. Weekends turn into brunch." },
    hours: week([7, 17], [8, 17], [8, 17]),
    crowd: { weekday: MORNING, weekend: MORNING_WEEKEND },
    photos: { space: [], food: ["hex-food-1.jpg", "hex-food-2.jpg", "hex-food-3.jpg"] },
  },
  {
    id: "thousand-hills",
    name: "Thousand Hills Coffee",
    neighborhood: "LoSo",
    address: "4015 Craft St, Charlotte, NC 28217",
    lat: 35.1880, lng: -80.8800,
    rating: 4.6, reviews: 620, price: 1, priceLabel: "$1–10",
    category: "Coffee shop",
    atmosphere: {
      headline: "Lofty modern flagship",
      summary:
        "Soaring ceilings, oversized drum pendants and a long open bar with a full view of the baristas. Wood-slat details and big windows keep it warm and airy. Energetic in a good way — there is usually a line, and it moves.",
      tags: ["High ceilings", "Open bar", "Modern", "Bustling", "Roaster retail"],
      sound: "Lively",
      lighting: "Bright, warm pendants",
    },
    work: { score: 3.5, seating: "Ample", outlets: "Some", wifi: "Yes", laptops: "Welcome", note: "Plenty of seats, but it hums. Bring headphones." },
    hours: week([7, 17], [8, 17], [8, 17]),
    crowd: { weekday: [[8.5, 85, 1.5], [12.5, 65, 1.3]], weekend: [[10.5, 100, 2]] },
    photos: { space: ["thousand-hills-space-1.jpg", "thousand-hills-space-2.jpg"], food: [] },
  },
  {
    id: "babaloo",
    name: "Babaloo Coffee Club",
    neighborhood: "South End",
    address: "1425 Winnifred St #117, Charlotte, NC 28203",
    lat: 35.2105, lng: -80.8605,
    rating: 4.3, reviews: 291, price: 1, priceLabel: "$1–10",
    category: "Coffee shop",
    atmosphere: {
      headline: "Plaster walls and rattan light",
      summary:
        "Hand-troweled concrete walls, rattan pendants and a hand-lettered menu of playful drinks — tiramisu lattes, banana pudding, strawberry matcha. Warm, small and stylish; more of a stop-in than a sit-down.",
      tags: ["Textured plaster", "Rattan pendants", "Intimate", "Matcha", "Grab and go"],
      sound: "Moderate",
      lighting: "Warm, soft",
    },
    work: { score: 2.5, seating: "Limited", outlets: "Few", wifi: "Yes", laptops: "Short stays", note: "Great drinks, small footprint. Take it to go if it is full." },
    hours: week([7, 18], [8, 18], [8, 18]),
    crowd: { weekday: [[8.5, 70, 1.4], [15, 55, 1.6]], weekend: [[11.5, 90, 2.2]] },
    photos: { space: ["babaloo-space-1.jpg", "babaloo-space-2.jpg"], food: [] },
  },
  {
    id: "cool-idiot",
    name: "Cool Idiot Coffee",
    neighborhood: "South End",
    address: "1327 S Mint St, Charlotte, NC 28203",
    lat: 35.2160, lng: -80.8580,
    rating: 4.6, reviews: 38, price: 1, priceLabel: "$1–10",
    category: "Coffee shop",
    atmosphere: {
      headline: "Greenhouse loft",
      summary:
        "Roll-up garage doors, butcher-block tables and a ceiling hung with trailing plants. Sunlight pours across polished concrete, and the room feels open and unhurried. One of the newer additions to South End, and still a bit of a secret.",
      tags: ["Hanging plants", "Garage doors", "Airy", "Big tables", "New"],
      sound: "Quiet to moderate",
      lighting: "Bright, daylight",
    },
    work: { score: 4, seating: "Plentiful", outlets: "Good", wifi: "Yes", laptops: "Welcome", note: "Big tables and room to spread out. Closes at 3." },
    hours: week([7, 15], [8, 15], [8, 15]),
    crowd: { weekday: [[9, 50, 1.5], [12, 40, 1.2]], weekend: [[10.5, 75, 1.8]] },
    photos: { space: ["cool-idiot-space-1.jpg", "cool-idiot-space-2.jpg"], food: [] },
  },
  {
    id: "roots",
    name: "ROOTS Cafe",
    neighborhood: "South End",
    address: "2135 Southend Dr #109, Charlotte, NC 28203",
    lat: 35.2050, lng: -80.8620,
    rating: 4.4, reviews: 630, price: 2, priceLabel: "$10–20",
    category: "Cafe",
    atmosphere: {
      headline: "Shaded courtyard cafe",
      summary:
        "A farm-to-table cafe whose best seat is outside — white iron chairs and stone-topped tables under a canopy of mature trees. Calm and green, even in the middle of South End. Food leads here, with coffee alongside.",
      tags: ["Tree-lined patio", "Farm to table", "Calm", "Lunch spot", "Outdoor"],
      sound: "Quiet",
      lighting: "Dappled shade",
    },
    work: { score: 3, seating: "Moderate", outlets: "Few outdoors", wifi: "Yes", laptops: "Off-peak", note: "Lovely for a laptop between 9 and 11; lunch rush takes the tables." },
    hours: week([8, 15], [9, 15], [9, 15]),
    crowd: { weekday: [[9, 40, 1.2], [12.5, 95, 1]], weekend: [[11, 100, 1.6]] },
    photos: { space: ["roots-space-1.jpg"], food: ["roots-food-1.jpg"] },
  },
  {
    id: "not-just-coffee",
    name: "Not Just Coffee",
    neighborhood: "Dilworth",
    address: "2230 Park Rd #102, Charlotte, NC 28203",
    lat: 35.2005, lng: -80.8475,
    rating: 4.4, reviews: 356, price: 2, priceLabel: "$1–20",
    category: "Cafe",
    atmosphere: {
      headline: "Neighborhood bar with globe lights",
      summary:
        "Warm timber ceiling, globe pendants and a long wooden coffee bar lined with retail bags and plants. Brick outside, bright and friendly inside — the steady, familiar neighborhood cafe Dilworth leans on.",
      tags: ["Timber ceiling", "Globe pendants", "Neighborhood", "Brick", "Bright"],
      sound: "Moderate",
      lighting: "Bright, warm",
    },
    work: { score: 3.5, seating: "Moderate", outlets: "Some", wifi: "Yes", laptops: "Welcome", note: "Solid for a couple of hours. Takeout window closes at 3." },
    hours: week([7, 17], [8, 17], [8, 17]),
    crowd: { weekday: MORNING, weekend: MORNING_WEEKEND },
    photos: { space: ["not-just-coffee-space-1.jpg", "not-just-coffee-space-2.jpg"], food: [] },
  },
  {
    id: "fly-kid-fly",
    name: "Fly Kid Fly",
    neighborhood: "The Bowl at Ballantyne",
    address: "15119 Bowl St, Charlotte, NC 28277",
    lat: 35.0545, lng: -80.8455,
    rating: 4.5, reviews: 213, price: 1, priceLabel: "$1–10",
    category: "Coffee shop",
    atmosphere: {
      headline: "Cobalt-blue jewel box",
      summary:
        "Saturated cobalt walls, rounded built-in banquettes and a window bar of maple stools looking out on The Bowl. Graphic, cheerful and immaculately kept — a compact space with a lot of personality.",
      tags: ["Bold color", "Window bar", "Modern", "Compact", "Playful"],
      sound: "Moderate",
      lighting: "Bright, daylight",
    },
    work: { score: 3, seating: "Limited", outlets: "Some", wifi: "Yes", laptops: "Window bar", note: "The window counter is the move for a solo laptop session." },
    hours: week([7, 16], [8, 16], [8, 16]),
    crowd: { weekday: [[8.5, 70, 1.3], [12.5, 45, 1.2]], weekend: [[10.5, 90, 1.8]] },
    photos: { space: ["fly-kid-fly-space-1.jpg", "fly-kid-fly-space-2.jpg"], food: [] },
  },
  {
    id: "haraz",
    name: "Haraz Coffee House",
    neighborhood: "Madison Park, South Blvd",
    address: "3441 South Blvd C, Charlotte, NC 28209",
    lat: 35.1860, lng: -80.8700,
    rating: 4.7, reviews: 309, price: 2, priceLabel: "$10–20",
    category: "Yemeni coffee house",
    atmosphere: {
      headline: "Late-night Yemeni coffee lounge",
      summary:
        "Yemeni coffee traditions served with ceremony — cardamom-spiced lattes, honey cakes and pistachio pastries on dark trays. Floor-to-ceiling windows, cream chairs and a social, evening-forward energy. Open until 11, which is rare in this city.",
      tags: ["Late night", "Yemeni coffee", "Dessert", "Social", "Windows"],
      sound: "Lively after dark",
      lighting: "Warm, evening glow",
    },
    work: { score: 3.5, seating: "Ample", outlets: "Some", wifi: "Yes", laptops: "Daytime", note: "Quiet afternoons, packed evenings. The best late-night option on this list." },
    hours: week([8, 23], [8, 24], [8, 23], { 5: [8, 24] }),
    crowd: { weekday: [[10, 30, 2], [20.5, 95, 1.8]], weekend: [[14, 55, 2], [21, 100, 2]] },
    photos: { space: [], food: ["haraz-food-1.jpg", "haraz-food-2.jpg"] },
  },
  {
    id: "stable-hand",
    name: "Stable Hand",
    neighborhood: "Wilmore, Remount Rd",
    address: "125 Remount Rd B, Charlotte, NC 28203",
    lat: 35.1975, lng: -80.8700,
    rating: 4.7, reviews: 254, price: 2, priceLabel: "$10–20",
    category: "Coffee shop and bakery",
    atmosphere: {
      headline: "Soft blush and a bold mural",
      summary:
        "Blush walls, pale wood and an oversized abstract mural give this bakery cafe a gentle, gallery-like calm. Pastries are made in house and the light is soft all day. Unhurried and quietly stylish.",
      tags: ["Mural", "Soft palette", "Bakery", "Calm", "Minimal"],
      sound: "Quiet",
      lighting: "Soft, even",
    },
    work: { score: 3.5, seating: "Moderate", outlets: "Some", wifi: "Yes", laptops: "Welcome", note: "Calm room for focused work. Weekend mornings sell out fast." },
    hours: week([7, 17], [8, 15], [8, 15]),
    crowd: { weekday: [[8.5, 60, 1.3], [12, 40, 1.2]], weekend: [[10, 95, 1.6]] },
    photos: { space: ["stable-hand-space-1.jpg"], food: ["stable-hand-food-1.jpg"] },
  },
  {
    id: "visart",
    name: "Visart Cafe",
    neighborhood: "Commonwealth Park, Eastway",
    address: "3102 Eastway Dr, Charlotte, NC 28205",
    lat: 35.2050, lng: -80.7860,
    rating: 4.8, reviews: 66, price: 1, priceLabel: "$1–10",
    category: "Art cafe",
    atmosphere: {
      headline: "Eclectic artist's studio",
      summary:
        "A coral-red counter, chalkboard menus, gig posters and local art on every surface. Part cafe, part community art space with regular events. Colorful, personal and unpretentious — the opposite of a chain.",
      tags: ["Local art", "Events", "Eclectic", "Community", "Colorful"],
      sound: "Moderate",
      lighting: "Mixed, warm",
    },
    work: { score: 3, seating: "Limited", outlets: "Some", wifi: "Yes", laptops: "Welcome", note: "Small but friendly. Check the events calendar before a work session." },
    hours: week([8, 20], [9, 20], [10, 16]),
    crowd: { weekday: [[9, 40, 1.5], [18.5, 60, 1.5]], weekend: [[12, 65, 2]] },
    photos: { space: ["visart-space-1.jpg", "visart-space-2.jpg"], food: [] },
  },
  {
    id: "night-swim",
    name: "Night Swim Coffee — Legacy Union",
    neighborhood: "Uptown, South Tryon",
    address: "620 S Tryon St Ste 150, Charlotte, NC 28202",
    lat: 35.2235, lng: -80.8505,
    rating: 4.5, reviews: 82, price: 1, priceLabel: "$1–10",
    category: "Coffee shop",
    atmosphere: {
      headline: "Tower-lobby espresso bar",
      summary:
        "A sleek bar at the base of an Uptown office tower: a coral espresso machine, matte-black retail shelving and tiled walls, with plush boucle lounge chairs a few steps away. Polished, efficient and quiet once the morning rush clears.",
      tags: ["Sleek", "Office tower", "Lounge chairs", "Specialty roaster", "Quiet afternoons"],
      sound: "Quiet",
      lighting: "Bright, clean",
    },
    work: { score: 4, seating: "Moderate", outlets: "Good", wifi: "Yes", laptops: "Welcome", note: "Quiet after 10. Built for the downtown workday." },
    hours: week([7, 18], [8, 14], null),
    crowd: { weekday: [[8, 90, 1], [12, 55, 0.9]], weekend: [[10, 35, 1.5]] },
    photos: { space: ["night-swim-space-1.jpg", "night-swim-space-2.jpg"], food: [] },
  },
  {
    id: "grounds",
    name: "The Grounds Bookstore and Café",
    neighborhood: "Davis Lake–Eastfield",
    address: "8335 Browne Rd, Charlotte, NC 28269",
    lat: 35.3245, lng: -80.7905,
    rating: 4.9, reviews: 206, price: 1, priceLabel: "$1–10",
    category: "Bookstore cafe",
    atmosphere: {
      headline: "Bookshop under a glass clerestory",
      summary:
        "Tall industrial windows, black pendant lights and a reclaimed-wood coffee bar set inside a bookstore. Bright, peaceful and unhurried — browse the shelves, then settle in. The highest-rated shop on this list.",
      tags: ["Bookstore", "Tall windows", "Peaceful", "Reclaimed wood", "Bright"],
      sound: "Quiet",
      lighting: "Bright, daylight",
    },
    work: { score: 4.5, seating: "Ample", outlets: "Good", wifi: "Yes", laptops: "Welcome", note: "Library-quiet with room to spread out. Worth the drive north." },
    hours: week([7, 16], [8, 16], null),
    crowd: { weekday: [[9, 45, 1.5], [12.5, 35, 1.2]], weekend: [[10.5, 60, 1.8]] },
    photos: { space: ["grounds-space-1.jpg", "grounds-space-2.jpg"], food: [] },
  },
];
