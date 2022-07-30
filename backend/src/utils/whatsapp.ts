import rabbit from "./rabbitmq";

export type WhatsappMessage = {
  telephone: string,
  text?: string,
  document?: {url?: string,file?: string,buffer?: string,mimeType?:string,fileName?: string},
  sticker?: {url?: string,file?: string,buffer?: string,mimeType: string}
  location?: {latitude: number,longitude: number}
  image?:{url?: string,file?: string,buffer?: string,mimeType?:string,caption?:string,fileName?:string}
}

export default async function sendWhatsapp(opt: WhatsappMessage) {
  const ch = await rabbit.getChannel('send_whatsapp');
  if(ch) {
    rabbit.sendQueue(ch,'send_whatsapp',opt);
    ch.close();
  }
}