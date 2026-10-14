import type { Food, Targets } from '../lib/types';

// Values per `per` units: pc = 1 piece/pack, g = 100 g, ml = 100 ml. Norwegian labels list carbs without fibre.
export const FOODS: Food[] = [
  { id: 'egg', name: 'Egg, whole', short: 'eggs', unit: 'pc', per: 1, kcal: 72, p: 6.3, c: 0.4, f: 4.8 },
  { id: 'polse', name: 'Grove pølsebrød (~50 g)', short: 'pølsebrød', unit: 'pc', per: 1, kcal: 136, p: 4.6, c: 22.4, f: 2.4, label: true },
  { id: 'bun', name: 'Grove burgerbrød (80 g)', short: 'burger buns', unit: 'pc', per: 1, kcal: 216, p: 7.3, c: 35.3, f: 3.8, label: true },
  { id: 'yogurt', name: 'Vanilla yogurt + granola, 1 pot', short: 'yogurt pot', unit: 'pc', per: 1, kcal: 230, p: 15, c: 30, f: 5, label: true },
  { id: 'ricepouch', name: 'Rice pouch, plain (250 g)', short: 'rice pouch', unit: 'pc', per: 1, kcal: 372, p: 8, c: 76, f: 4, label: true },
  { id: 'banana', name: 'Banana, medium', short: 'banana', unit: 'pc', per: 1, kcal: 105, p: 1.3, c: 27, f: 0.4 },
  { id: 'oats', name: 'Oats', short: 'oats', unit: 'g', per: 100, kcal: 375, p: 13, c: 60, f: 7 },
  { id: 'whey', name: 'Whey protein, 1 scoop (30 g)', short: 'scoop whey', unit: 'pc', per: 1, kcal: 120, p: 24, c: 3, f: 1.5 },
  { id: 'pb', name: 'Peanut butter, 1 tbsp (16 g)', short: 'tbsp peanut butter', unit: 'pc', per: 1, kcal: 99, p: 4, c: 2, f: 8 },
  { id: 'milk15', name: 'Milk, 1.5% fat', short: 'milk', unit: 'ml', per: 100, kcal: 46, p: 3.5, c: 4.7, f: 1.5 },
  { id: 'milk35', name: 'Milk, whole 3.5%', short: 'whole milk', unit: 'ml', per: 100, kcal: 64, p: 3.4, c: 4.6, f: 3.5 },
  { id: 'honey', name: 'Honey, 1 tbsp', short: 'tbsp honey', unit: 'pc', per: 1, kcal: 64, p: 0, c: 17, f: 0 },
  { id: 'skyr', name: 'Skyr, plain', short: 'skyr', unit: 'g', per: 100, kcal: 62, p: 11, c: 4, f: 0.2 },
  { id: 'mince5', name: 'Beef mince 5% fat, raw', short: 'mince', unit: 'g', per: 100, kcal: 128, p: 21, c: 0, f: 5 },
  { id: 'potato', name: 'Potatoes, baby or frozen plain', short: 'potatoes', unit: 'g', per: 100, kcal: 77, p: 2, c: 16, f: 0.1 },
  { id: 'chickencooked', name: 'Chicken, cooked', short: 'chicken', unit: 'g', per: 100, kcal: 150, p: 30, c: 1, f: 3 },
  { id: 'chicken', name: 'Chicken breast, raw', short: 'raw chicken', unit: 'g', per: 100, kcal: 110, p: 23, c: 0, f: 1.5 },
  { id: 'salmon', name: 'Salmon, raw', short: 'salmon', unit: 'g', per: 100, kcal: 200, p: 20, c: 0, f: 13 },
  { id: 'tuna', name: 'Tuna in water, 1 can drained', short: 'can tuna', unit: 'pc', per: 1, kcal: 130, p: 30, c: 0, f: 1 },
  { id: 'vegmix', name: 'Frozen wok or mixed veg', short: 'frozen veg', unit: 'g', per: 100, kcal: 40, p: 2.5, c: 6, f: 0.5 },
  { id: 'sauce', name: 'Sweet chilli or BBQ sauce, 2 tbsp', short: 'sauce', unit: 'pc', per: 1, kcal: 55, p: 0.2, c: 13, f: 0.1 },
  { id: 'ketchup', name: 'Ketchup, 1 tbsp', short: 'ketchup', unit: 'pc', per: 1, kcal: 18, p: 0.2, c: 4, f: 0 },
  { id: 'berries', name: 'Berries, frozen', short: 'berries', unit: 'g', per: 100, kcal: 45, p: 0.8, c: 9, f: 0.3 },
  { id: 'apple', name: 'Apple', short: 'apple', unit: 'pc', per: 1, kcal: 80, p: 0.4, c: 19, f: 0.2 },
  { id: 'kiwi', name: 'Kiwi', short: 'kiwi', unit: 'pc', per: 1, kcal: 45, p: 0.8, c: 9, f: 0.4 },
  { id: 'orange', name: 'Orange', short: 'orange', unit: 'pc', per: 1, kcal: 65, p: 1.2, c: 14, f: 0.2 },
  { id: 'bread', name: 'Bread, 1 slice', short: 'bread', unit: 'pc', per: 1, kcal: 100, p: 4, c: 17, f: 1.5 },
  { id: 'cheese', name: 'Cheese, 1 slice (15 g)', short: 'cheese', unit: 'pc', per: 1, kcal: 55, p: 4, c: 0, f: 4.3 },
  { id: 'hummus', name: 'Hummus', short: 'hummus', unit: 'g', per: 100, kcal: 300, p: 7, c: 10, f: 25 },
  { id: 'oil', name: 'Oil or butter, 1 tbsp', short: 'oil', unit: 'pc', per: 1, kcal: 90, p: 0, c: 0, f: 10 },
  { id: 'juice', name: 'Orange juice', short: 'juice', unit: 'ml', per: 100, kcal: 45, p: 0.7, c: 10, f: 0.1 },
];
export const FOOD_BY_ID: Record<string, Food> = Object.fromEntries(FOODS.map(f => [f.id, f]));

export interface Template { id: string; name: string; items: [string, number][] }
export const TEMPLATES: Template[] = [
  { id: 't_eggs', name: 'Eggs & pølsebrød', items: [['egg', 3], ['polse', 2]] },
  { id: 't_yogurt', name: 'Yogurt pot', items: [['yogurt', 1]] },
  { id: 't_burger', name: 'Lunch bag', items: [['mince5', 100], ['potato', 100], ['bun', 2], ['ketchup', 1]] },
  { id: 't_salmon', name: 'Salmon', items: [['salmon', 150], ['potato', 250], ['bun', 1]] },
  { id: 't_tuna', name: 'Tuna burgers', items: [['tuna', 1], ['potato', 100], ['bun', 2], ['ketchup', 1]] },
  { id: 't_shake', name: 'Bulk shake', items: [['banana', 1], ['whey', 1], ['pb', 1], ['oats', 50], ['milk15', 300]] },
  { id: 't_bowl', name: 'Rice bowl', items: [['ricepouch', 1], ['chickencooked', 100], ['vegmix', 100], ['sauce', 1]] },
  { id: 't_skyr', name: 'Skyr bowl', items: [['skyr', 300], ['oats', 50], ['banana', 1], ['honey', 1]] },
  { id: 't_tunabowl', name: 'Tuna bowl', items: [['ricepouch', 1], ['tuna', 1], ['vegmix', 100], ['sauce', 1]] },
];

export type SlotIcon = 'breakfast' | 'snack' | 'lunch' | 'shake' | 'dinner';
export interface Slot { id: SlotIcon; name: string; time: string; opts: string[] }
export const SLOTS: Slot[] = [
  { id: 'breakfast', name: 'Breakfast', time: '07:10', opts: ['t_eggs'] },
  { id: 'snack', name: 'Snack', time: '10:00', opts: ['t_yogurt'] },
  { id: 'lunch', name: 'Lunch', time: '12:30', opts: ['t_burger', 't_salmon', 't_tuna'] },
  { id: 'shake', name: 'Shake', time: 'After gym', opts: ['t_shake'] },
  { id: 'dinner', name: 'Dinner', time: '19:30', opts: ['t_bowl', 't_skyr', 't_tunabowl'] },
];

export const DEFAULT_TARGETS: Targets = { p: 150, c: 355, f: 65 };
export const PACE = { low: 0.15, high: 0.35, aim: 0.25 };
export const PROGRAM_START = '2026-10-14';
export const EASE_DAYS = 14;

export type SessionId = 'UA' | 'LA' | 'UB' | 'LB';
export interface Exercise { id: string; name: string; sets: number; reps: string; rest: string; start?: number; step?: number; ss?: string; isNew?: boolean; cue: string }
export interface Session { name: string; focus: string; mins: number; ex: Exercise[] }
export const ORDER: SessionId[] = ['UA', 'LA', 'UB', 'LB'];
export const PLAN_DAY: Record<number, SessionId> = { 1: 'UA', 2: 'LA', 4: 'UB', 5: 'LB' };
export const PROGRAM: Record<SessionId, Session> = {
  UA: { name: 'Upper A', focus: 'Chest & back', mins: 60, ex: [
    { id: 'incpress', name: 'Incline chest press', sets: 3, reps: '6–10', rest: '2–3 min', start: 40, cue: 'Elbows about 45° from your sides, shoulder blades pinned back, 2 seconds on the way down.' },
    { id: 'hrow', name: 'Horizontal rows', sets: 3, reps: '8–12', rest: '2 min', start: 50, cue: 'Pull your elbows toward your hips and squeeze your shoulder blades for 1 second.' },
    { id: 'pulldown', name: 'Lat pulldown', sets: 3, reps: '8–12', rest: '2 min', start: 59, cue: 'Lean back slightly, pull to your upper chest, let it stretch all the way up.' },
    { id: 'fly', name: 'Butterfly', sets: 3, reps: '12–15', rest: '1–2 min', start: 40, cue: 'Soft elbows. Squeeze 1 second in the middle, slow on the way back.' },
    { id: 'latraise', name: 'Lateral raises', sets: 3, reps: '12–20', rest: '1 min', ss: 'A', start: 7, step: 1, cue: 'Lean slightly forward, raise to shoulder height, no swinging. Last set to failure.' },
    { id: 'facepull', name: 'Face pull', sets: 3, reps: '12–20', rest: '1 min', ss: 'A', isNew: true, cue: 'Rope at face height, pull to your forehead with thumbs pointing back, squeeze 1 second. Builds posture and protects your shoulders. Start light.' },
    { id: 'curl', name: 'Arm curl', sets: 2, reps: '8–12', rest: '1 min', ss: 'B', start: 27, cue: 'Elbows still, slow on the way down.' },
    { id: 'pushdown', name: 'Back triceps push', sets: 2, reps: '10–15', rest: '1 min', ss: 'B', start: 29, cue: 'Elbows pinned to your sides, full lockout.' },
  ] },
  LA: { name: 'Lower A', focus: 'Quads & hamstrings', mins: 55, ex: [
    { id: 'legpress', name: 'Leg press', sets: 3, reps: '8–12', rest: '2–3 min', start: 65, cue: 'Feet shoulder-width. Go as deep as you can without your lower back lifting off the pad.' },
    { id: 'legcurl', name: 'Prone leg curl', sets: 3, reps: '10–15', rest: '1–2 min', start: 40, cue: 'Hips pressed into the pad. Squeeze at the top, 2 seconds down.' },
    { id: 'legext', name: 'Leg extension', sets: 3, reps: '10–15', rest: '1–2 min', start: 61, cue: 'Pause 1 second at the top, lower slowly.' },
    { id: 'backext', name: 'Back extension', sets: 3, reps: '10–15', rest: '1–2 min', start: 68, cue: 'Squeeze your glutes to come up and stop at a straight line. Don’t bend backwards.' },
    { id: 'calf', name: 'Calf press', sets: 3, reps: '10–15', rest: '1 min', start: 34, cue: 'Pause 2 seconds in the bottom stretch. Full range beats heavy weight.' },
    { id: 'crunch', name: 'Abdominal crunch', sets: 3, reps: '10–15', rest: '1 min', start: 34, cue: 'Curl your ribs toward your hips and breathe out hard at the bottom.' },
  ] },
  UB: { name: 'Upper B', focus: 'Back, shoulders & arms', mins: 60, ex: [
    { id: 'chestpress', name: 'Chest press', sets: 3, reps: '6–10', rest: '2–3 min', start: 40, cue: 'Heavier day, fewer reps. Elbows about 45°.' },
    { id: 'wrow', name: 'Wide grip rows', sets: 3, reps: '10–12', rest: '2 min', start: 40, cue: 'Elbows out wide, pull to your lower chest. Good for posture.' },
    { id: 'pulldown2', name: 'Lat pulldown, close grip', sets: 2, reps: '8–12', rest: '2 min', start: 59, cue: 'Palms facing each other, pull to your chest.' },
    { id: 'shoulderpress', name: 'Shoulder press', sets: 2, reps: '8–12', rest: '2 min', start: 27, cue: 'Moderate weight. Stop if your shoulder hurts; sharp pain is not effort.' },
    { id: 'reardelt', name: 'Rear delt', sets: 3, reps: '12–20', rest: '1 min', ss: 'A', start: 34, cue: 'Arms nearly straight, sweep out wide, pause 1 second.' },
    { id: 'latraise', name: 'Lateral raises', sets: 2, reps: '12–20', rest: '1 min', ss: 'A', start: 7, step: 1, cue: 'Same as Upper A. Last set to failure.' },
    { id: 'hammer', name: 'Hammer curl', sets: 2, reps: '10–15', rest: '1 min', ss: 'B', start: 15, step: 1, cue: 'Thumbs up. Trains your forearms too.' },
    { id: 'dip', name: 'Seated dip', sets: 2, reps: '8–12', rest: '1 min', ss: 'B', start: 54, cue: 'Stop when your elbows reach 90°.' },
  ] },
  LB: { name: 'Lower B', focus: 'Legs, traps & forearms', mins: 55, ex: [
    { id: 'legpress2', name: 'Leg press, lighter', sets: 3, reps: '12–15', rest: '2 min', start: 65, cue: 'Lighter than Lower A, more reps, same depth.' },
    { id: 'legcurl', name: 'Prone leg curl', sets: 3, reps: '10–15', rest: '1–2 min', start: 40, cue: 'Same weight as Lower A.' },
    { id: 'legext', name: 'Leg extension', sets: 2, reps: '12–15', rest: '1–2 min', start: 61, cue: 'Same weight as Lower A.' },
    { id: 'inside', name: 'Inside legs', sets: 2, reps: '12–15', rest: '1 min', start: 68, cue: 'Full stretch, controlled.' },
    { id: 'calf', name: 'Calf press', sets: 3, reps: '12–20', rest: '1 min', start: 34, cue: 'Pause 2 seconds in the bottom stretch.' },
    { id: 'shrugs', name: 'Shrugs', sets: 2, reps: '10–15', rest: '1 min', ss: 'A', start: 45, cue: 'Straight up, hold 1 second at the top.' },
    { id: 'crunch', name: 'Abdominal crunch', sets: 2, reps: '10–15', rest: '1 min', ss: 'A', start: 34, cue: 'Same as Lower A.' },
    { id: 'forearmraise', name: 'Forearm raises', sets: 2, reps: '12–20', rest: '1 min', ss: 'B', start: 25, cue: 'Full stretch at the bottom, squeeze at the top.' },
    { id: 'forearmstretch', name: 'Forearm stretch', sets: 2, reps: '12–20', rest: '1 min', ss: 'B', start: 48, cue: 'Slow and controlled.' },
  ] },
};
export const HOWTO: [string, string][] = [
  ['Effort', 'Stop big exercises 1–2 reps before failure (2–3 in weeks 1–2). Take the last set of small exercises to failure.'],
  ['Add weight', 'When every set reaches the top of the rep range, tap + once and build the reps back up.'],
  ['Supersets', 'Same letter = alternate them: a set of one, a set of the other, rest 1 minute. Saves about 10 minutes.'],
  ['Warm-up', '3 minutes on the bike, then 2 light sets of your first exercise.'],
  ['Pain', 'Sharp pain, not effort burn, means skip that exercise today.'],
];

export interface PrepStep { time: string; title: string; text: string }
export const PREP: { sunday: PrepStep[]; wednesday: PrepStep[]; daily: [string, string][]; safety: string[] } = {
  sunday: [
    { time: '0:00', title: 'Oven on', text: '220°C (200°C fan). Wash your hands. Get out 2 trays, baking paper, the pan, zip bags and a marker.' },
    { time: '0:05', title: 'Potatoes', text: 'Rinse 400 g baby potatoes, cut in half, pat dry. Tray 1 with 1 tbsp oil and salt, cut side down. Timer 15 min.' },
    { time: '0:08', title: 'Chicken', text: 'Pat about 650 g breast dry (don’t rinse). Slice thick pieces so they’re about 2 cm. Tray 2 with 1 tsp oil, salt and spice. Timer 20 min. Wash hands, board and knife.' },
    { time: '0:15', title: 'Mince', text: '400 g into the hot pan with frozen onion, pepper strips and 2 spinach portions. Break it up, about 12 min. Turn the potatoes when their timer goes.' },
    { time: '0:28', title: 'Finish', text: 'Spice mix and a splash of water into the mince, 2 min. Cut the thickest chicken piece open: white all the way through means done.' },
    { time: '0:35', title: 'Cool', text: 'Potatoes out when golden. Spread everything out for 30–45 min, never more than 1 hour.' },
    { time: '1:10', title: 'Bag it', text: 'Mince + potatoes in 4 portions: eat 1, bag Mon, Tue, Wed. Chicken in 5: eat 1 tonight, bag Mon–Wed (fridge) and Fri (freezer).' },
  ],
  wednesday: [
    { time: '0:00', title: 'Oven on', text: '220°C. 400 g potatoes, same as Sunday, about 30 min. Turn halfway.' },
    { time: '0:10', title: 'Mince', text: '400 g with the hidden veg, same as Sunday.' },
    { time: '0:35', title: 'Bag it', text: 'Cool 30–45 min, then 4 lunch bags: Thu, Fri, Sat and 1 spare for the freezer.' },
  ],
  daily: [
    ['Every evening', 'Move tomorrow’s bags from the freezer to the fridge. Thursday: Friday’s chicken.'],
    ['Lunch · 6 min', 'Empty the bag into the pan with 2–3 tbsp water. Lid on 3–4 min, then stir until steaming hot. Fill 2 buns.'],
    ['Dinner · 8 min', 'Frozen veg 4 min, then the rice pouch, chicken and a splash of water for 3 min. Sauce last.'],
    ['Skyr nights · Thu & Sat', '300 g skyr, 50 g oats, 1 banana, 1 tbsp honey. 2 minutes.'],
    ['Salmon day', 'Oven 200°C for 12–15 min (20 from frozen), or pan skin side down 4 + 2 min. Make one fewer lunch bag.'],
    ['Never heat the bag', 'Empty it into the pan. Use water, not oil. Oil? Log it: 1 tbsp is 90 kcal.'],
  ],
  safety: [
    'Into the fridge within 1 hour of cooking. Cooked food keeps 3 days.',
    'Reheat once, until steaming hot all the way through.',
    'Thaw in the fridge, never on the counter.',
    'Raw chicken: don’t rinse it, use its own board, wash hands and tools right after.',
  ],
};

export const GROCERIES: { group: string; items: [string, string, string][] }[] = [
  { group: 'Every week', items: [
    ['g_eggs', 'Eggs', '24'],
    ['g_mince', 'Beef mince, 5% fat', '2 × 400 g'],
    ['g_chicken', 'Chicken breast', '~650 g'],
    ['g_yogurt', 'Vanilla yogurt + granola', '7 pots'],
    ['g_skyr', 'Skyr', '~600 g'],
    ['g_milk', 'Milk, 1.5%', '2–3 L'],
    ['g_polse', 'Grove pølsebrød', '2 packs'],
    ['g_bun', 'Grove burgerbrød', '3 packs'],
    ['g_potato', 'Baby potatoes', '~1 kg'],
    ['g_rice', 'Rice pouches, plain', '5'],
    ['g_banana', 'Bananas', '9–10'],
    ['g_wok', 'Frozen wok mix', '500 g'],
    ['g_salmon', 'Salmon fillets, frozen', 'optional'],
    ['g_fruit', 'Kiwi, orange or apple', 'optional'],
  ] },
  { group: 'Every 2–4 weeks', items: [
    ['g_oats', 'Oats', '1 kg'],
    ['g_whey', 'Whey protein', ''],
    ['g_pb', 'Peanut butter', ''],
    ['g_honey', 'Honey', ''],
    ['g_sauce', 'Sweet chilli or BBQ sauce', ''],
    ['g_ketchup', 'Ketchup', ''],
    ['g_spice', 'Burger or taco spice', ''],
    ['g_hidden', 'Frozen onion, peppers, spinach', ''],
    ['g_tuna', 'Tuna cans', '2–3 backup'],
    ['g_supp', 'Creatine + vitamin D', ''],
  ] },
  { group: 'Supplies', items: [
    ['g_bags', 'Zip-lock freezer bags', '~10 a week'],
    ['g_marker', 'Marker', ''],
    ['g_paper', 'Baking paper', ''],
  ] },
];
