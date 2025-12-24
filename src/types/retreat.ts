export interface Retreat {
  id: string;
  name: string;
  location: string;
  country: string;
  dates: string;
  duration: string;
  price: number;
  currency: string;
  image: string;
  description: string;
  activities: string[];
  category: string;
  rating?: number;
  featured?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  retreats?: Retreat[];
  timestamp: Date;
}

export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  numberOfGuests: number;
  specialRequests?: string;
}
