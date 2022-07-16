import { numberFormat, urlToDomain } from "@portalnesia/utils";
import { Dayjs, ManipulateType } from "dayjs";
import { Context } from "koa";
import { CopyPartial, CopyRequired, Without } from "../../types/General";
import { BANK_CODES, BANK_CODES_VALUES, ChannelCode, ChannelProps, DisbursementResult, EWalletResults, EWALLET_CODE, IChannelPayment, ICreateItems, ICreatePayment, ORDER_STATUS, Payments_Map, PAYMENT_STATUS, PAYMENT_TYPE, QrCodeResults, VirtualAccOpts, VirtualAccResults, XenditEWalletOpts, XenditQrCodeOpts, XenditVirtualAccOpts } from "../../types/Payment";
import { Transaction } from "../../types/Transaction";
import { User } from "../../types/User";
import * as Main from "../../utils/Main";
import sendEmail, { IMailOption, IPaymentTemplateOptions, ITemplateOption, PaymentItems } from "./send-email";
import xendit from "./xendit";
import type {Strapi} from '@strapi/strapi'
import Invoice, { InvoiceOptions } from './invoice'
import sendWhatsapp from "./whatsapp";
import { Outlet } from "../../types/Outlet";
import { Wallet } from "../../types/Wallet";
import { BusinessHour } from "../../types/components/BusinessHour";
import { CustomRemoteSocket } from "./socket";
import { Product } from "../../types/Product";
import path from 'path'
import {renderFile} from 'ejs'
import { TransactionItem } from "../../types/TransactionItem";
import TokoReport, { ReportTransaction } from "./report";
import { Recipes } from "../../types/components/Recipes";

export class PaymentError extends Error {
  code: number
  constructor(message: string,code=404) {
    super(message)
    this.code=code
  }
}

export default class Payment {
  strapi: Strapi
  va: Record<VirtualAccOpts['bankCode'],[number,number]> = {
    MANDIRI:[2,4],
    BRI:[2,4],
    BNI:[2,6],
    PERMATA:[2,4],
    //BCA:4
  }
  bankSupport: VirtualAccOpts['bankCode'][] = BANK_CODES_VALUES;
  defaultVa: Partial<XenditVirtualAccOpts> = {
    isClosed:true,
    isSingleUse:true
  };
  xendit = {
    va: new xendit.xendit.VirtualAcc({}),
    qr: new xendit.xendit.QrCode({}),
    ewallet:new xendit.xendit.EWallet({}),
    send:new xendit.xendit.Disbursement({})
  }
  fees: Record<ICreatePayment['payment']|'WITHDRAW',number> = {
    VIRTUAL_ACCOUNT:5000,
    QRIS:1,
    EWALLET:0.02,
    COD:0,
    WITHDRAW:6500
  }

  bussinessHourToIndex: BusinessHour['day'][] = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

  constructor(strapi: Strapi) {
    this.strapi = strapi;
  }

  checkOutletIsOpen(outlet: Outlet) {
    const {business_hour,busy} = outlet;
    if(busy) return false;
    const dayIndex = Main.getDayJs().day();
    const dayNow = this.bussinessHourToIndex[dayIndex];
    const today = business_hour.find(b=>b.day === dayNow);
    if(!today) return false;

    const d1 = Main.getDayJs(today.from);
    const d2 = Main.getDayJs(today.to);

    return Main.isBetweenHour(d1,d2);
  }

  createTransactionId(outlet: Outlet) {
    const date = Main.getDayJs();
    const counter = (outlet.idcounter||0)+1;
    const id = (outlet?.toko?.id||0) + outlet.id + date.format("YYYYMMDD") + `${counter}`.padStart(4,'0');
    return {counter,id}
}

  getPaymentName(data: Pick<ICreatePayment,'payment'|'ewallet'|'va'>) {
    if(data.payment === PAYMENT_TYPE.COD) {
      return "CASH ON DELIVERY"
    } else if(data.payment === PAYMENT_TYPE.EWALLET && data.ewallet) {
      return data.ewallet.channelCode.replace(/id\_/i,"").toUpperCase();
    } else if(data.payment === PAYMENT_TYPE.QRIS) {
      return "QRIS"
    } else if(data.payment === PAYMENT_TYPE.VIRTUAL_ACCOUNT && data.va) {
      return `${data.va.bankCode.toUpperCase()} VIRTUAL ACCOUNT`
    }
    return "";
  }

  getEmailSubject(type:IPaymentTemplateOptions['type'],opt: Pick<ICreatePayment,'uid'>) {
    const emailSubject = {
      reminder:`Payment Reminder #${opt.uid}`,
      success:`Payment Success, E-Receipt #${opt.uid}`,
      cod:`E-Receipt #${opt.uid}`,
      created:`Invoice #${opt.uid}`,
      send_money:`Withdrawal Success, E-Receipt #${opt.uid}`,
      send_money_created:`Withdrawal Requested, Invoice #${opt.uid}`
    } as Record<IPaymentTemplateOptions['type'],string>
    return emailSubject[type];
  }

  async getEmailPdf(opt: Pick<ICreatePayment,'name'|'uid'|'email'>,emailOpt:IPaymentTemplateOptions,options?: InvoiceOptions) {
    const invoice = new Invoice(opt,emailOpt,options);
    const buffer = await invoice.generate();
    return buffer;
  }

  getEmailOptions(type:'reminder'|'success'|'cod'|'created',data: Pick<ICreatePayment,'total'|'items'|'expiration'|'payment'|'ewallet'|'va'|'uid'|'datetime'|'updated'|'outlet'>,footers: {[key: string]: number},va_number?:string) {
    const total = `IDR ${numberFormat(`${data.total}`)}`;
    let footer: {[key: string]: string} = {};
    Object.keys(footers).forEach(key=>{
      footer[key] =  `IDR ${numberFormat(`${footers[key]}`)}`
    })
    const items: PaymentItems[] = data.items.map(d=>{
      return {
        name:d.item?.name||'',
        item:[
          {
            name:`${d?.qty} x IDR ${(numberFormat(`${d.price}`))}`,
            price:`IDR ${(numberFormat(`${(d.price||0)*d.qty}`))}`,
            raw:{
              qty:d.qty,
              price:d.price||0
            },
            inv_name:d.item?.name||''
          },
          ...(d.disscount && d.disscount !== 0  ? [
            {
              name:`disc. ${d.qty} x IDR ${(numberFormat(`${d.disscount*-1}`))}`,
              price: `IDR ${numberFormat(`${d.disscount*d.qty*-1}`)}`,
              inv_name:"Disscount",
              raw:{
                qty:d.qty,
                price:d.disscount*-1
              }
            }
          ] : [])
        ]
      }
    })
    
    data.expiration = data.expiration||[2,'h'];
    const opts: ITemplateOption['payment'] = {
      type,
      id:data.uid,
      total,
      items,
      footer,
      datetime:type === 'success' || type === 'cod' ? data.updated : data.datetime,
      expired:data.datetime.add(data.expiration[0],data.expiration[1]),
      payment:this.getPaymentName(data),
      va_number,
      merchant:data.outlet?.toko?.name||''
    }

    return opts;
  }

  async sendPaymentEmail(type:'reminder'|'success'|'cod'|'created',opt: ICreatePayment,va_number?:string) {
    const footer = {
      "Subtotal":opt.subtotal,
      ...(opt.disscount !== 0 ? {"Disscount":opt.disscount*-1} : {}),
      ...(opt.cash !== opt.total ? {
        "Cash":opt.cash,
        "Changes":opt.cash - opt.total
      } : {})
    }
    const emailOpt = this.getEmailOptions(type,opt,footer,va_number);
    const subject = this.getEmailSubject(type,opt);
    let attachments: IMailOption['attachments']|undefined;
    if(['cod','success'].includes(type)) {
      const pdf = await this.getEmailPdf(opt,emailOpt,{type:'accept'});
      attachments=[{
        content:pdf,
        filename:`[Portalnesia] E-Receipt #${opt.uid}.pdf`,
        contentType:'application/pdf',
      }]
    }
    await sendEmail({
      email:'noreply',
      replyTo:'support',
      to:opt.email,
      subject,
      attachments,
      template:{
        type:'payment',
        option:{
          username:opt.name,
          payment:emailOpt
        }
      }
    });
  }

  async sendWhatsapp(type:'success',opt: ICreatePayment) {
    if(!opt.telephone) return Promise.resolve();
    const footer = {
      "Subtotal":opt.subtotal,
      ...(opt.disscount !== 0 ? {"Disscount":opt.disscount*-1} : {}),
      ...(opt.cash !== opt.total ? {
        "Cash":opt.cash,
        "Changes":opt.cash - opt.total
      } : {})
    }
    const emailOpt = this.getEmailOptions(type,opt,footer);
    const subject = this.getEmailSubject(type,opt);
    let attachments: Buffer|undefined;
    if(['success'].includes(type)) {
      const pdf = await this.getEmailPdf(opt,emailOpt,{type:'accept'});
      attachments=pdf
    }
    const space='---------------'
    const text=[
      "*PAYMENT SUCCESS*",
      space,
      '',
      `Hai ${opt.name},`,
      `We have received your payment.`,
      '',
      `Merchant: ${opt.outlet?.toko?.name}`,
      `Receipt No: ${opt.uid}`,
      `Date of Issue: ${opt.datetime.pn_format('fulldate')}`,
      `Payment Method: ${emailOpt.payment}`,
      `Total: ${emailOpt.total}`,
      '',
      space,
      '',
      'Thankyou,',
      'Portalnesia'
    ].join("\n");

    await sendWhatsapp({
      telephone:opt.telephone,
      text,
      ...(attachments ? {
        document:{
          buffer: attachments.toString('utf-8'),
          fileName:`[Portalnesia] E-Receipt #${opt.uid}.pdf`,
          mimeType: 'application/pdf'
        }
      } : {})
    })
  }

  async expiredVirtualAccount(id: string) {
    const result = await this.xendit.va.updateFixedVA({
      id,
      expirationDate: Main.getDayJs().subtract(1,'h').utcOffset(0).toDate()
    }) as VirtualAccResults
    return result;
  }

  async createPayment<D=any>(opt: ICreatePayment) {
    const expiration = opt.expiration||[2,'h'];
    let result: {expired: Dayjs|null,payload:D,va_number?:string}

    if(opt.payment===PAYMENT_TYPE.VIRTUAL_ACCOUNT && opt.va) {
      const opts = opt as CopyRequired<ICreatePayment, "va">;
      const va = await this.createVirtualAccount(opts,expiration)
      result = {
        expired:va.expired,
        payload:va.payload as unknown as D,
        va_number:va.va_number
      }
    }
    else if(opt.payment===PAYMENT_TYPE.QRIS && opt.qr) {
      const opts = opt as CopyRequired<ICreatePayment, "qr">;
      const qr = await this.createQrCode(opts)
      result = {
        expired:qr.expired,
        payload:qr.payload as unknown as D
      }
    }
    else if(opt.payment===PAYMENT_TYPE.EWALLET &&  opt.ewallet) {
      const opts = opt as CopyRequired<ICreatePayment, "ewallet">;
      const ewallet = await this.createEwallet(opts);
      result = {
        expired:ewallet.expired,
        payload:ewallet.payload as unknown as D
      }
    }
    else if(opt.payment===PAYMENT_TYPE.COD) {
      result = {
        expired:Main.getDayJs().add(2,'h'),
        payload:null as unknown as D
      }
    }
    else throw new PaymentError("Invalid payment method",400);
    
    if(result.va_number) this.sendPaymentEmail('created',opt,result.va_number);

    return result;
  }

  async createVirtualAccount(data: CopyRequired<ICreatePayment,'va'>,expiration:[number,ManipulateType] = [2,'h']) {
    const expired = Main.getDayJs().add(expiration[0],expiration[1])
    const expirationDate = expired.utcOffset(0).toDate();
    const result = await this.xendit.va.createFixedVA({
      ...this.defaultVa,
      ...data.va,
      name:`${data.outlet?.toko?.name}`,
      expirationDate,
      //virtualAccNumber
    }) as VirtualAccResults;
    
    return {
      expired:expired,
      payload:{
        ...result,
        expiration_date:expired.toDate(),
        expected_amount:result.expected_amount||data.va.expectedAmt
      },
      va_number:result.account_number
    }
  }

  async createEwallet(data: CopyRequired<ICreatePayment,'ewallet'>) {
    const expired = Main.getDayJs().add(2,'h')
    const channelProperties: ChannelProps = data.ewallet.channelCode !== EWALLET_CODE.OVO ? {
      ...data.ewallet.channelProperties,
      successRedirectURL:Main.url(`/api/payment/redirect/${data.ewallet.referenceID}`),
    } : data.ewallet.channelProperties
    const options: XenditEWalletOpts = {
      ...data,
      checkoutMethod:"ONE_TIME_PAYMENT",
      // @ts-ignore
      currency:"IDR",
      channelCode: (data.ewallet.channelCode) as unknown as ChannelCode ,
      channelProperties
    }
    const result = await this.xendit.ewallet.createEWalletCharge(options) as EWalletResults;
    return {
      expired:expired,
      payload:result
    };
  }

  async createQrCode(data: CopyRequired<ICreatePayment,'qr'>) {
    const expired = Main.getDayJs().add(2,'h')
    const options: XenditQrCodeOpts = {
      ...data.qr,
      callbackURL:`${process.env.API_PUBLIC_URL}/payment/callback/qr`,
      // @ts-ignore
      type: (data?.qr?.type==="STATIC" ? "STATIC" : "DYNAMIC")
    }
    const result = await this.xendit.qr.createCode(options) as QrCodeResults;
    return {
      expired:expired,
      payload:result
    };
  }

  /**
   * Get ICreatePayment from databases
   * @param {Transaction} transaksi Transaction
   */
   getOptionsFromDb(transaksi: Transaction) {
    const payment = transaksi.payment
    let name: string='',email: string='',telephone: string|undefined;
    if(transaksi.type !== 'cashier') {
      if(transaksi?.user) {
        name = transaksi?.user.name;
        email = transaksi?.user.email;
        telephone = transaksi?.user.telephone;
      } else {
        name = transaksi?.name||''
        email = transaksi?.email||''
        telephone = transaksi?.telephone
      }
    }
    
    const opt: ICreatePayment<false> = {
      uid:transaksi.uid||'',
      payment: payment as ICreatePayment['payment'],
      items:transaksi?.items,
      total:transaksi?.total,
      subtotal:transaksi?.subtotal,
      disscount:transaksi?.disscount||0,
      datetime:Main.getDayJs(transaksi?.datetime),
      name,
      email,
      telephone,
      outlet: transaksi.outlet,
      updated: Main.getDayJs(transaksi?.updated),
      platform_fees:transaksi?.platform_fees||0,
      cash: transaksi?.cash
    }

    if(payment === PAYMENT_TYPE.VIRTUAL_ACCOUNT) {
      opt.va={
        externalID: transaksi.uid||"",
        bankCode: transaksi.payload?.bank_code,
        name,
        expectedAmt:transaksi?.total
      }
    }
    if(payment===PAYMENT_TYPE.QRIS) {
      opt.qr = {
        externalID: transaksi.uid||'',
        amount:transaksi?.total
      }
    }
    if(payment===PAYMENT_TYPE.EWALLET) {
      opt.ewallet = {
        referenceID:transaksi.uid||'',
        amount:transaksi?.total,
        channelCode: transaksi?.payload?.data?.channel_code,
        channelProperties: transaksi?.payload?.data?.channel_properties
      }
    }

    return opt;
  }

  validateBody(payment: Record<string,any>): {type?: PAYMENT_TYPE,bank?: BANK_CODES,channelCode?: EWALLET_CODE,channelProperties?:ChannelProps} {
    const paymentType = Object.keys(PAYMENT_TYPE);
    
    if(typeof payment.type !== 'string' || !paymentType.includes(payment.type as PAYMENT_TYPE)) {
      throw new PaymentError("Invalid payment type",400)
    }

    const type = PAYMENT_TYPE[payment.type]
    /**
     * bank
     */
    if(type === PAYMENT_TYPE.VIRTUAL_ACCOUNT) {
      const bankCode = Object.keys(BANK_CODES)
      if(typeof payment.bank !== 'string' || !bankCode.includes(payment.bank as BANK_CODES)) {
        throw new PaymentError("Invalid bank parameters",400);
      }

      return {
        type: type,
        bank: BANK_CODES[payment.bank]
      }
    }
    /**
     * ewallet:
     * - OBO: 
     *    - telephone
     * - SHOPEEPAY
     * - LINKAJA
     * - DANA
     */
    else if(type === PAYMENT_TYPE.EWALLET) {
      const ewalletCode = Object.keys(EWALLET_CODE);

      if(typeof payment.ewallet !== 'string' || !ewalletCode.includes(payment.ewallet as EWALLET_CODE)) {
        throw new PaymentError("Invalid ewallet parameters",400);
      }

      const wallet = EWALLET_CODE[payment.ewallet];
      const result: Record<string,any>={
        type:type,
        channelCode:wallet
      }
      if(wallet === EWALLET_CODE.OVO) {
        if(typeof payment.telephone !== 'string') {
          throw new PaymentError("Invalid ewallet telephone parameters",400);
        }
        if(!payment.telephone.startsWith('+')) {
          throw new PaymentError("Invalid ewallet telephone parameters",400);
        }

        result.channelProperties = {
          mobileNumber:payment.telephone
        }
      }
      return result;
    }

    return {}
  }

  getSendEmailOptions(type:'send_money'|'send_money_created',data: Pick<ICreatePayment,'total'|'expiration'|'uid'|'datetime'|'subtotal'|'disscount'|'updated'|'outlet'> & ({bank_code: string,item_name:string}),footers: {[key: string]: number}) {
    const total = `IDR ${numberFormat(`${data.total}`)}`;
    let footer: {[key: string]: string} = {};
    Object.keys(footers).forEach(key=>{
      footer[key] =  `IDR ${numberFormat(`${footers[key]}`)}`
    })
    const items: PaymentItems[] = [
      {
        name:data.item_name,
        item:[{
          name:"Amount",
          price:`IDR ${numberFormat(`${data.subtotal}`)}`,
          raw:{
            qty:1,
            price:data.subtotal
          },
          inv_name:data.item_name
        }]
      }
    ]
    data.expiration = data.expiration||[2,'h'];
    const opts: ITemplateOption['payment'] = {
      type,
      id:data.uid,
      total,
      items,
      footer,
      datetime:type === 'send_money' ? data.updated : data.datetime,
      expired:data.datetime.add(data.expiration[0],data.expiration[1]),
      payment:data.bank_code,
      merchant:data.outlet?.toko?.name||""
    }

    return opts;
  }

  async sendSendMoneyEmail(type:'send_money'|'send_money_created',opt: Pick<ICreatePayment,'disscount'|'subtotal'|'total'|'expiration'|'uid'|'datetime'|'name'|'email'|'updated'|'outlet'|'platform_fees'> & ({bank_code: string,item_name:string})) {
    const footer = {
      "Subtotal":opt.subtotal,
      ...(opt.disscount !== 0 ? {"Disscount":opt.disscount*-1} : {}),
      ...(opt.platform_fees !== 0 ? {"Fees":opt.platform_fees*-1}:{})
    }
    const emailOpt = this.getSendEmailOptions(type,opt,footer);
    const subject = this.getEmailSubject(type,opt);
    let attachments: IMailOption['attachments']|undefined;
    if(['send_money'].includes(type)) {
      const pdf = await this.getEmailPdf(opt,emailOpt,{type:'send'});
      attachments=[{
        content:pdf,
        filename:`[Portalnesia] E-Receipt #${opt.uid}.pdf`,
        contentType:'application/pdf',
      }]
    }
    await sendEmail({
      email:'noreply',
      replyTo:'support',
      to:opt.email,
      subject,
      attachments,
      template:{
        type:'payment',
        option:{
          username:opt.name,
          payment:emailOpt
        }
      }
    });
  }

  /**
   * 
   * @param {Outlet} outlet
   * @param {number} money 
   * @returns 
   */
  async sendMoney(outlet: Outlet,money: number) {
    try {
      const date = Main.getDayJs();
      
      const wallets = await this.strapi.entityService.findMany<"api::wallet.wallet", Wallet>('api::wallet.wallet',{
        filters:{
          toko:{
            id:{
              $eq: outlet?.toko?.id
            }
          }
        },
        limit:1,
        populate:'account'
      })
      if(!wallets || wallets.length === 0) {
        throw new PaymentError("Wallet not found",404);
      }
      const wallet = wallets[0];
      const saldo = wallet.balance
      if(saldo < money+this.fees.WITHDRAW) throw new PaymentError(`Total balance in your wallet is less than ${numberFormat(`${money}`)} + Fees ${numberFormat(`${this.fees.WITHDRAW}`)}. Balance ${numberFormat(`${saldo}`)}`,403);

      const {counter,id} = this.createTransactionId(outlet);

      const subtotal = money; // UPDATE MONEY
      const total = money-this.fees.WITHDRAW;
      const items: (CopyPartial<Without<TransactionItem,'item'>,'metadata'|'id'|'notes'|'outlet'|'transaction'|'datetime'> & ({item: number}))[] = [
        {item:1,price:money,qty:1,disscount:0,metadata:null,done:true,hpp:0}
      ]

      const payload = await this.xendit.send.create({
        bankCode: wallet.account?.bank_code,
        accountHolderName: wallet.account?.account_name,
        accountNumber: wallet.account?.account_number,
        amount: total,
        externalID: id,
        description: `Send withdraw to ${outlet?.toko?.name}`
      }) as DisbursementResult

      const data = {
        uid:id,
        outlet: outlet.id,
        subtotal,
        total,
        disscount:0,
        cash:total,
        items: items,
        datetime:date.pn_format(),
        updated:date.pn_format(),
        payload:payload,
        payment:wallet.account?.bank_code,
        status:PAYMENT_STATUS.PENDING,
        order_status:ORDER_STATUS.PENDING,
        type:'withdraw',
        user:outlet.toko?.user?.id
      }

      const [result,__] = await Promise.all([
        this.strapi.entityService.create('api::transaction.transaction',{
          data
        }),
        this.strapi.entityService.update<'api::outlet.outlet',Outlet>('api::outlet.outlet',outlet.id,{
          data:{
            idcounter: counter
          }
        })
      ])

      return result
    } catch(e) {
      throw new PaymentError("Internal server error",503)
    }
  }

  async getPaymentChannel() {
    const ewalletCodeChannel = Object.keys(EWALLET_CODE);
    const bankCode = Object.keys(BANK_CODES);
    const paymentType = Object.keys(PAYMENT_TYPE);
    const allPayment = (bankCode as string[]).concat(ewalletCodeChannel).concat("QRIS");
    const d = await xendit.get<IChannelPayment[]>(`https://api.xendit.co/payment_channels`);
    const result = d.data.filter(f=>{
      return (paymentType as string[]).includes(f.channel_category) &&
      allPayment.includes(f.channel_code) && 
      f.currency === 'IDR' &&
      f.is_enabled &&
      ((f.is_livemode && process.env.PN_ENV === 'production') || process.env.PN_ENV !== 'production')
    })
    result.push({
      business_id:'',
      is_livemode: true, 
      channel_code: "COD",
      name: "Cash on Delivery (Pay at cashier)",
      currency: 'IDR',
      channel_category: "COD",
      is_enabled: true
    })
    return result;
  }

  async simulatePayment<T extends PAYMENT_TYPE,D extends Payments_Map[PAYMENT_TYPE]>(type: T,transaction: Transaction) {
    if(process.env.PN_ENV === 'production') return;
    
    if(!['VIRTUAL_ACCOUNT','QRIS','COD'].includes(type)) {
      return;
    }

    try {
      let r: D|undefined=undefined;
      if(type===PAYMENT_TYPE.VIRTUAL_ACCOUNT) {
        const d = await xendit.post<D>(`https://api.xendit.co/callback_virtual_accounts/external_id=${transaction.uid}/simulate_payment`,{amount:transaction.total});
        r = d.data;
      } else if(type===PAYMENT_TYPE.QRIS) {
        const d = await xendit.post<D>(`https://api.xendit.co/qr_codes/${transaction.uid}/payments/simulate`,{amount:transaction.total});
        r = d.data;
      } else if(type === PAYMENT_TYPE.COD) {

      }
        const date = Main.getDayJs();
        const update={
          cash:transaction.total,
          status:0,
          order_status:2,
          updated:date.pn_format('db'),
          cashier: transaction.outlet?.toko?.user?.id,
          payload: r
        }

        await strapi.entityService.update('api::transaction.transaction',transaction.id,{
          data:update
        })
        
        transaction.updated = date.toDate();
        transaction.status = "COMPLETED" as PAYMENT_STATUS
        transaction.order_status = "PROCESSING" as ORDER_STATUS

        strapi.$io.raw('toko transactions',transaction,{room:`toko::${transaction.outlet?.toko?.id}::${transaction.outlet?.id}`})

        return transaction;
    } catch(e) {
      return;     
    }
  }

  async fetchSocket(filter: (value: CustomRemoteSocket, index: number, array: CustomRemoteSocket[])=>unknown) {
    const sockets = (await this.strapi.$io.socket.fetchSockets()) as CustomRemoteSocket[];
    const socket = sockets.filter(filter);
    return socket;
  }

  async checkItemForTransaction(items: {item: number,qty: number,notes?: string}[],outlet: Outlet) {
    const item: number[]=[], ask: string[]=[];
    for(const i of items) {
      if(typeof i.item !== 'number') throw new PaymentError("Invalid items.item paramaters");
      if(typeof i.item !== 'number') throw new PaymentError("Invalid items.qty paramaters");

      item.push(i.item);
    }
    const now = Main.getDayJs();

    const items_db = await this.strapi.entityService.findMany<'api::product.product',Product>('api::product.product',{
      filters:{
        $and:[
          {
            outlet:{
              id: outlet.id
            }
          },{
            id: {
              $in: item
            }
          }
        ]
      },
      populate:{
        promos:{
          filters:{
            $and: [{
              active:{
                $eq: true
              }
            },{
              from:{
                $lte: now.toDate()
              }
            },{
              to:{
                $gte: now.toDate()
              }
            }],
          }
        },
        recipes:{
          populate:'*'
        }
      }
    })

    if(items_db.length === 0) throw new PaymentError("Invalid items parameters",400)

    let new_item: ICreateItems[] = [];
    let items_stock: (ICreateItems & {recipes:Recipes[]})[]=[]

    for(const i of items_db) {
      if(!item.includes(i.id)) throw new PaymentError("Invalid items parameters",400)
      const it = items.find(t=>t.item == i.id);
      let disscount = 0;
      if(i.promo) {
        if(i.promo.type === 'fixed') {
          disscount = i.promo.amount
        } else {
          disscount = (i.promo.amount * i.price)/100
        }
      }
      const ite: ICreateItems = {
        item: i,
        price: i.price,
        disscount,
        qty: it?.qty || 0,
        hpp: i.hpp || 0,
        metadata: i.metadata,
        notes: it?.notes,
        done: false,
        outlet: outlet.id,
        datetime: now.toDate()
      }

      items_stock.push({...ite,recipes:i.recipes})
      new_item.push(ite)
    }

    const {price:subtotal,disscount} = new_item.reduce((prev,item,_)=>({
      ...item,
      price:prev.price + (item.price * item.qty),
      disscount: prev?.disscount + (item.disscount * item.qty)
    }),{
      item:undefined,
      price:0,
      disscount:0,
      qty:0,
      hpp:0,
      metadata:null,
      notes:undefined,
      done:false
    } as (ICreateItems))

    const total = (subtotal||0)-(disscount||0);
    return {items: new_item,total,subtotal:subtotal||0,disscount:disscount||0,items_stock}
  }

  async printTransactionByCashier(tr: Transaction,desktop?:boolean) {
    const date = Main.getDayJs(tr.datetime);

    const items = tr.items.map(i=>({
      ...i,
      price: `IDR ${numberFormat(`${i.price}`)}`,
      disscount: i.disscount > 0 ? `IDR ${numberFormat(`${i.disscount}`)}` : undefined,
      total: `IDR ${numberFormat(`${i.price * i.qty}`)}`,
      diss_total: i.disscount > 0 ? `IDR ${numberFormat(`${i?.disscount*i?.qty}`)}` : undefined
    }))

    const transaction = {
      ...tr,
      items,
      date:date.pn_format('fulldate'),
      time:date.pn_format('time'),
      ...(tr.disscount > 0 ? {disscount:`IDR ${numberFormat(`${tr.disscount}`)}`} : {}),
      subtotal:`IDR ${numberFormat(`${tr.subtotal}`)}`,
      total:`IDR ${numberFormat(`${tr.total}`)}`,
      cash:`IDR ${numberFormat(`${tr.cash}`)}`,
      changes:`IDR ${numberFormat(`${tr.cash-tr.total}`)}`,
      cashier:tr.cashier?.name||''
    }

    const filePath = path.resolve(`./src/templates/print_transaction.ejs`);
    const html = await renderFile(filePath,{outlet:tr.outlet,tr:transaction,desktop,sans_url:urlToDomain(process.env.URL as string).toLowerCase()},{rmWhitespace:true})

    return html;
  }

  getFilteredTransaction(filter: string | {from: Dayjs,to: Dayjs} = 'today') {
    const now = Main.getDayJs();
    let range: number = 0,dari = now, sampai = now;
    let query: any={}

    if(typeof filter === 'string') {
      if(filter === 'today') {
        range = 1;
        query = {
          $and: [{
            status:{
              $eq: PAYMENT_STATUS.PAID
            }
          },{
            datetime:{
              $gte: now.format("YYYY-MM-DD")
            }
          },{
            datetime:{
              $lte: now.endOf('day').pn_format()
            }
          }]
        }
      } else if(filter === 'weekly') {
        dari = dari.subtract(1,'week');
        range=now.diff(dari,'day') + 1;
        query = {
          $and: [{
            status:{
              $eq: PAYMENT_STATUS.PAID
            }
          },{
            datetime:{
              $gte: now.subtract(1,'week').format("YYYY-MM-DD")
            }
          },{
            datetime:{
              $lte: now.endOf('day').pn_format()
            }
          }]
        }
      } else if(filter === 'monthly') {
        dari = dari.subtract(1,'month');
        range=now.diff(dari,'day') + 1;
        query = {
          $and: [{
            status:{
              $eq: PAYMENT_STATUS.PAID
            }
          },{
            datetime:{
              $gte: now.subtract(1,'month').format("YYYY-MM-DD")
            }
          },{
            datetime:{
              $lte: now.endOf('day').pn_format()
            }
          }]
        }
      } else if(filter === 'pending') {
        query = {
          $or: [{
            status:{
              $ne: PAYMENT_STATUS.PAID
            }
          },{
            order_status:{
              $ne: ORDER_STATUS.FINISHED
            }
          }]
        }
      } else if(filter === 'kitchen') {
        query = {
          $and: [{
            status:{
              $eq: PAYMENT_STATUS.PAID
            }
          },{
            order_status:{
              $eq: ORDER_STATUS.PROCESSING
            }
          }]
        }
      }
    } else if(typeof filter !== 'undefined') {
      dari = filter.from;
      sampai = filter.to;
      range = filter.to.diff(filter.from,'day') + 1;
      query = {
        $and: [{
          status:{
            $eq: PAYMENT_STATUS.PAID
          }
        },{
          datetime:{
            $gte: filter.from.format("YYYY-MM-DD")
          }
        },{
          datetime:{
            $lte: filter.to.endOf('day').pn_format()
          }
        }]
      }
    }
    return {filters:query,range,dari,sampai}
  }

  async exportTransactionReport(outlet: Outlet,filter: string|{from:Dayjs,to:Dayjs} = 'today') {
    const {filters,dari,sampai} = this.getFilteredTransaction(filter);

    const transactions = await strapi.entityService.findMany('api::transaction.transaction',{
      filters,
      populate:{
        items:{
          populate:'item'
        }
      }
    })
    let tr: ReportTransaction[] = [];
    if(transactions) {
      tr = transactions.map(t=>{
        const {name,email,telephone,user,...rest} = t as Required<Transaction>;
        const data = {
          ...rest,
          user: user ? {
            name: user.name,
            email: user.email,
            telephone: user.telephone
          } : {
            name,
            email,
            telephone
          },
        }
        return data
      })
    }

    const report = new TokoReport(outlet,tr,{from:dari,to:sampai});
    report.create();
    const buffer = await report.toBuffer();
    return {buffer,from:dari,to:sampai};
  }

  async getGraph(outlet: Outlet,filter: string | {from: Dayjs,to:Dayjs} = 'today') {
    let {filters,range,dari,sampai} = this.getFilteredTransaction(filter);
    const now = Main.getDayJs();
    const params = {
      where:{
        $and:[{
          status:{
            $eq: PAYMENT_STATUS.PAID
          }
        },{
          type:{
            $ne: 'withdraw'
          }
        },{
          outlet:{
            id:{
              $eq: outlet.id
            }
          }
        }]
      }
    }
    const paramsToday = {
      where:{
        $and:[
          ...params.where.$and,
          {
            datetime:{
              $gte: now.format("YYYY-MM-DD")
            }
          },{
            datetime:{
              $lte: now.endOf('day').toDate()
            }
          }
        ]
      }
    }
    const fullParams = {
      where:{
        $and:[
          ...filters.$and,
          ...params.where.$and
        ]
      }
    }
    
    const [total,sum,sum_today,total_today,tr] = await Promise.all([
      strapi.db.query('api::transaction.transaction').count(fullParams),
      strapi.db.query('api::transaction.transaction').sum(fullParams,'total'),
      strapi.db.query('api::transaction.transaction').sum(paramsToday,'total'),
      strapi.db.query('api::transaction.transaction').count(paramsToday),
      strapi.entityService.findMany('api::transaction.transaction',{
        filters:{
          $and:[
            {...filters},
            ...params.where.$and
          ]
        },
        populate:{
          items:{
            populate:'item'
          }
        }
      })
    ])

    const grafik: any = {};

    tr.map((t)=>{
      if(t.items) {
        grafik['items']=t.items.map(i=>({
          name:i?.item?.name||'',
          y:Number(i?.qty)
        }))
      } else grafik['items'] = null
    })

    let i=0;
    let totals: number[]=[],time: number[]=[],date: string[]=[];

    const hasil = tr.map(t=>({
      total:t.total,
      datetime: Main.getDayJs(t.datetime,true)
    }))
    
    while(i < range) {
      const h = hasil.find(f=>f.datetime.isSame(dari,'date'))
      if(h) {
        totals.push(h.total)
      } else {
        totals.push(0);
      }

      time.push(dari.valueOf());
      date.push(dari.pn_format('fulldate'))
      dari = dari.add(1,'day');
      i++;
    }

    grafik['transactions']={
      total:totals,
      time,
      date
    }

    return {
      graph:grafik,
      today:{
        income:sum_today,
        total_transactions: total_today
      },
      data:{
        income: sum,
        total_transactions:total
      }
    }
  }
}