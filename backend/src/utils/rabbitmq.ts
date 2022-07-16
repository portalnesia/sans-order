import { IMailOption } from './send-email';
import amqp from 'amqplib'
import { WhatsappMessage } from './whatsapp';
import { ValueOf } from '../../types/General';

type RabbitQueue = {
  send_email: IMailOption,
  send_whatsapp: WhatsappMessage
}

class RabbitMq {
  private conn?: amqp.Connection

  start() {
    return new Promise<void>(res=>{
      //if(process.env.PN_ENV !== 'development') {
        amqp.connect(`amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASS}@${process.env.RABBIT_HOST}:5672`).then(conn => {
          this.conn = conn;
          res();
        }).catch(console.log)
      //} else {
      //  res();
      //}
    })
  }

  async getChannel(queue: keyof RabbitQueue) {
    if(this.conn) {
      const ch = await this.conn.createChannel();
      await ch.assertQueue(queue, { durable: true })
      return ch;
    }
    return undefined;
  }

  sendQueue<S extends keyof RabbitQueue, P extends RabbitQueue[S]>(ch: amqp.Channel,queue: S,data: P) {
    const obj_string = JSON.stringify(data);
    const content = Buffer.from(obj_string);
    return ch.sendToQueue(queue,content,{persistent:true})
  }

  async close() {
    if(this.conn) await this.conn.close();
    return Promise.resolve();
  }
}
const rabbit = new RabbitMq();
export default rabbit;