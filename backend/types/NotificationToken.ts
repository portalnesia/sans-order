import { User } from './User';

export interface NotificationToken {
  id: number;
  token: string;
  datetime?: Date;
  user?: User;
}
