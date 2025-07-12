export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Hotel {
  id: string;
  name: string;
  // Ajoutez d'autres propriétés si nécessaire
}

export interface LoginResponse {
  email: string;
  name: string;
  role: string;
  token: string;
}

export interface AuthError {
  // Make message potentially optional if it's not always present,
  // or ensure your API always sends it.
  message: string; 
  status?: number; // Add status for more specific error handling if needed
  // You might also add originalError or other properties if your API returns them
  // e.g., errors?: Record<string, string[]>; for validation errors
}