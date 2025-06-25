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
  message: string;
  status?: number;
}
