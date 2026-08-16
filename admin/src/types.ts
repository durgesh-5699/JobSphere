export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export  interface GetUsersResponse {
  users: User[];
}