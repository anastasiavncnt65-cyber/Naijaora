/**
 * Naijaora — edit bank details and contact info here.
 */

export const business = {
  name: 'Naijaora',
  tagline: 'Experience the taste of Naija',
  description:
    'Authentic Nigerian dishes, cooked fresh to order. Pay by bank transfer and upload your payment receipt to confirm.',

  brand: {
    primary: '#C86B1A',
    primaryDark: '#9E4F10',
    accent: '#E8A317',
    cream: '#F5EFE6',
    dark: '#1A1208',
    darkSurface: '#2A1C10',
    light: '#FFFBF7',
    muted: '#A89888',
    surface: '#F3EBE2',
  },

  contact: {
    phone: '+64 21 239 1926',
    /** Digits only with country code — used for WhatsApp links */
    whatsapp: '64212391926',
    email: 'anastasia.vncnt65@gmail.com',
    publicLocation: 'Christchurch',
    pickupAddress: '1/26 Hayton Road, Christchurch',
    pickupInstructions:
      'We will message you when your order is ready. Message us on WhatsApp when you arrive.',
    hours: 'Mon–Sat · 11:00am – 7:30pm · Sun · 2:00pm – 7:30pm',
    mapsUrl: 'https://maps.google.com/?q=1/26+Hayton+Road,+Christchurch,+New+Zealand',
    mapEmbedUrl:
      'https://maps.google.com/maps?q=1%2F26+Hayton+Road%2C+Christchurch%2C+New+Zealand&z=16&output=embed',
  },

  payment: {
    bank: {
      accountName: 'Anastasia Vncnt',
      bankName: 'Westpac',
      accountNumber: '38-9022-0851042-00',
      payId: '',
    },
    instructions:
      'Transfer the exact order total and use your order number as the payment reference. Upload a screenshot of your online banking receipt to confirm.',
    receiptNote:
      'After paying, upload a screenshot of your bank transfer confirmation. We verify payment before we start preparing your order.',
  },

  prepMinutes: 50,
  prepTimeNote: 'Ready for pickup about 50 minutes after payment is verified.',

  social: {
    instagram: '',
    /**
     * Facebook Page username only (from facebook.com/YourPageName).
     * Used for Messenger: m.me/YourPageName
     * Leave empty to hide Messenger until set.
     */
    facebook: 'Naijaora',
  },
} as const;

export type MenuCategory = {
  id: string;
  name: string;
  description?: string;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

export const menuCategories: MenuCategory[] = [
  { id: 'rice', name: 'Rice dishes', description: 'Classic Nigerian rice plates' },
  { id: 'soups', name: 'Soups & swallow', description: 'Hearty soups served with fufu' },
  { id: 'snacks', name: 'Snacks & bites', description: 'Perfect for sharing' },
];

export const menuItems: MenuItem[] = [
  {
    id: 'fried-rice',
    categoryId: 'rice',
    name: 'Authentic Nigerian Fried Rice',
    description: 'One serve · seasoned rice with vegetables, chicken & prawns',
    price: 25,
    image: '/images/fried-rice.png',
  },
  {
    id: 'jollof-rice',
    categoryId: 'rice',
    name: 'Authentic Nigerian Jollof Rice',
    description: 'One serve · smoky party-style jollof with chicken',
    price: 20,
    image: '/images/jollof-rice.png',
  },
  {
    id: 'red-stew',
    categoryId: 'rice',
    name: 'Authentic Nigerian Red Stew with Rice',
    description: 'One serve · rich tomato stew with tender meat & white rice',
    price: 20,
    image: '/images/red-stew.png',
  },
  {
    id: 'okra-soup',
    categoryId: 'soups',
    name: 'Authentic Nigerian Okra Soup with Fufu',
    description: 'One serve · draw soup with assorted meat & smooth fufu',
    price: 20,
    image: '/images/okra-soup.png',
  },
  {
    id: 'vegetable-soup',
    categoryId: 'soups',
    name: 'Authentic Nigerian Vegetable Soup with Fufu',
    description: 'One serve · efo riro with meat & fufu',
    price: 20,
    image: '/images/vegetable-soup.png',
  },
  {
    id: 'egusi-soup',
    categoryId: 'soups',
    name: 'Authentic Nigerian Egusi Soup with Fufu',
    description: 'One serve · ground melon seed soup with fufu',
    price: 20,
    image: '/images/egusi-soup.png',
  },
  {
    id: 'meat-pie',
    categoryId: 'snacks',
    name: 'Authentic Nigerian Meat Pie',
    description: 'Pack of 4 · flaky pastry filled with seasoned mince',
    price: 24,
    image: '/images/meat-pie.png',
  },
  {
    id: 'puff-puff',
    categoryId: 'snacks',
    name: 'Authentic Nigerian Puff Puff',
    description: 'Pack of 12 · golden fried dough balls dusted with sugar',
    price: 20,
    image: '/images/puff-puff.png',
  },
];
