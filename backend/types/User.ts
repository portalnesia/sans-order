export interface User {
  id: number;
  name: string
  username: string;
  picture: string
  email: string;
  telephone?: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
