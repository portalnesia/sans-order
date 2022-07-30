import { Message } from './Message';

export interface Support {
  id: number;
  userid?: number;
  name: string;
  email: string;
  picture?: string|null
  subject: string;
  status: 'open'|'close'|'customer-reply'|'answered'
  message?: Message
}
