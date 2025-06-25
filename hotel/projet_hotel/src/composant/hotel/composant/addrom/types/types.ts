export interface Apartment {
  id: number;
  name: string;
  description: string;
  apartment_type: string;
  capacity: number;
  room_count: number;
  has_wifi: boolean;
  price_per_night: number;
  is_available: boolean;
  hotel_id: number;
  created_at: string;
}