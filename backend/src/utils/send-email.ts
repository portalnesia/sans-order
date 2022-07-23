import Mail from 'nodemailer/lib/mailer';
import {Dayjs} from 'dayjs'
import rabbit from './rabbitmq';

export const emailToName = {
  ['support-sansorder']:{
    email:"support-sansorder@portalnesia.com",
    name:"SansOrder Support",
  },
  ['noreply-sansorder']:{
    email:"noreply-sansorder@portalnesia.com",
    name:"SansOrder",
  },
}

export type IEmail = keyof typeof emailToName;
type IReplyTo = IEmail | {name: string,address: string};

export type IMailTemplateOption = {
  type:'basic'|'birthday'|'basicv2'|'security'|'register'|'forgot'|'payment'|'invoice',
  option: ITemplateOption
}

interface SendMailerOptions extends Mail.Options {
  /**
   * Without @
   */
  email:IEmail;
  replyTo?:IReplyTo;
  subject: string;
  /** The message-id this message is replying */
  inReplyTo?: string;
  attachments?: Mail.Attachment[];
  /** optional Message-Id value, random value will be generated if not set */
  messageId?: string | undefined;
  /** optional transfer encoding for the textual parts */
  encoding?: string | undefined;
}

export interface IMailOption extends SendMailerOptions {
  /**
   * Penerima Email
   */
  to: string[]|string|Mail.Address|Mail.Address[];
  template:IMailTemplateOption;
}

export interface MailingListOptions extends SendMailerOptions {
  /**
   * Penerima Email
   */
  to: string|Mail.Address;
  html: string
  /** Mailing ID */
  id: string|number;
  log_slug: string;
}

export type PaymentItems = {
  name: string,
  item:{
    /**
     * Email name
     * 2 x IDR 20.000
     */
    name: string,
    /**
     * Email Total Price
     * IDR 40.000
     */
    price: string,
    raw:{
        qty:number,
        price: number
    },
    /**
     * INVOICE NAME
     * - Items name
     * - Disscount
     * - Fees
     */
    inv_name?: string
  }[]
}

export interface IPaymentTemplateOptions {
  type:'reminder'|'success'|'cod'|'created'|'send_money'|'send_money_created',
  id: string,
  /**
   * Payment Method
   */
  payment: string,
  /**
   * VA Account Number
   */
  va_number?: string
  /**
   * Payment Created
   */
  datetime: Dayjs|string|number,
  /**
   * Payment Expired
   */
  expired: Dayjs|string|number,
  items: PaymentItems[]
  /**
   * SUB TOTAL, DISSOUNT
   */
  footer:{
    /**
     * WITH IDR
     */
    [key: string]: string
  },
  /**
   * WITH IDR
   */
  total: string
  /**
   * TOKO NAME
   */
  merchant: string
}

export interface ITemplateOption {
  username: string|false
  /** Text String with \n */
  messages?: string
  header?: string
  button?: {
    /** Text String with \n */
    text?: string,
    url?: string,
    /** TEXT ONLY */
    label?: string
  }|false;
  footer?: {
    email?: string,
    url?: string,
    /** Text String with \n */
    extra?: string
  }|false;
  /**
   * If false, add `Please do not send replies to this email`
   */
  replyTo?: boolean;
  birthday?:{
    name:string,
    date: string,
    url: string
  }
  event?: {
    name: string,
    date: string,
    place: string,
    ticket: {
      url: string,
      qrUrl: string,
      downloadUrl: string
    },
    toEmail: string
  },
  payment?:IPaymentTemplateOptions
  [key: string]: any;
}

export default async function sendEmail(opt: IMailOption) {
  const ch = await rabbit.getChannel('send_email');
  if(ch) {
    rabbit.sendQueue(ch,'send_email',opt);
    ch.close();
  }
}