export type CartLine = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type CheckoutForm = {
  name: string;
  phone: string;
  email: string;
};

export type OrderStatus = 'messaging' | 'pending_payment' | 'payment_submitted';

export type PlacedOrder = {
  id?: string;
  orderNumber: string;
  lines: CartLine[];
  subtotal: number;
  total: number;
  form: CheckoutForm;
  placedAt: string;
  status: OrderStatus;
  paymentSubmittedAt?: string;
  estimatedReadyAt?: string;
  receiptUrl?: string;
};

export type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  dish?: string;
  createdAt: string;
};
