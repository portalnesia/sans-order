import { File } from './File';
import { User } from './User';

export interface Message {
  id: number;
  from?: User;
  to?: User;
  message?: string;
  file?: File;
  datetime: Date;
  type: 'support';
  room_id: number;
}
