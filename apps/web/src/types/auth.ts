export interface User {
  id: string;
  email: string;
  name: string;
  companyId?: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterResponse {
  userId: string;
  message: string;
}

export interface AuthMessageResponse {
  message: string;
}
