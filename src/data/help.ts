export const FAQS: { q: string; a: string }[] = [
  {
    q: 'What does “Verification pending” mean?',
    a: 'Your account works for news, videos and events. To order FOM or book a service, your mobile number must be verified. Verify with an OTP from Account, or ask your Kisani Didi to verify you on her next visit.',
  },
  {
    q: 'How is my FOM order price worked out?',
    a: 'FOM costs ₹100 per kg, plus ₹100 shipping per order. 1 MT (metric tonne) is 1,000 kg. The order screen shows the full calculation before you place the order.',
  },
  {
    q: 'Why was my order or booking rejected?',
    a: 'The reason is shown on the order or booking, for example stock not being available or no operator free on that date. You can place a new request at any time.',
  },
  {
    q: 'Who fills in My forms?',
    a: 'Your Kisani Didi records each season step during her field visits. You can see every step, the date it was recorded and the costs. Pending steps will be filled on upcoming visits.',
  },
  {
    q: 'How do I change a booking date?',
    a: 'Call or message your Kisani Didi from the booking screen. She can move the booking if a slot is free.',
  },
  {
    q: 'Does the app work without internet?',
    a: 'Screens you have opened stay available offline. Placing orders and bookings needs a connection, and the app will tell you if a request could not be sent.',
  },
  {
    q: 'How do I make the text bigger?',
    a: 'Go to Account, then Display, and choose Large text. You can also reduce animations there.',
  },
];

export const LEGAL: Record<'privacy' | 'terms', { title: string; updated: string; sections: { h: string; p: string }[] }> = {
  privacy: {
    title: 'Privacy policy',
    updated: '1 October 2026',
    sections: [
      { h: 'What we collect', p: 'Your name, mobile number, village and the details of your fields, crops, orders and bookings. If you allow it, your approximate location for local weather.' },
      { h: 'Why we collect it', p: 'To process your orders and bookings, to let your Kisani Didi support you, and to show weather and advice for your area.' },
      { h: 'Who can see it', p: 'Kisani Urjaa staff and your assigned Kisani Didi. We do not sell your data.' },
      { h: 'Your choices', p: 'You can turn off location access at any time in your phone settings. To delete your account, contact support.' },
    ],
  },
  terms: {
    title: 'Terms & conditions',
    updated: '1 October 2026',
    sections: [
      { h: 'Using the app', p: 'The app helps you order FOM, book services and follow advice. Advice is general; always follow product labels and local agriculture department guidance.' },
      { h: 'Orders and bookings', p: 'Orders and bookings are requests until approved. Prices shown at the time of ordering apply. Approved orders are dispatched on the date shown.' },
      { h: 'Your account', p: 'Keep your mobile number up to date. You are responsible for activity on your account.' },
    ],
  },
};
