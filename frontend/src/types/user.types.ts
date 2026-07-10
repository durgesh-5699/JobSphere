export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  checkAuth: () => Promise<void>;
}