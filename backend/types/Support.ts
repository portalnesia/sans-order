import { User } from './User';

export interface Support {
  id: number;
  user?: User;
  name?: string;
  email?: string;
  subject: string;
  status: 'open' | 'close' | 'customer-reply' | 'answered';
}
