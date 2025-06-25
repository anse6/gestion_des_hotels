// Fichier: types.ts
export type ReservationOption = {
  id: number;
  title: string;
  description: string;
  price: string;
  imagePrompt: string;
};

export type OptionsData = {
  chambre: ReservationOption[];
  salle: ReservationOption[];
  appartement: ReservationOption[];
};