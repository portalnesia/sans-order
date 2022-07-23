export interface User {
  id: number;
  name: string
  username: string;
  picture: string;
  admin: boolean;
  email: string;
  telephone?: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
