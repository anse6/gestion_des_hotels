export interface Admin {
  id: number;
  name: string;
  email: string;
}

export interface Hotel {
  id?: number;
  name: string;
  description: string;
  stars: number;
  email: string;
  phone: string;
  website?: string;
  city: string;
  country: string;
  admin_email: string;
  admin_id?: number;
  created_at?: string;
  image?: string;
}

export interface HotelFormProps {
  hotel: Hotel | null;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onStarChange: (rating: number) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}