/**
 * Home screen strings in English, Hindi and Marathi.
 *
 * Scope: the Home screen of both design directions (header, weather, alerts,
 * quick actions, Kisani Didi and voice). Other screens stay in English for now.
 *
 * ⚠ NEEDS NATIVE-SPEAKER REVIEW: every Hindi (`hi`) and Marathi (`mr`) string
 * below is a first draft written without a native-speaker check. Have a Hindi
 * and a Marathi speaker (ideally a Kisani Didi) review them before release.
 * `REVIEW_STATUS` is shown in the app so testers know.
 *
 * Shape: `en` is the source of truth. `hi` and `mr` must match its type, so a
 * missing key is a compile error.
 */
import { useMemo } from 'react';
import type { StepId } from '@/types';
import type { Language } from '@/services/store';
import { useStore } from '@/services/store';
import type { HomeAlert, AlertSeverity } from '@/lib/alerts';
import type { SprayKind } from '@/lib/weather';

export type DayPart = 'morning' | 'afternoon' | 'evening';
export type Condition = 'clear' | 'mostlyClear' | 'partlyCloudy' | 'overcast' | 'fog' | 'drizzle' | 'rain' | 'showers' | 'storm' | 'cloudy';
export type QuickKey = 'records' | 'order' | 'bookings' | 'updates';
export type VoiceIntent = 'weather' | 'records' | 'order' | 'bookings' | 'fields' | 'updates';

/** Words the dictionary functions receive, already localised by `alertText`. */
interface V {
  day: string;
  value: number;
  crop: string;
  field: string;
  step: string;
  id: string;
  title: string;
  done: number;
  total: number;
}
type AlertCopy = { title: (v: V) => string; body: (v: V) => string; action: string };

const en = {
  langName: 'English',
  langShort: 'EN',
  language: 'Language',
  languageHint: 'Choose language',
  languagePicker: {
    title: 'Choose your language',
    device: 'Device language',
    current: (name: string) => `Language: ${name}. Change language`,
  },
  reviewNote: '',

  greeting: (p: DayPart, name: string) => `Good ${p}, ${name}`,
  notifications: 'Notifications',
  account: 'Your account',
  search: 'Search',

  /* Weather */
  weather: 'Weather',
  live: 'Live',
  sample: 'Sample forecast',
  sampleLong: 'Live weather couldn’t be loaded, so this is a sample forecast. Alerts below use it too.',
  tryLive: 'Try live weather',
  source: 'Forecast: Open-Meteo',
  updated: (when: string) => `Updated ${when}`,
  loadingWeather: 'Loading weather',
  openForecast: 'See full forecast',
  feelsLike: 'Feels like',
  humidity: 'Humidity',
  wind: 'Wind',
  rain: 'Rain',
  high: 'High',
  low: 'Low',
  today: 'Today',
  tomorrow: 'Tomorrow',
  now: 'Now',
  next12: 'Next 12 hours',
  days7: '7 days',
  nextDays: 'Next days',
  rainChance: (pct: number) => `${pct}% rain`,
  kph: (n: number) => `${n} km/h`,
  weatherA11y: (temp: number, cond: string, advice: string) => `Weather: ${temp} degrees, ${cond}. ${advice}. Open forecast`,
  dayA11y: (day: string, cond: string, lo: number, hi: number, pct: number) => `${day}: ${cond}, ${lo} to ${hi} degrees, ${pct}% chance of rain`,
  cond: {
    clear: 'Clear sky',
    mostlyClear: 'Mostly clear',
    partlyCloudy: 'Partly cloudy',
    overcast: 'Overcast',
    fog: 'Foggy',
    drizzle: 'Drizzle',
    rain: 'Rain',
    showers: 'Rain showers',
    storm: 'Thunderstorm',
    cloudy: 'Cloudy',
  } satisfies Record<Condition, string>,
  sprayKicker: 'Spray advice',
  spray: {
    rain: { title: 'Avoid spraying today', text: (pct: number) => `Rain is likely (${pct}% chance). Spray may wash off.` },
    wind: { title: 'Too windy to spray', text: (kph: number) => `Wind at ${kph} km/h will carry spray away. Try early tomorrow.` },
    heat: { title: 'Spray before 10 AM', text: (_: number) => 'It is hot. Spray in the cool morning or after 4 PM.' },
    good: { title: 'Good day to spray', text: (_: number) => 'Calm and dry. Spray in the morning or late afternoon.' },
  } satisfies Record<SprayKind, { title: string; text: (n: number) => string }>,

  /* Alerts */
  alertsTitle: 'For your farm today',
  alertsKicker: 'Alerts',
  alertsCount: (n: number) => (n === 1 ? '1 alert' : `${n} alerts`),
  alertsLoading: 'Checking forecast and your records',
  alertsNone: 'All clear today',
  alertsNoneBody: 'No weather warnings and nothing pending in your records.',
  alertsError: 'Couldn’t check your records',
  alertsOffline: 'You’re offline, so your records can’t be checked. Weather alerts use the sample forecast until you reconnect.',
  showAll: (n: number) => `Show all ${n}`,
  showFewer: 'Show fewer',
  fromSample: 'Sample forecast',
  retry: 'Try again',
  severity: { urgent: 'Urgent', warning: 'Warning', normal: 'Advice' } satisfies Record<AlertSeverity, string>,
  alert: {
    storm: { title: (v) => `Thunderstorm ${v.day}`, body: () => 'Keep animals and tools under cover. Stay out of open fields when there is lightning.', action: 'See forecast' },
    heavyRain: { title: (v) => `Heavy rain ${v.day}`, body: (v) => `About ${v.value} mm expected. Clear field drains. Hold fertiliser and spraying.`, action: 'See forecast' },
    rainLikely: { title: (v) => `Rain likely ${v.day}`, body: (v) => `${v.value}% chance. Finish spraying before then and cover harvested produce.`, action: 'See forecast' },
    heat: { title: (v) => `Very hot ${v.day}: up to ${v.value}°`, body: () => 'Water crops early morning or evening. Rest in the shade from 12 to 3 PM.', action: 'See forecast' },
    wind: { title: (v) => `Strong wind: ${v.value} km/h`, body: () => 'Do not spray. Tie down covers and stacked straw.', action: 'See forecast' },
    cold: { title: (v) => `Cold night ${v.day}: ${v.value}°`, body: () => 'Light watering in the evening can protect young plants from frost.', action: 'See forecast' },
    irrigate: { title: (v) => `No rain for ${v.value} days`, body: (v) => `It is dry and warm. Plan watering for ${v.field} (${v.crop}), then record it.`, action: 'Record watering' },
    humidity: { title: (v) => `Damp, warm air (${v.value}% humidity)`, body: (v) => `This weather helps leaf disease spread. Check ${v.crop || 'your crop'} leaves. Ask Didi if you see spots.`, action: 'Open field' },
    nextStep: { title: (v) => `Next record for ${v.crop}: ${v.step}`, body: (v) => `${v.done} of ${v.total} steps recorded on ${v.field}.`, action: 'Open record' },
    harvestSoon: { title: (v) => `${v.crop} harvest in ${v.value} days`, body: () => 'Book straw baling early so the field is cleared on time.', action: 'Book service' },
    emptyField: { title: (v) => `No crop recorded on ${v.field}`, body: () => 'Add what you are growing to get advice for it.', action: 'Add crop' },
    bookingRejected: { title: (v) => `Booking #${v.id} was not accepted`, body: () => 'Open it to see why and pick another date.', action: 'Open booking' },
    bookingPending: { title: (v) => `Booking #${v.id} waits for approval`, body: (v) => `${v.crop} on ${v.field}, planned ${v.day}.`, action: 'Open booking' },
    bookingSoon: { title: (v) => `Service visit ${v.day}`, body: (v) => `Booking #${v.id} for ${v.crop} is approved.`, action: 'Open booking' },
    orderRejected: { title: (v) => `Order ${v.id} was not approved`, body: () => 'Open it to see the reason.', action: 'Open order' },
    eventLive: { title: (v) => `Live now: ${v.title}`, body: () => 'You can still join.', action: 'Open event' },
  } satisfies Record<HomeAlert['kind'], AlertCopy>,

  /* Quick actions */
  quickTitle: 'Quick actions',
  quick: { records: 'Field records', order: 'Order FOM', bookings: 'Bookings', updates: 'Farm updates' } satisfies Record<QuickKey, string>,
  quickHint: {
    records: (done: number, total: number) => `${done}/${total} steps`,
    noRecords: 'None yet',
    pending: (n: number) => `${n} waiting`,
    upToDate: 'Up to date',
    unread: (n: number) => `${n} new`,
    noUpdates: 'All read',
    verify: 'Verify first',
    unknown: 'Not loaded',
  },

  /* Verification */
  verifyTitle: 'Verification pending',
  verifyBody: 'Ordering FOM and bookings unlock once your number is verified.',
  verifyNow: 'Verify now',
  verifyReasonOrder: 'Ordering FOM needs a verified mobile number',
  verifyReasonBooking: 'Bookings need a verified mobile number',

  /* Kisani Didi */
  didiRole: 'Your Kisani Didi',
  didiSpeaks: (langs: string) => `Speaks ${langs}`,
  didiLangs: (l: string[]) => l.join(' and '),
  call: 'Call',
  message: 'Message',
  askDidi: 'Ask Didi',
  askDidiHint: 'Speak, don’t type',

  /* Voice */
  voice: {
    title: 'Ask Kisani Didi',
    intro: 'Speak your question. Your words are written down so you can send them to Didi. Didi replies herself. There is no robot.',
    listenIn: (lang: string) => `Listening in ${lang}`,
    tap: 'Tap the mic and speak',
    listening: 'Listening… speak now',
    stop: 'Stop',
    processing: 'Writing down your words…',
    youSaid: 'You said',
    send: 'Send to Didi on WhatsApp',
    callDidi: 'Call Didi',
    again: 'Speak again',
    edit: 'Words not right? Speak again or call Didi.',
    shortcut: 'This matches a screen in the app',
    open: { weather: 'Open the forecast', records: 'Open field records', order: 'Order FOM', bookings: 'Open bookings', fields: 'Open my fields', updates: 'Open farm updates' } satisfies Record<VoiceIntent, string>,
    unsupportedTitle: 'Voice doesn’t work in this browser',
    unsupportedBody: 'You can still call Didi, or send her a voice note on WhatsApp.',
    deniedTitle: 'Microphone is blocked',
    deniedBody: 'Allow the microphone for this app in your browser settings, then try again. Or call Didi.',
    noSpeechTitle: 'We didn’t hear anything',
    noSpeechBody: 'Hold the phone closer and speak again.',
    offlineTitle: 'Voice needs internet',
    offlineBody: 'Speech to text works only when you are online. Call Didi, or try again when connected.',
    errorTitle: 'Voice stopped working',
    errorBody: 'Something went wrong with speech to text. Try again or call Didi.',
    privacy: 'Your browser’s speech service turns speech into text. Nothing is sent to Didi until you tap Send.',
    mic: 'Start speaking',
    micStop: 'Stop and use these words',
    messagePrefix: 'Namaste Didi, ',
  },

  /* Sections */
  nextEvent: 'Next event',
  happeningNow: 'Happening now',
  allEvents: 'All events',
  myFields: 'My fields',
  fieldsSummary: (n: number, acres: number) => `${n} registered · ${acres} acres`,
  addField: 'Add a field',
  latestNews: 'Latest news',
  topStory: 'Top story',
  browseLearn: 'Browse everything in Learn',
  seeAll: 'See all',
  englishOnly: 'In English',

  /* Day words */
  dayWord: (offset: number, weekday: string) => (offset === 0 ? 'today' : offset === 1 ? 'tomorrow' : `on ${weekday}`),

  steps: {
    'land-preparation': 'Land preparation',
    sowing: 'Sowing',
    intercultivation: 'Weeding',
    water: 'Watering',
    nutrients: 'Nutrients',
    pesticides: 'Pest control',
    harvest: 'Harvest',
    transport: 'Transport',
  } satisfies Record<StepId, string>,
  crops: {} as Record<string, string>,
  locale: 'en-IN',
  speechLang: 'en-IN',
};

export type HomeDict = typeof en;

/* ⚠ NEEDS NATIVE-SPEAKER REVIEW (Hindi) */
const hi: HomeDict = {
  langName: 'हिन्दी',
  langShort: 'हिं',
  language: 'भाषा',
  languageHint: 'भाषा चुनें',
  languagePicker: {
    title: 'अपनी भाषा चुनें',
    device: 'फ़ोन की भाषा',
    current: (name) => `भाषा: ${name}। भाषा बदलें`,
  },
  reviewNote: 'हिन्दी अनुवाद की जाँच अभी बाकी है।',

  greeting: (p, name) => `${p === 'morning' ? 'सुप्रभात' : p === 'afternoon' ? 'नमस्ते' : 'शुभ संध्या'}, ${name}`,
  notifications: 'सूचनाएँ',
  account: 'आपका खाता',
  search: 'खोजें',

  weather: 'मौसम',
  live: 'लाइव',
  sample: 'नमूना पूर्वानुमान',
  sampleLong: 'लाइव मौसम नहीं मिल सका, इसलिए यह नमूना पूर्वानुमान है। नीचे की चेतावनियाँ भी इसी पर आधारित हैं।',
  tryLive: 'लाइव मौसम फिर देखें',
  source: 'पूर्वानुमान: Open-Meteo',
  updated: (when) => `अपडेट: ${when}`,
  loadingWeather: 'मौसम लोड हो रहा है',
  openForecast: 'पूरा पूर्वानुमान देखें',
  feelsLike: 'महसूस',
  humidity: 'नमी',
  wind: 'हवा',
  rain: 'बारिश',
  high: 'अधिकतम',
  low: 'न्यूनतम',
  today: 'आज',
  tomorrow: 'कल',
  now: 'अभी',
  next12: 'अगले 12 घंटे',
  days7: '7 दिन',
  nextDays: 'आने वाले दिन',
  rainChance: (pct) => `${pct}% बारिश`,
  kph: (n) => `${n} किमी/घं`,
  weatherA11y: (temp, cond, advice) => `मौसम: ${temp} डिग्री, ${cond}। ${advice}। पूर्वानुमान खोलें`,
  dayA11y: (day, cond, lo, hi2, pct) => `${day}: ${cond}, ${lo} से ${hi2} डिग्री, बारिश की संभावना ${pct}%`,
  cond: {
    clear: 'साफ़ आसमान',
    mostlyClear: 'ज़्यादातर साफ़',
    partlyCloudy: 'आंशिक बादल',
    overcast: 'घने बादल',
    fog: 'कोहरा',
    drizzle: 'बूँदाबाँदी',
    rain: 'बारिश',
    showers: 'बौछारें',
    storm: 'आँधी-तूफ़ान',
    cloudy: 'बादल',
  },
  sprayKicker: 'छिड़काव सलाह',
  spray: {
    rain: { title: 'आज छिड़काव न करें', text: (pct) => `बारिश की संभावना ${pct}% है। दवा धुल सकती है।` },
    wind: { title: 'छिड़काव के लिए हवा तेज़ है', text: (kph) => `${kph} किमी/घं की हवा दवा उड़ा ले जाएगी। कल सुबह जल्दी करें।` },
    heat: { title: 'सुबह 10 बजे से पहले छिड़कें', text: () => 'गर्मी है। ठंडी सुबह या शाम 4 बजे के बाद छिड़काव करें।' },
    good: { title: 'छिड़काव के लिए अच्छा दिन', text: () => 'हवा शांत और मौसम सूखा है। सुबह या शाम को छिड़कें।' },
  },

  alertsTitle: 'आज आपके खेत के लिए',
  alertsKicker: 'चेतावनियाँ',
  alertsCount: (n) => `${n} चेतावनी`,
  alertsLoading: 'पूर्वानुमान और आपके रिकॉर्ड देखे जा रहे हैं',
  alertsNone: 'आज सब ठीक है',
  alertsNoneBody: 'कोई मौसम चेतावनी नहीं, और रिकॉर्ड में कुछ बाकी नहीं।',
  alertsError: 'आपके रिकॉर्ड नहीं देखे जा सके',
  alertsOffline: 'आप ऑफ़लाइन हैं, इसलिए आपके रिकॉर्ड नहीं देखे जा सकते। दोबारा जुड़ने तक मौसम चेतावनियाँ नमूना पूर्वानुमान पर आधारित हैं।',
  showAll: (n) => `सभी ${n} देखें`,
  showFewer: 'कम दिखाएँ',
  fromSample: 'नमूना पूर्वानुमान',
  retry: 'फिर कोशिश करें',
  severity: { urgent: 'तुरंत', warning: 'सावधान', normal: 'सलाह' },
  alert: {
    storm: { title: (v) => `${v.day} आँधी-तूफ़ान`, body: () => 'पशु और औज़ार ढककर रखें। बिजली कड़कने पर खुले खेत में न रहें।', action: 'पूर्वानुमान देखें' },
    heavyRain: { title: (v) => `${v.day} भारी बारिश`, body: (v) => `लगभग ${v.value} मिमी बारिश संभव। खेत की नालियाँ साफ़ करें। खाद और छिड़काव रोकें।`, action: 'पूर्वानुमान देखें' },
    rainLikely: { title: (v) => `${v.day} बारिश की संभावना`, body: (v) => `${v.value}% संभावना। उससे पहले छिड़काव पूरा करें और कटी फ़सल ढकें।`, action: 'पूर्वानुमान देखें' },
    heat: { title: (v) => `${v.day} तेज़ गर्मी: ${v.value}° तक`, body: () => 'फ़सल को सुबह जल्दी या शाम को पानी दें। दोपहर 12 से 3 बजे छाँव में रहें।', action: 'पूर्वानुमान देखें' },
    wind: { title: (v) => `तेज़ हवा: ${v.value} किमी/घं`, body: () => 'छिड़काव न करें। तिरपाल और पुआल के ढेर बाँधकर रखें।', action: 'पूर्वानुमान देखें' },
    cold: { title: (v) => `${v.day} ठंडी रात: ${v.value}°`, body: () => 'शाम को हल्की सिंचाई छोटे पौधों को पाले से बचा सकती है।', action: 'पूर्वानुमान देखें' },
    irrigate: { title: (v) => `${v.value} दिन बारिश नहीं`, body: (v) => `मौसम सूखा और गर्म है। ${v.field} पर ${v.crop} की सिंचाई की योजना बनाएँ, फिर रिकॉर्ड करें।`, action: 'सिंचाई रिकॉर्ड करें' },
    humidity: { title: (v) => `नम और गर्म हवा (${v.value}% नमी)`, body: (v) => `ऐसे मौसम में पत्तियों के रोग फैल सकते हैं। ${v.crop || 'फ़सल'} की पत्तियाँ जाँचें। धब्बे दिखें तो दीदी से पूछें।`, action: 'खेत खोलें' },
    nextStep: { title: (v) => `${v.crop} का अगला रिकॉर्ड: ${v.step}`, body: (v) => `${v.field} पर ${v.total} में से ${v.done} चरण दर्ज।`, action: 'रिकॉर्ड खोलें' },
    harvestSoon: { title: (v) => `${v.value} दिन में ${v.crop} की कटाई`, body: () => 'पुआल की गठरी (बेलिंग) जल्दी बुक करें, ताकि खेत समय पर खाली हो।', action: 'सेवा बुक करें' },
    emptyField: { title: (v) => `${v.field} पर कोई फ़सल दर्ज नहीं`, body: () => 'आप क्या उगा रहे हैं, यह जोड़ें ताकि उसकी सलाह मिल सके।', action: 'फ़सल जोड़ें' },
    bookingRejected: { title: (v) => `बुकिंग #${v.id} स्वीकार नहीं हुई`, body: () => 'कारण देखने और दूसरी तारीख़ चुनने के लिए खोलें।', action: 'बुकिंग खोलें' },
    bookingPending: { title: (v) => `बुकिंग #${v.id} मंज़ूरी की प्रतीक्षा में`, body: (v) => `${v.field} पर ${v.crop}, ${v.day} के लिए।`, action: 'बुकिंग खोलें' },
    bookingSoon: { title: (v) => `${v.day} सेवा आएगी`, body: (v) => `${v.crop} के लिए बुकिंग #${v.id} मंज़ूर है।`, action: 'बुकिंग खोलें' },
    orderRejected: { title: (v) => `ऑर्डर ${v.id} मंज़ूर नहीं हुआ`, body: () => 'कारण देखने के लिए खोलें।', action: 'ऑर्डर खोलें' },
    eventLive: { title: (v) => `अभी लाइव: ${v.title}`, body: () => 'आप अब भी जुड़ सकते हैं।', action: 'कार्यक्रम खोलें' },
  },

  quickTitle: 'जल्दी के काम',
  quick: { records: 'खेत रिकॉर्ड', order: 'FOM ऑर्डर', bookings: 'बुकिंग', updates: 'खेत अपडेट' },
  quickHint: {
    records: (done, total) => `${done}/${total} चरण`,
    noRecords: 'अभी कोई नहीं',
    pending: (n) => `${n} बाकी`,
    upToDate: 'सब ठीक',
    unread: (n) => `${n} नए`,
    noUpdates: 'सब पढ़ लिया',
    verify: 'पहले सत्यापन',
    unknown: 'लोड नहीं हुआ',
  },

  verifyTitle: 'सत्यापन बाकी है',
  verifyBody: 'नंबर सत्यापित होने के बाद FOM ऑर्डर और बुकिंग खुलेंगे।',
  verifyNow: 'अभी सत्यापित करें',
  verifyReasonOrder: 'Ordering FOM needs a verified mobile number',
  verifyReasonBooking: 'Bookings need a verified mobile number',

  didiRole: 'आपकी किसानी दीदी',
  didiSpeaks: (langs) => `${langs} बोलती हैं`,
  didiLangs: (l) => l.map((x) => (x === 'Marathi' ? 'मराठी' : x === 'Hindi' ? 'हिन्दी' : x === 'English' ? 'अंग्रेज़ी' : x)).join(' और '),
  call: 'कॉल करें',
  message: 'संदेश',
  askDidi: 'दीदी से पूछें',
  askDidiHint: 'लिखें नहीं, बोलें',

  voice: {
    title: 'किसानी दीदी से पूछें',
    intro: 'अपना सवाल बोलें। आपके शब्द लिख लिए जाएँगे ताकि आप उन्हें दीदी को भेज सकें। जवाब दीदी ख़ुद देंगी, कोई रोबोट नहीं।',
    listenIn: (lang) => `${lang} में सुन रहे हैं`,
    tap: 'माइक दबाएँ और बोलें',
    listening: 'सुन रहे हैं… अब बोलें',
    stop: 'रोकें',
    processing: 'आपके शब्द लिखे जा रहे हैं…',
    youSaid: 'आपने कहा',
    send: 'WhatsApp पर दीदी को भेजें',
    callDidi: 'दीदी को कॉल करें',
    again: 'फिर से बोलें',
    edit: 'शब्द सही नहीं? फिर से बोलें या दीदी को कॉल करें।',
    shortcut: 'यह ऐप की एक स्क्रीन से मेल खाता है',
    open: { weather: 'पूर्वानुमान खोलें', records: 'खेत रिकॉर्ड खोलें', order: 'FOM ऑर्डर करें', bookings: 'बुकिंग खोलें', fields: 'मेरे खेत खोलें', updates: 'खेत अपडेट खोलें' },
    unsupportedTitle: 'इस ब्राउज़र में आवाज़ नहीं चलती',
    unsupportedBody: 'आप फिर भी दीदी को कॉल कर सकते हैं, या WhatsApp पर वॉइस नोट भेज सकते हैं।',
    deniedTitle: 'माइक्रोफ़ोन बंद है',
    deniedBody: 'ब्राउज़र की सेटिंग में इस ऐप के लिए माइक्रोफ़ोन चालू करें, फिर कोशिश करें। या दीदी को कॉल करें।',
    noSpeechTitle: 'कुछ सुनाई नहीं दिया',
    noSpeechBody: 'फ़ोन पास रखकर फिर से बोलें।',
    offlineTitle: 'आवाज़ के लिए इंटरनेट चाहिए',
    offlineBody: 'बोलकर लिखना सिर्फ़ ऑनलाइन चलता है। दीदी को कॉल करें, या इंटरनेट आने पर फिर कोशिश करें।',
    errorTitle: 'आवाज़ ने काम करना बंद किया',
    errorBody: 'बोलकर लिखने में गड़बड़ी हुई। फिर कोशिश करें या दीदी को कॉल करें।',
    privacy: 'आपके ब्राउज़र की स्पीच सेवा आवाज़ को शब्दों में बदलती है। भेजें दबाने से पहले दीदी को कुछ नहीं जाता।',
    mic: 'बोलना शुरू करें',
    micStop: 'रोकें और ये शब्द लें',
    messagePrefix: 'नमस्ते दीदी, ',
  },

  nextEvent: 'अगला कार्यक्रम',
  happeningNow: 'अभी चल रहा है',
  allEvents: 'सभी कार्यक्रम',
  myFields: 'मेरे खेत',
  fieldsSummary: (n, acres) => `${n} खेत · ${acres} एकड़`,
  addField: 'खेत जोड़ें',
  latestNews: 'ताज़ा ख़बरें',
  topStory: 'मुख्य ख़बर',
  browseLearn: 'सीखें में सब कुछ देखें',
  seeAll: 'सभी देखें',
  englishOnly: 'अंग्रेज़ी में',

  dayWord: (offset, weekday) => (offset === 0 ? 'आज' : offset === 1 ? 'कल' : `${weekday} को`),

  steps: {
    'land-preparation': 'ज़मीन की तैयारी',
    sowing: 'बुवाई',
    intercultivation: 'निराई-गुड़ाई',
    water: 'सिंचाई',
    nutrients: 'खाद',
    pesticides: 'कीट नियंत्रण',
    harvest: 'कटाई',
    transport: 'ढुलाई',
  },
  crops: { Rice: 'धान', Wheat: 'गेहूँ', Cotton: 'कपास', 'Chickpea (gram)': 'चना', 'Green gram (moong)': 'मूँग' },
  locale: 'hi-IN',
  speechLang: 'hi-IN',
};

/* ⚠ NEEDS NATIVE-SPEAKER REVIEW (Marathi) */
const mr: HomeDict = {
  langName: 'मराठी',
  langShort: 'मरा',
  language: 'भाषा',
  languageHint: 'भाषा निवडा',
  languagePicker: {
    title: 'तुमची भाषा निवडा',
    device: 'फोनची भाषा',
    current: (name) => `भाषा: ${name}. भाषा बदला`,
  },
  reviewNote: 'मराठी भाषांतराची तपासणी अजून बाकी आहे.',

  greeting: (p, name) => `${p === 'morning' ? 'सुप्रभात' : p === 'afternoon' ? 'नमस्कार' : 'शुभ संध्याकाळ'}, ${name}`,
  notifications: 'सूचना',
  account: 'तुमचे खाते',
  search: 'शोधा',

  weather: 'हवामान',
  live: 'थेट',
  sample: 'नमुना अंदाज',
  sampleLong: 'थेट हवामान मिळाले नाही, म्हणून हा नमुना अंदाज आहे. खालील सूचनाही यावरच आधारित आहेत.',
  tryLive: 'थेट हवामान पुन्हा पाहा',
  source: 'अंदाज: Open-Meteo',
  updated: (when) => `अद्ययावत: ${when}`,
  loadingWeather: 'हवामान लोड होत आहे',
  openForecast: 'पूर्ण अंदाज पाहा',
  feelsLike: 'जाणवते',
  humidity: 'आर्द्रता',
  wind: 'वारा',
  rain: 'पाऊस',
  high: 'कमाल',
  low: 'किमान',
  today: 'आज',
  tomorrow: 'उद्या',
  now: 'आता',
  next12: 'पुढील 12 तास',
  days7: '7 दिवस',
  nextDays: 'पुढील दिवस',
  rainChance: (pct) => `${pct}% पाऊस`,
  kph: (n) => `${n} किमी/ता`,
  weatherA11y: (temp, cond, advice) => `हवामान: ${temp} अंश, ${cond}. ${advice}. अंदाज उघडा`,
  dayA11y: (day, cond, lo, hi2, pct) => `${day}: ${cond}, ${lo} ते ${hi2} अंश, पावसाची शक्यता ${pct}%`,
  cond: {
    clear: 'निरभ्र आकाश',
    mostlyClear: 'बहुतांश निरभ्र',
    partlyCloudy: 'अंशतः ढगाळ',
    overcast: 'पूर्ण ढगाळ',
    fog: 'धुके',
    drizzle: 'रिमझिम',
    rain: 'पाऊस',
    showers: 'सरी',
    storm: 'वादळी पाऊस',
    cloudy: 'ढगाळ',
  },
  sprayKicker: 'फवारणी सल्ला',
  spray: {
    rain: { title: 'आज फवारणी टाळा', text: (pct) => `पावसाची शक्यता ${pct}% आहे. औषध धुऊन जाऊ शकते.` },
    wind: { title: 'फवारणीसाठी वारा जास्त आहे', text: (kph) => `${kph} किमी/ता वाऱ्याने औषध उडून जाईल. उद्या सकाळी लवकर करा.` },
    heat: { title: 'सकाळी 10 पूर्वी फवारा', text: () => 'उष्णता आहे. थंड सकाळी किंवा दुपारी 4 नंतर फवारणी करा.' },
    good: { title: 'फवारणीसाठी चांगला दिवस', text: () => 'वारा शांत आणि हवामान कोरडे आहे. सकाळी किंवा संध्याकाळी फवारा.' },
  },

  alertsTitle: 'आज तुमच्या शेतासाठी',
  alertsKicker: 'सूचना',
  alertsCount: (n) => `${n} सूचना`,
  alertsLoading: 'अंदाज आणि तुमच्या नोंदी तपासत आहोत',
  alertsNone: 'आज सर्व ठीक आहे',
  alertsNoneBody: 'हवामानाचा कोणताही इशारा नाही आणि नोंदींमध्ये काही बाकी नाही.',
  alertsError: 'तुमच्या नोंदी तपासता आल्या नाहीत',
  alertsOffline: 'तुम्ही ऑफलाइन आहात, त्यामुळे तुमच्या नोंदी तपासता येत नाहीत. पुन्हा जोडले जाईपर्यंत हवामान सूचना नमुना अंदाजावर आधारित आहेत.',
  showAll: (n) => `सर्व ${n} पाहा`,
  showFewer: 'कमी दाखवा',
  fromSample: 'नमुना अंदाज',
  retry: 'पुन्हा प्रयत्न करा',
  severity: { urgent: 'तातडीचे', warning: 'सावधान', normal: 'सल्ला' },
  alert: {
    storm: { title: (v) => `${v.day} वादळी पाऊस`, body: () => 'जनावरे आणि अवजारे आडोशाला ठेवा. वीज चमकत असताना उघड्या शेतात थांबू नका.', action: 'अंदाज पाहा' },
    heavyRain: { title: (v) => `${v.day} मुसळधार पाऊस`, body: (v) => `सुमारे ${v.value} मिमी पाऊस अपेक्षित. शेतातील चर मोकळे करा. खत आणि फवारणी थांबवा.`, action: 'अंदाज पाहा' },
    rainLikely: { title: (v) => `${v.day} पावसाची शक्यता`, body: (v) => `${v.value}% शक्यता. त्याआधी फवारणी पूर्ण करा आणि काढलेले पीक झाका.`, action: 'अंदाज पाहा' },
    heat: { title: (v) => `${v.day} कडक उष्णता: ${v.value}° पर्यंत`, body: () => 'पिकांना सकाळी लवकर किंवा संध्याकाळी पाणी द्या. दुपारी 12 ते 3 सावलीत राहा.', action: 'अंदाज पाहा' },
    wind: { title: (v) => `जोरदार वारा: ${v.value} किमी/ता`, body: () => 'फवारणी करू नका. ताडपत्री आणि गवताचे ढीग बांधून ठेवा.', action: 'अंदाज पाहा' },
    cold: { title: (v) => `${v.day} थंड रात्र: ${v.value}°`, body: () => 'संध्याकाळी हलके पाणी दिल्यास लहान रोपे दवापासून वाचू शकतात.', action: 'अंदाज पाहा' },
    irrigate: { title: (v) => `${v.value} दिवस पाऊस नाही`, body: (v) => `हवामान कोरडे आणि उष्ण आहे. ${v.field} वरील ${v.crop} ला पाणी देण्याचे नियोजन करा, नंतर नोंद करा.`, action: 'पाण्याची नोंद करा' },
    humidity: { title: (v) => `दमट, उबदार हवा (${v.value}% आर्द्रता)`, body: (v) => `अशा हवामानात पानांवरील रोग पसरू शकतात. ${v.crop || 'पिकाची'} पाने तपासा. डाग दिसल्यास दीदींना विचारा.`, action: 'शेत उघडा' },
    nextStep: { title: (v) => `${v.crop} ची पुढील नोंद: ${v.step}`, body: (v) => `${v.field} वर ${v.total} पैकी ${v.done} टप्पे नोंदवले.`, action: 'नोंद उघडा' },
    harvestSoon: { title: (v) => `${v.value} दिवसांत ${v.crop} कापणी`, body: () => 'पेंढ्याची गाठ (बेलिंग) लवकर बुक करा, म्हणजे शेत वेळेवर मोकळे होईल.', action: 'सेवा बुक करा' },
    emptyField: { title: (v) => `${v.field} वर पिकाची नोंद नाही`, body: () => 'तुम्ही काय पिकवत आहात ते जोडा, म्हणजे त्याचा सल्ला मिळेल.', action: 'पीक जोडा' },
    bookingRejected: { title: (v) => `बुकिंग #${v.id} स्वीकारले नाही`, body: () => 'कारण पाहण्यासाठी आणि दुसरी तारीख निवडण्यासाठी उघडा.', action: 'बुकिंग उघडा' },
    bookingPending: { title: (v) => `बुकिंग #${v.id} मंजुरीच्या प्रतीक्षेत`, body: (v) => `${v.field} वर ${v.crop}, ${v.day} साठी.`, action: 'बुकिंग उघडा' },
    bookingSoon: { title: (v) => `${v.day} सेवा येईल`, body: (v) => `${v.crop} साठी बुकिंग #${v.id} मंजूर आहे.`, action: 'बुकिंग उघडा' },
    orderRejected: { title: (v) => `ऑर्डर ${v.id} मंजूर झाली नाही`, body: () => 'कारण पाहण्यासाठी उघडा.', action: 'ऑर्डर उघडा' },
    eventLive: { title: (v) => `आता थेट: ${v.title}`, body: () => 'तुम्ही अजूनही सहभागी होऊ शकता.', action: 'कार्यक्रम उघडा' },
  },

  quickTitle: 'झटपट कामे',
  quick: { records: 'शेत नोंदी', order: 'FOM ऑर्डर', bookings: 'बुकिंग', updates: 'शेत अपडेट' },
  quickHint: {
    records: (done, total) => `${done}/${total} टप्पे`,
    noRecords: 'अजून नाही',
    pending: (n) => `${n} बाकी`,
    upToDate: 'सर्व ठीक',
    unread: (n) => `${n} नवीन`,
    noUpdates: 'सर्व वाचले',
    verify: 'आधी पडताळणी',
    unknown: 'लोड झाले नाही',
  },

  verifyTitle: 'पडताळणी बाकी आहे',
  verifyBody: 'नंबरची पडताळणी झाल्यावर FOM ऑर्डर आणि बुकिंग सुरू होतील.',
  verifyNow: 'आता पडताळणी करा',
  verifyReasonOrder: 'Ordering FOM needs a verified mobile number',
  verifyReasonBooking: 'Bookings need a verified mobile number',

  didiRole: 'तुमच्या किसानी दीदी',
  didiSpeaks: (langs) => `${langs} बोलतात`,
  didiLangs: (l) => l.map((x) => (x === 'Marathi' ? 'मराठी' : x === 'Hindi' ? 'हिंदी' : x === 'English' ? 'इंग्रजी' : x)).join(' आणि '),
  call: 'कॉल करा',
  message: 'संदेश',
  askDidi: 'दीदींना विचारा',
  askDidiHint: 'लिहू नका, बोला',

  voice: {
    title: 'किसानी दीदींना विचारा',
    intro: 'तुमचा प्रश्न बोला. तुमचे शब्द लिहून घेतले जातील, म्हणजे तुम्ही ते दीदींना पाठवू शकता. उत्तर दीदी स्वतः देतील, कोणताही रोबोट नाही.',
    listenIn: (lang) => `${lang} मध्ये ऐकत आहोत`,
    tap: 'माइक दाबा आणि बोला',
    listening: 'ऐकत आहोत… आता बोला',
    stop: 'थांबवा',
    processing: 'तुमचे शब्द लिहून घेत आहोत…',
    youSaid: 'तुम्ही म्हणालात',
    send: 'WhatsApp वर दीदींना पाठवा',
    callDidi: 'दीदींना कॉल करा',
    again: 'पुन्हा बोला',
    edit: 'शब्द बरोबर नाहीत? पुन्हा बोला किंवा दीदींना कॉल करा.',
    shortcut: 'हे ॲपमधील एका स्क्रीनशी जुळते',
    open: { weather: 'अंदाज उघडा', records: 'शेत नोंदी उघडा', order: 'FOM ऑर्डर करा', bookings: 'बुकिंग उघडा', fields: 'माझी शेते उघडा', updates: 'शेत अपडेट उघडा' },
    unsupportedTitle: 'या ब्राउझरमध्ये आवाज चालत नाही',
    unsupportedBody: 'तरीही तुम्ही दीदींना कॉल करू शकता, किंवा WhatsApp वर व्हॉइस नोट पाठवू शकता.',
    deniedTitle: 'मायक्रोफोन बंद आहे',
    deniedBody: 'ब्राउझरच्या सेटिंगमध्ये या ॲपसाठी मायक्रोफोन सुरू करा, मग पुन्हा प्रयत्न करा. किंवा दीदींना कॉल करा.',
    noSpeechTitle: 'काहीच ऐकू आले नाही',
    noSpeechBody: 'फोन जवळ धरून पुन्हा बोला.',
    offlineTitle: 'आवाजासाठी इंटरनेट हवे',
    offlineBody: 'बोलून लिहिणे फक्त ऑनलाइन चालते. दीदींना कॉल करा, किंवा इंटरनेट आल्यावर पुन्हा प्रयत्न करा.',
    errorTitle: 'आवाज बंद पडला',
    errorBody: 'बोलून लिहिण्यात अडचण आली. पुन्हा प्रयत्न करा किंवा दीदींना कॉल करा.',
    privacy: 'तुमच्या ब्राउझरची स्पीच सेवा आवाजाचे शब्दांत रूपांतर करते. पाठवा दाबेपर्यंत दीदींना काहीही जात नाही.',
    mic: 'बोलायला सुरुवात करा',
    micStop: 'थांबवा आणि हे शब्द घ्या',
    messagePrefix: 'नमस्कार दीदी, ',
  },

  nextEvent: 'पुढील कार्यक्रम',
  happeningNow: 'आता सुरू आहे',
  allEvents: 'सर्व कार्यक्रम',
  myFields: 'माझी शेते',
  fieldsSummary: (n, acres) => `${n} शेते · ${acres} एकर`,
  addField: 'शेत जोडा',
  latestNews: 'ताज्या बातम्या',
  topStory: 'मुख्य बातमी',
  browseLearn: 'शिका मध्ये सर्व पाहा',
  seeAll: 'सर्व पाहा',
  englishOnly: 'इंग्रजीत',

  dayWord: (offset, weekday) => (offset === 0 ? 'आज' : offset === 1 ? 'उद्या' : `${weekday} रोजी`),

  steps: {
    'land-preparation': 'जमिनीची मशागत',
    sowing: 'पेरणी',
    intercultivation: 'खुरपणी',
    water: 'पाणी देणे',
    nutrients: 'खत',
    pesticides: 'कीड नियंत्रण',
    harvest: 'कापणी',
    transport: 'वाहतूक',
  },
  crops: { Rice: 'भात', Wheat: 'गहू', Cotton: 'कापूस', 'Chickpea (gram)': 'हरभरा', 'Green gram (moong)': 'मूग' },
  locale: 'mr-IN',
  speechLang: 'mr-IN',
};

/** Translated Home dictionaries. Languages without one use English strings. */
const TRANSLATED: Partial<Record<Language, HomeDict>> = { en, hi, mr };
export const HOME_STRINGS: Record<Language, HomeDict> = { en, hi, mr, pa: en, gu: en, te: en, or: en };

/** Shown in the Language screens and the report. */
export const REVIEW_STATUS: Partial<Record<Language, 'source' | 'needs-native-review'>> = { en: 'source', hi: 'needs-native-review', mr: 'needs-native-review' };

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

export function dayPart(now = new Date()): DayPart {
  const h = now.getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  return 'evening';
}

export function conditionOf(code: number): Condition {
  if (code === 0) return 'clear';
  if (code === 1) return 'mostlyClear';
  if (code === 2) return 'partlyCloudy';
  if (code === 3) return 'overcast';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if (code >= 61 && code <= 67) return 'rain';
  if (code >= 80 && code <= 82) return 'showers';
  if (code >= 95) return 'storm';
  return 'cloudy';
}

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export interface HomeT extends HomeDict {
  lang: Language;
  /** Language the strings are actually in (for `lang` attributes): the chosen one, or English as a fallback. */
  contentLang: Language;
  /** Weekday name in the current language, from an ISO date. */
  weekday: (iso: string, style?: 'short' | 'long') => string;
  /** "today", "tomorrow" or "on Friday" for an ISO date. */
  dayPhrase: (iso: string, now?: Date) => string;
  /** "Today", "Tomorrow" or the short weekday, for forecast rows. */
  dayLabel: (iso: string, index: number, compact?: boolean) => string;
  time: (iso: string) => string;
  crop: (name?: string) => string;
  condition: (code: number) => string;
  /** Relative "x minutes ago" style text in the current language. */
  ago: (iso: string, now?: Date) => string;
}

export function makeT(lang: Language): HomeT {
  const d = HOME_STRINGS[lang];
  const wk = (style: 'short' | 'long') => new Intl.DateTimeFormat(d.locale, { weekday: style, numberingSystem: 'latn' } as Intl.DateTimeFormatOptions);
  const short = wk('short');
  const long = wk('long');
  const hour = new Intl.DateTimeFormat(d.locale, { hour: 'numeric', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions);
  const rel = typeof Intl.RelativeTimeFormat === 'function' ? new Intl.RelativeTimeFormat(d.locale, { numeric: 'auto', numberingSystem: 'latn' } as Intl.RelativeTimeFormatOptions) : null;
  const parse = (iso: string) => (iso.length === 10 ? new Date(`${iso}T12:00:00`) : new Date(iso));
  const t: HomeT = {
    ...d,
    lang,
    contentLang: TRANSLATED[lang] ? lang : 'en',
    weekday: (iso, style = 'short') => (style === 'short' ? short : long).format(parse(iso)),
    dayPhrase: (iso, now = new Date()) => {
      const offset = Math.round((startOfLocalDay(parse(iso)).getTime() - startOfLocalDay(now).getTime()) / 86_400_000);
      return d.dayWord(offset, long.format(parse(iso)));
    },
    dayLabel: (iso, index, compact) => (index === 0 ? d.today : index === 1 && !compact ? d.tomorrow : short.format(parse(iso))),
    time: (iso) => hour.format(new Date(iso)).replace(/\s/g, ' '),
    crop: (name) => (name ? (d.crops[name] ?? name) : ''),
    condition: (code) => d.cond[conditionOf(code)],
    ago: (iso, now = new Date()) => {
      const mins = Math.round((new Date(iso).getTime() - now.getTime()) / 60_000);
      if (!rel) return iso;
      if (Math.abs(mins) < 60) return rel.format(Math.min(0, mins), 'minute');
      return rel.format(Math.round(mins / 60), 'hour');
    },
  };
  return t;
}

/** Localised title, body, action label and severity word for an alert. */
export function alertText(t: HomeT, a: HomeAlert, now = new Date()) {
  const v = a.vars;
  const words: V = {
    day: v.day ? t.dayPhrase(v.day, now) : '',
    value: v.value ?? 0,
    crop: t.crop(v.crop),
    field: v.field ?? '',
    step: v.step ? t.steps[v.step] : '',
    id: v.id ?? '',
    title: v.title ?? '',
    done: v.done ?? 0,
    total: v.total ?? 0,
  };
  const copy = t.alert[a.kind];
  const title = copy.title(words).replace(/\s+/g, ' ').trim();
  return { title: title.charAt(0).toUpperCase() + title.slice(1), body: copy.body(words), action: copy.action, severity: t.severity[a.severity] };
}

/** Spray advice in the current language, from the forecast. */
export function sprayText(t: HomeT, kind: SprayKind, current: { rainChance: number; windKph: number }, next24RainMax: number) {
  const s = t.spray[kind];
  const n = kind === 'rain' ? Math.max(next24RainMax, current.rainChance) : kind === 'wind' ? Math.round(current.windKph) : 0;
  return { title: s.title, text: s.text(n) };
}

/* ------------------------------------------------------------------ */
/* Voice intents: plain keyword matching on this device                 */
/* ------------------------------------------------------------------ */

/** ⚠ NEEDS NATIVE-SPEAKER REVIEW: Hindi and Marathi keywords. */
const INTENT_WORDS: Record<VoiceIntent, string[]> = {
  weather: ['weather', 'rain', 'forecast', 'मौसम', 'बारिश', 'वर्षा', 'हवामान', 'पाऊस'],
  order: ['fom', 'manure', 'order', 'खाद', 'ऑर्डर', 'खत'],
  bookings: ['booking', 'book', 'baling', 'bale', 'बुकिंग', 'बेलिंग', 'गठरी', 'गाठ'],
  records: ['record', 'form', 'step', 'रिकॉर्ड', 'नोंद', 'फॉर्म'],
  fields: ['field', 'land', 'crop', 'खेत', 'ज़मीन', 'जमीन', 'फ़सल', 'फसल', 'शेत', 'पीक'],
  updates: ['update', 'notification', 'news', 'अपडेट', 'सूचना', 'ख़बर', 'खबर', 'बातमी'],
};

export function matchIntent(text: string): VoiceIntent | null {
  const lower = text.toLowerCase();
  let best: VoiceIntent | null = null;
  let bestAt = Infinity;
  (Object.keys(INTENT_WORDS) as VoiceIntent[]).forEach((intent) => {
    INTENT_WORDS[intent].forEach((w) => {
      const at = lower.indexOf(w);
      if (at >= 0 && at < bestAt) {
        best = intent;
        bestAt = at;
      }
    });
  });
  return best;
}

/** Strings for the current Home language. Re-renders when the language changes. */
export function useHomeT(): HomeT {
  const lang = useStore((s) => s.prefs.language);
  return useMemo(() => makeT(lang), [lang]);
}
