import type { Category, ContentItem } from '@/types';
import { relativeISO } from '@/lib/dates';

export const CATEGORY_LABEL: Record<Category, string> = {
  announcements: 'Kisani Urjaa',
  'crop-care': 'Crop care',
  soil: 'Soil health',
  residue: 'Residue management',
  weather: 'Weather',
  water: 'Water',
  machinery: 'Machinery',
  market: 'Market & storage',
};

const fieldTeam = { name: 'Kisani Urjaa Field Team', role: 'Buldhana' };
const agronomy = { name: 'Kisani Urjaa Agronomy Desk', role: 'Crop advisors' };
const appTeam = { name: 'Kisani Urjaa', role: 'Product updates' };

/**
 * Sample editorial content. Written as general, practical guidance; always follow
 * product labels and local agriculture department advice for exact rates.
 */
export function buildContent(now = new Date()): ContentItem[] {
  const at = (days: number, h = 9, m = 0) => relativeISO(days, h, m, now);

  return [
    /* ------------------------------ NEWS ------------------------------ */
    {
      id: 'n-straw-collection',
      kind: 'news',
      featured: true,
      title: 'Paddy straw collection opens across Buldhana villages',
      summary:
        'Book a slot in the app and a team will bale and lift loose straw from your field after harvest, so the field is ready without burning.',
      category: 'announcements',
      publishedAt: at(0, 7, 30),
      author: fieldTeam,
      scene: { kind: 'harvest', seed: 11, time: 'golden' },
      gallery: [
        { kind: 'harvest', seed: 11, time: 'golden' },
        { kind: 'harvest', seed: 27, time: 'dusk' },
        { kind: 'paddy', seed: 5, time: 'morning' },
      ],
      cta: { label: 'Book straw collection', to: '/bookings/new' },
      body: [
        { type: 'p', text: 'Bookings for paddy straw collection are now open for this harvest. Once your crop is cut, a team with a slasher, raker and baler visits your field, bales the loose straw and carries it away on trolleys.' },
        { type: 'p', text: 'Clearing straw this way gets the field ready for the next sowing without fire. Burning takes organic matter out of the topsoil and harms the soil life that keeps it fertile.' },
        { type: 'h', text: 'How to book' },
        {
          type: 'list',
          ordered: true,
          items: [
            'Tap the + button and choose New booking, or open Orders and switch to Bookings.',
            'Pick the field, the crop and the area you want cleared.',
            'Choose a preferred date and time. Your request goes to the team for approval.',
            'When it is approved, the operator’s name appears in the booking and in your notifications.',
          ],
        },
        { type: 'tip', title: 'Book early', text: 'Slots fill up in the weeks right after harvest. If your harvest date moves, ask your Kisani Didi to move the booking.' },
      ],
    },
    {
      id: 'n-stubble-cost',
      kind: 'news',
      title: 'Why burning stubble costs your next crop',
      summary: 'Fire removes nutrients and organic matter and dries the topsoil. Keeping or composting residue does the opposite.',
      category: 'residue',
      publishedAt: at(-1, 10, 15),
      author: agronomy,
      scene: { kind: 'harvest', seed: 42, time: 'dusk' },
      body: [
        { type: 'p', text: 'Burning straw looks like the quickest way to clear a field, but the cost shows up in the next crop. Most of the nitrogen and sulphur in the straw goes up in smoke, and the heat kills earthworms and the microbes that break down organic matter.' },
        { type: 'p', text: 'Soil that loses organic matter holds less water and turns hard faster. Over a few seasons that means more irrigation, more fertiliser and weaker roots.' },
        { type: 'h', text: 'Better ways to clear residue' },
        {
          type: 'list',
          items: [
            'Sow the next crop directly into the stubble with a Happy Seeder or Super Seeder.',
            'Spray a microbial decomposer and mix the softened straw into the soil.',
            'Have the straw baled and collected, which also clears the field quickly.',
          ],
        },
        { type: 'tip', title: 'Smoke hurts people too', text: 'Field fires add to winter smog. Children, older family members and anyone with asthma feel it first.' },
      ],
    },
    {
      id: 'n-soil-camp',
      kind: 'news',
      title: 'Soil testing camp at Ratanpur village hall',
      summary: 'Bring one soil sample per field and get a report on nutrients and pH, with advice on how much fertiliser you really need.',
      category: 'soil',
      publishedAt: at(-2, 12, 0),
      author: fieldTeam,
      scene: { kind: 'soil', seed: 8, time: 'morning' },
      cta: { label: 'See camp details', to: '/events/e-soil-camp' },
      body: [
        { type: 'p', text: 'A soil testing camp is coming to the Ratanpur village hall. Testing tells you what your soil already has, so you can stop paying for fertiliser your crop does not need.' },
        { type: 'h', text: 'How to take a good sample' },
        {
          type: 'list',
          ordered: true,
          items: [
            'Walk the field in a zig-zag and pick 8–10 spots. Avoid bunds, trees, manure heaps and wet corners.',
            'At each spot, clear the surface and cut a V-shaped hole about 15 cm deep (a hand’s length).',
            'Take a thin slice from the side of the hole and put all slices in a clean bucket.',
            'Mix well, remove stones and roots, and keep about half a kilogram.',
            'Dry it in the shade, put it in a clean cloth bag and write the field name on it.',
          ],
        },
        { type: 'tip', title: 'One field, one sample', text: 'Never mix soil from two different fields — the report would fit neither.' },
      ],
    },
    {
      id: 'n-rain-spray',
      kind: 'news',
      title: 'Rain likely this week: plan sprays for a dry morning',
      summary: 'Spray washes off when rain follows soon after. Check the forecast and spray on a calm, dry morning.',
      category: 'weather',
      publishedAt: at(-3, 8, 0),
      author: agronomy,
      scene: { kind: 'monsoon', seed: 19, time: 'overcast' },
      body: [
        { type: 'p', text: 'Showers are expected in parts of the district later this week. If rain falls within a few hours of spraying, much of the product washes off the leaves and the money is wasted.' },
        {
          type: 'list',
          items: [
            'Spray in the early morning or late afternoon when the air is calm.',
            'Skip spraying when the wind is strong enough to move small branches.',
            'Check the product label for how long it needs to stay dry.',
            'Wear gloves and a mask, and wash hands before eating.',
          ],
        },
        { type: 'tip', title: 'Use the weather card', text: 'The weather card on your home screen tells you each day whether conditions are good for spraying.' },
      ],
    },
    {
      id: 'n-fom-deliveries',
      kind: 'news',
      title: 'FOM orders: what happens after you order',
      summary: 'The team checks every order. Approved orders get a dispatch date, and you get a notification at each step.',
      category: 'announcements',
      publishedAt: at(-5, 11, 0),
      author: appTeam,
      scene: { kind: 'village', seed: 4, time: 'morning' },
      body: [
        { type: 'p', text: 'When you place an order for FOM (fermented organic manure), it first shows as Pending approval. The team checks stock and the delivery route for your village.' },
        {
          type: 'list',
          items: [
            'Approved: your order has a dispatch date. Keep someone at the delivery spot that day.',
            'Rejected: the order shows the reason, such as stock not being available, so you can order again.',
          ],
        },
        { type: 'p', text: 'Use the delivery instructions box to tell the driver about landmarks, gate timings or a phone number to call.' },
      ],
    },
    {
      id: 'n-decomposer',
      kind: 'news',
      title: 'Bio-decomposer sprays turn straw into compost in the field',
      summary: 'A microbial spray softens paddy straw so it can be mixed into the soil within a few weeks. It works best when the field stays moist.',
      category: 'residue',
      publishedAt: at(-7, 9, 30),
      author: agronomy,
      scene: { kind: 'paddy', seed: 33, time: 'golden' },
      body: [
        { type: 'p', text: 'Microbial decomposers are a low-cost way to deal with straw in the field. The solution is usually fermented for a few days with jaggery and gram flour, then diluted and sprayed over the cut straw. Follow the instructions on the pack.' },
        { type: 'p', text: 'Keep the field moist after spraying. After about two to three weeks, mix the softened straw into the soil with a rotavator before sowing.' },
        { type: 'tip', title: 'Ask before you buy', text: 'Your Kisani Didi can tell you where to get a trusted decomposer and help you plan the timing around your next sowing.' },
      ],
    },
    {
      id: 'n-kharif-sowing',
      kind: 'news',
      title: 'Kharif sowing: wait for good soil moisture',
      summary: 'Sowing after the first light shower risks losing seedlings in a dry spell. Sow once the soil is moist to about a hand’s depth.',
      category: 'crop-care',
      publishedAt: at(-11, 7, 45),
      author: agronomy,
      scene: { kind: 'monsoon', seed: 52, time: 'overcast' },
      body: [
        { type: 'p', text: 'The first showers of the season tempt many farmers to sow early. If a dry spell follows, young seedlings die and the field has to be sown again at double the cost.' },
        { type: 'p', text: 'A simple check: dig with your hand. If the soil is moist to about 15 cm, it is ready. Many agriculture departments suggest waiting for around 75–100 mm of total rain before sowing.' },
      ],
    },
    {
      id: 'n-season-records',
      kind: 'news',
      title: 'New in the app: your season records, step by step',
      summary: 'Field visits from your Kisani Didi now appear under My forms, from land preparation to transport.',
      category: 'announcements',
      publishedAt: at(-14, 10, 0),
      author: appTeam,
      scene: { kind: 'cotton', seed: 21, time: 'day' },
      cta: { label: 'Open My forms', to: '/forms' },
      body: [
        { type: 'p', text: 'Every season has eight steps, from land preparation to transport. When your Kisani Didi records a step during a field visit, it shows up as submitted with the date and her name.' },
        { type: 'p', text: 'Costs are added up for you, with the calculation shown, so you can see where the season’s money went.' },
      ],
    },

    /* ---------------------------- ARTICLES ---------------------------- */
    {
      id: 'a-soil-health-card',
      kind: 'article',
      featured: true,
      title: 'How to read your Soil Health Card',
      summary: 'Your card lists 12 soil measurements and a fertiliser plan. Here is what each part means and how to use it this season.',
      category: 'soil',
      publishedAt: at(-4, 9, 0),
      author: agronomy,
      scene: { kind: 'soil', seed: 61, time: 'golden' },
      body: [
        { type: 'p', text: 'A Soil Health Card is a report of your field’s soil. It measures 12 things: nitrogen, phosphorus and potassium (N, P, K), sulphur, four micronutrients (zinc, iron, copper, manganese), boron, pH, electrical conductivity (EC) and organic carbon.' },
        { type: 'h', text: 'Low, medium, high' },
        { type: 'p', text: 'Each nutrient is marked low, medium or high. Low means the crop will respond well if you add it. High means you can cut back and save money.' },
        { type: 'h', text: 'pH and EC' },
        { type: 'p', text: 'pH tells you if the soil is acidic or alkaline. Most crops do best between 6.5 and 7.5. EC shows salt levels; high EC means you should improve drainage and avoid salty water.' },
        { type: 'h', text: 'Using the fertiliser plan' },
        {
          type: 'list',
          items: [
            'The card suggests doses for the crop you named. Use those doses, not last year’s habit.',
            'Split nitrogen into two or three doses instead of applying it all at sowing.',
            'Add organic manure such as FOM to raise organic carbon over time.',
          ],
        },
        { type: 'tip', title: 'Test again', text: 'Re-test every two to three years, or sooner if you change crops.' },
      ],
    },
    {
      id: 'a-seeders',
      kind: 'article',
      title: 'Happy Seeder or Super Seeder: which suits your field?',
      summary: 'Both sow wheat straight into paddy stubble without burning. They differ in tractor power, speed and what they do with the straw.',
      category: 'machinery',
      publishedAt: at(-6, 15, 0),
      author: agronomy,
      scene: { kind: 'wheat', seed: 14, time: 'golden' },
      body: [
        { type: 'p', text: 'After the paddy harvest there is little time before wheat sowing. Both machines let you sow without clearing or burning the straw first.' },
        { type: 'h', text: 'Happy Seeder' },
        { type: 'p', text: 'It cuts the straw just in front of each seed tine and drops it back on the field as mulch. The mulch keeps moisture in and controls weeds. It usually needs a tractor of roughly 45 HP or more.' },
        { type: 'h', text: 'Super Seeder' },
        { type: 'p', text: 'It has a rotavator that mixes the straw into the soil and sows in the same pass. It needs more power, usually 55 HP or more, and uses more diesel per acre.' },
        { type: 'tip', title: 'Rent before you buy', text: 'Try both on a small plot. Many farmers rent through custom hiring centres for the first season.' },
      ],
    },
    {
      id: 'a-drip-cotton',
      kind: 'article',
      title: 'Drip irrigation for cotton: a practical start',
      summary: 'Drip puts water and fertiliser right at the roots. Here are the parts, the layout, and the upkeep that keeps it running.',
      category: 'water',
      publishedAt: at(-9, 10, 30),
      author: agronomy,
      scene: { kind: 'canal', seed: 7, time: 'day' },
      body: [
        { type: 'p', text: 'Drip irrigation saves water, reduces weeds between rows and lets you feed fertiliser through the pipes (fertigation). In dry spells it can keep cotton growing when flood irrigation is not possible.' },
        { type: 'h', text: 'The parts' },
        { type: 'list', items: ['Pump and a filter (screen or disc) to stop dirt blocking the drippers.', 'A main line and sub-main lines along the field edge.', 'Lateral pipes along each row with drippers at regular spacing.', 'A venturi or tank for fertigation.'] },
        { type: 'h', text: 'Keep it running' },
        { type: 'list', items: ['Clean filters every few days during the season.', 'Flush lateral ends once a week.', 'Walk the rows and check that every dripper wets the soil.'] },
      ],
    },
    {
      id: 'a-ipm-paddy',
      kind: 'article',
      title: 'Integrated pest management for paddy',
      summary: 'Watch the field weekly, help natural enemies and spray only when pests cross the limit. You save money and protect the crop.',
      category: 'crop-care',
      publishedAt: at(-12, 9, 0),
      author: agronomy,
      scene: { kind: 'paddy', seed: 77, time: 'morning' },
      body: [
        { type: 'p', text: 'Integrated pest management (IPM) means using several methods together instead of spraying on a fixed calendar.' },
        { type: 'list', items: ['Walk the field once a week and look at 10 hills in a zig-zag.', 'Use pheromone traps to track stem borer moths.', 'Avoid too much nitrogen: lush, dark-green crops attract plant hoppers.', 'Leave some bunds with flowering plants for spiders and other natural enemies.', 'Spray only when pest numbers cross the limit your advisor gives you.'] },
        { type: 'tip', title: 'Right product, right dose', text: 'If you must spray, use a recommended product at the label dose and spray at the base of the plant for hoppers.' },
      ],
    },
    {
      id: 'a-seed-treatment',
      kind: 'article',
      title: 'Seed treatment: a 15-minute habit that protects your crop',
      summary: 'Treating seed before sowing protects young plants from soil-borne disease and pests in the weeks when they are weakest.',
      category: 'crop-care',
      publishedAt: at(-16, 8, 30),
      author: agronomy,
      scene: { kind: 'mustard', seed: 23, time: 'day' },
      body: [
        { type: 'p', text: 'Most seedling losses happen in the first three weeks. Seed treatment puts a thin protective coat on each seed for exactly this period.' },
        { type: 'list', ordered: true, items: ['Fungicide first, then insecticide, then biofertiliser (such as Rhizobium for pulses).', 'Mix gently so the seed coat is not damaged.', 'Dry the seed in the shade and sow within a day.'] },
        { type: 'tip', title: 'Stay safe', text: 'Wear gloves, keep treated seed away from children and animals, and never use leftover seed as food or feed.' },
      ],
    },
    {
      id: 'a-fom-use',
      kind: 'article',
      title: 'Using FOM well: timing, spreading and storage',
      summary: 'Fermented organic manure feeds the soil life that feeds your crop. Apply it at the right time and keep it moist and shaded.',
      category: 'soil',
      publishedAt: at(-20, 11, 0),
      author: agronomy,
      scene: { kind: 'village', seed: 36, time: 'golden' },
      body: [
        { type: 'p', text: 'FOM adds organic carbon, improves water holding and feeds soil microbes. Results build up season after season.' },
        { type: 'list', items: ['Apply during land preparation and mix it into the top layer of soil.', 'Spread evenly; heaps left in one place can burn young roots.', 'Use the rate your Kisani Didi or the bag recommends, based on your soil test.', 'Store in the shade and keep it slightly moist; do not let it dry into dust.'] },
      ],
    },

    /* ----------------------------- VIDEOS ----------------------------- */
    {
      id: 'v-baling',
      kind: 'video',
      featured: true,
      title: 'Baling paddy straw: one field, start to finish',
      summary: 'See how a slasher, raker and baler clear a harvested field in a single afternoon.',
      category: 'residue',
      publishedAt: at(-1, 17, 0),
      author: fieldTeam,
      scene: { kind: 'harvest', seed: 91, time: 'golden' },
      video: { src: 'media/clip-harvest.mp4', durationSec: 24 },
      body: [{ type: 'p', text: 'The slasher cuts the standing stubble, the raker gathers loose straw into rows, and the baler presses it into bales that are loaded onto trolleys. Book the service from the Bookings tab.' }],
    },
    {
      id: 'v-soil-sample',
      kind: 'video',
      title: 'Taking a soil sample the right way',
      summary: 'A V-cut, a clean bucket and a zig-zag walk: everything you need for a reliable soil test.',
      category: 'soil',
      publishedAt: at(-3, 16, 0),
      author: agronomy,
      scene: { kind: 'soil', seed: 15, time: 'morning' },
      video: { src: 'media/clip-soil.mp4', durationSec: 18 },
      body: [{ type: 'p', text: 'Follow along before the soil testing camp so your sample gives an accurate report.' }],
    },
    {
      id: 'v-drip',
      kind: 'video',
      title: 'Laying drip lines in a cotton field',
      summary: 'Where to place laterals, how to check drippers and how to flush the system.',
      category: 'water',
      publishedAt: at(-8, 12, 0),
      author: agronomy,
      scene: { kind: 'cotton', seed: 48, time: 'day' },
      video: { src: 'media/clip-cotton.mp4', durationSec: 20 },
      body: [{ type: 'p', text: 'A walk-through of a basic drip layout for cotton rows, with tips on maintenance during the season.' }],
    },
    {
      id: 'v-decomposer',
      kind: 'video',
      title: 'Mixing and spraying a bio-decomposer',
      summary: 'Prepare the solution, spray evenly and keep the field moist for faster results.',
      category: 'residue',
      publishedAt: at(-10, 9, 0),
      author: agronomy,
      scene: { kind: 'paddy', seed: 63, time: 'morning' },
      video: { src: 'media/clip-paddy.mp4', durationSec: 22 },
      body: [{ type: 'p', text: 'Step-by-step preparation and spraying of a microbial decomposer on paddy straw.' }],
    },
    {
      id: 'v-stem-borer',
      kind: 'video',
      title: 'Checking your paddy for stem borer',
      summary: 'How to spot dead hearts and white ears early, and when it is worth acting.',
      category: 'crop-care',
      publishedAt: at(-15, 10, 0),
      author: agronomy,
      scene: { kind: 'paddy', seed: 85, time: 'day' },
      video: { src: 'media/clip-paddy.mp4', durationSec: 22 },
      body: [{ type: 'p', text: 'Learn the early signs of stem borer damage and how pheromone traps help you decide when to spray.' }],
    },
    {
      id: 'v-wheat-storage',
      kind: 'video',
      title: 'Storing wheat safely after harvest',
      summary: 'Dry grain, clean bags and a raised platform keep pests and moisture out.',
      category: 'market',
      publishedAt: at(-21, 11, 0),
      author: agronomy,
      scene: { kind: 'wheat', seed: 29, time: 'golden' },
      video: { src: 'media/clip-wheat.mp4', durationSec: 16 },
      body: [{ type: 'p', text: 'Simple storage practices that protect grain quality until you are ready to sell.' }],
    },
  ];
}

export function readMinutes(item: ContentItem): number {
  if (item.kind === 'video' && item.video) return Math.max(1, Math.round(item.video.durationSec / 60));
  const words = [item.summary, ...item.body.map((b) => (b.type === 'list' ? b.items.join(' ') : 'text' in b ? b.text : ''))]
    .join(' ')
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
}
