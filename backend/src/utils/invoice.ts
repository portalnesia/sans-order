import PdfKit from 'pdfkit'
import Path from './path';
import Stream from './writable-stream'
import * as Main from '../../utils/Main'
import { numberFormat } from '@portalnesia/utils';
import { ICreatePayment } from '../../types/Payment';
import { IPaymentTemplateOptions } from './send-email';

export type InvoiceOptions = {
  type?: 'send'|'accept'
}

class PdfInvoice {
  pdf: PDFKit.PDFDocument
  private opt: Pick<ICreatePayment,'name'|'uid'|'email'>;
  private emailOpts: IPaymentTemplateOptions;
  padding=20
  space=15;
  spaceSection=30
  top = 95;
  options?: InvoiceOptions
  paperWidth: number
  paperHeight: number

  constructor(opt: Pick<ICreatePayment,'name'|'uid'|'email'>,emailOpt: IPaymentTemplateOptions,options?: InvoiceOptions) {
    const optsEmail = {
      ...emailOpt,
      payment: emailOpt.payment==='CASH ON DELIVERY' ? 'COD' : emailOpt.payment.replace(' VIRTUAL ACCOUNT',''),
    }
    this.opt = opt;
    this.emailOpts = optsEmail;
    this.options = options;
    this.paperWidth = 595.28;
    this.paperHeight = 135 + 90 + this.calculateTableRect() + 184;
    

    this.pdf = new PdfKit({size:[this.paperWidth,this.paperHeight],margin:this.padding,info:{
      Author:emailOpt.merchant,
      Creator:"Portalnesia",
      Producer:"Portalnesia",
      // @ts-ignore
      Subject:`${opt.name} <${opt.email}>`,
      Title:`E-Receipt #${opt.uid}`
    }});

    this.pdf.rect(0,0,this.paperWidth,220).fill('#2f6f4e');
  }

  generate() {
    return new Promise<Buffer>(async(res)=>{
      const stream = new Stream();
      stream.on('finish',()=>{
        const buffer = stream.toBuffer();
        stream.destroy();
        res(buffer)
      })

      this.pdf.pipe(stream);

      this.generateHeader();
      this.generateInvoice();
      this.generateItems();
      this.generateFooter();

      
      this.pdf.end();
    })
    
  }

  private generateHr(y: number,lineWidth=1,padding?:number) {
    padding = padding||this.padding
    this.pdf.strokeColor("#AAAAAA")
    .lineWidth(lineWidth)
    .moveTo(padding,y)
    .lineTo(this.paperWidth-padding,y)
    .stroke()
  }

  /**
   * FIRST_TOP = 95
   * LAST_TOP = 155
   * HEIGHT 135
   */
  private generateHeader() {
    let top = this.padding + 10; 
    this.pdf.image(Path.join('content','sans-icon','Sans-Text-White-120.png'),this.padding-13,this.padding,{width:60})
    .font("Helvetica-Bold")
    .fillColor("#FFFFFF")
    .fontSize(24)
    .text("E-RECEIPT",this.padding + 70 - 13,this.padding+20)
    .fontSize(10).font("Helvetica").text("Receipt No",this.paperWidth/2,top,{width:(this.paperWidth/2)-15,align:'right'})
    .fontSize(12).font("Helvetica-Bold").text(`${this.opt.uid}`,this.paperWidth/2,top+15,{width:(this.paperWidth/2)-15,align:'right'})
    top+=35;
    this.pdf.fontSize(10).font("Helvetica").text("Date of Issue",this.paperWidth/2,top,{width:(this.paperWidth/2)-15,align:'right'})
    .fontSize(12).font("Helvetica-Bold").text(Main.getDayJs(this.emailOpts?.datetime).pn_format('fulldate'),this.paperWidth/2,top+15,{width:(this.paperWidth/2)-15,align:'right'})

    //this.generateHr(this.top,2)
    this.top+=this.spaceSection + 10;
    //console.log("HEADER",this.top)
    // TEST HEIGHT
    //this.pdf.rect(0,0,this.paperWidth,135).stroke("red")
  }

  /**
   * FIRST TOP = 135
   * HEIGHT 45+30+5 = 80
   * LAST 135+80 = 245
   */
  private generateInvoice() {
    //const t = this.top;
    const internalGenerate=(kiri: string[],tengah: string[],kanan: string[])=>{
      const padding = this.padding + 15;
      const w = this.paperWidth - (padding*2);
      const x = [padding,padding+(w/3),padding+(w*2/3)]
      const width = (w/3)-15
      this.pdf.fontSize(10).font("Helvetica").text(kiri[0],x[0],this.top,{width})
      .fontSize(12).font("Helvetica-Bold").text(kiri[1],x[0],this.top+15,{width})

      .fontSize(10).font("Helvetica").text(tengah[0],x[1],this.top,{width,align:'center'})
      .fontSize(12).font("Helvetica-Bold").text(tengah[1],x[1],this.top+15,{width,align:'center'})

      .fontSize(10).font("Helvetica").text(kanan[0],x[2],this.top,{width:width+15,align:'right'})
      .fontSize(12).font("Helvetica-Bold").text(kanan[1],x[2],this.top+15,{width:width+15,align:'right'})
    }

    const d = {
      kiri:["Customer Name",this.opt.name],
      tengah:["Payment Method",this.emailOpts.payment],
      kanan:["Merchant",this.emailOpts.merchant]
    }
    // TEST HEIGHT
    //this.pdf.rect(0,135,this.paperWidth,45+30+5).stroke("red")

    const pad = this.padding - 5
    this.pdf.roundedRect(pad,this.top-10,this.paperWidth-(pad*2),45,5).stroke("#FFFFFF")
    internalGenerate(d.kiri,d.tengah,d.kanan)
    this.top+=30;

    this.top+=this.spaceSection + 30
    //console.log("INVOICE",this.top-t)
    return Promise.resolve();
  }

  /**
   * FIRST TOP 215
   * HEIGHT calculateTableRect;
   * LAST TOP 215 + calculateTableRect;
   */
  private generateItems() {
    //const t = this.top
    const size = this.getTableSize();
    const height = this.calculateTableRect();
    const pad = this.padding - 5
    this.pdf.roundedRect(pad,this.top-20,this.paperWidth-(pad*2),height,5).fillAndStroke("#FFFFFF","#000000")
    //.rect(pad+1,this.top-19,this.paperWidth-(pad*2)-2,height-2).fill("#FFFFFF")
    
    .fillColor("#000000").font("Helvetica-Bold");
    
    this.generateTableRow(this.top,"Item","Qty","Price","Total");
    this.top+=20;
    this.generateHr(this.top,1,this.padding+15)
    this.pdf.font("Helvetica");
    
    for(const it of this.emailOpts.items) {
      it.item.forEach((ii,i)=>{
        this.top+=15;
        const item = ii.inv_name||it.name;
        const qty = `${ii.raw.qty}`;
        const price = `IDR ${numberFormat(`${ii.raw.price}`)}`
        const total = `IDR ${numberFormat(`${ii.raw.qty * ii.raw.price}`)}`
        this.generateTableRow(this.top,item,qty,price,total);
        
        if(i === it.item.length -1) this.top+=20,this.generateHr(this.top,1,this.padding+15)
      })
    }
    let savedTop = this.top;
    
    Object.entries(this.emailOpts.footer).forEach(it=>{
      this.top+=20;
      this.generateTotalTable(this.top,it[0],it[1]);
    })
    
    this.top+=20;
    
    this.pdf.circle(size.x[2]+12.5,this.top+12.5,12.5).fill('#2f6f4e')
    .rect(size.x[2]+12.5,this.top,size.width[2]+size.width[3]+29.5-12.5,25).fill("#2f6f4e").fillColor("#FFFFFF");
    
    if(!this.options?.type || this.options.type === 'accept') {
      const stamp_w = 140;
      let h = (this.top+25+20) - savedTop;
      h = (h-58)/2;
      savedTop = savedTop + h;
      this.pdf.opacity(0.8).image(Path.join('content','paid_stamp.png'),size.x[0],savedTop,{width:stamp_w}).opacity(1);
    }

    this.top+=8;
    this.generateTotalTable(this.top,"TOTAL",this.emailOpts.total);
    
    // TEST HEIGHT
    //this.pdf.rect(0,215,this.paperWidth,height).stroke("red")
    this.top+=(25-8);
    
    this.top+=20*2;
    //console.log("ITEM",this.top-t,height)
    //this.pdf.font("Helvetica-Oblique").fontSize(10).fillColor('#444444').text(`* Save this receipt`,this.padding,this.top+5)
    return Promise.resolve();
  }

  /**
   * HEIGHT 174 + 10 lines
   */
  private generateFooter() {
    // const t = this.top;
    this.top+=55;

    /*this.pdf.image(Path.join('content','sans-icon','Sans-Banner-Light.png'),this.paperWidth*3/4-this.padding-20,this.top,{width:(this.paperWidth*1/4)+20})
    .fillColor('#444444').font("Helvetica-Bold").fontSize(12).text("PT. ADITYA BAYU",this.paperWidth*2/3-this.padding-20,this.top+50,{align:'right'})
    .font("Helvetica").fontSize(10).text("JL. DOANG JADIAN KAGAK",this.paperWidth*2/3-this.padding-20,this.top+70,{align:'right'})
    .font("Helvetica").fontSize(10).text("MALANG - JAWA TIMUR",this.paperWidth*2/3-this.padding-20,this.top+85,{align:'right'})*/

    this.pdf.image(Path.join('content','sans-icon','Sans-Banner-Light.png'),this.paperWidth*3/4-this.padding-20,this.top+20,{width:(this.paperWidth*1/4)+20})
    .fillColor('#444444').font("Helvetica").fontSize(10).text(`SansOrder © ${Main.getDayJs().year()}`,this.paperWidth*2/3-this.padding-20,this.top+70,{align:'right'})
    .font("Helvetica").fontSize(10).text("Powered by Portalnesia",this.paperWidth*2/3-this.padding-20,this.top+85,{align:'right'})

    this.top+=5;
    
    this.pdf.fillColor('#444444').font("Helvetica-Bold").fontSize(12).text("Customer Services",this.padding,this.top)
    this.top+=20;
    
    this.pdf.font("Helvetica").fontSize(10).text('support@portalnesia.com',(this.padding)+20,this.top)
    this.top+=18;
    this.pdf.text('+628123456789',(this.padding)+20,this.top)
    this.top+=18;
    this.pdf.text('@portalnesia.id',(this.padding)+20,this.top)
    this.top+=18;
    this.pdf.text('@Portalnesia1',(this.padding)+20,this.top)

    this.top+=40;
    this.pdf.rect(0,this.top,this.paperWidth,10).fill("#2f6f4e")
    
    // TEST HEIGHT
    //this.pdf.rect(0,215+193,this.paperWidth,179).stroke("red")
    //console.log(this.top-t);
    this.pdf.translate(this.padding,this.top-40-18-18-18-2).scale(0.8).path("M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z").stroke("#444444")
    .translate(0,22).scale(0.9).path("M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z").stroke("#444444")
    .translate(0,26).path("M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z").stroke("#444444")
    .translate(0,25).path("M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z").stroke("#444444")
  }

  private getTableSize(): {x: [number,number,number,number],width:[number,number,number,number]} {
    const padding = this.padding + 15
    const w = this.paperWidth-(padding*2);
    const item = w/3;
    const sisa = w*2/3;
    const hargaDanTotal = sisa*2/3;
    const qty = sisa/3;
    const harga = hargaDanTotal/3;
    const total = hargaDanTotal*2/3;
    const width = [item-10,qty-10,harga-10,total] as [number,number,number,number];
    const x = [padding,padding+item,padding+item+qty,padding+item+qty+harga] as [number,number,number,number];
    return {x,width}
  }

  private generateTableRow(y: number,item: string,qty: string,harga: string,total: string) {
    const size = this.getTableSize();
    
    this.pdf.fontSize(10)
    .text(item,size.x[0],y,{width:size.width[0]})
    .text(qty,size.x[1],y,{width:size.width[1],align:'center'})
    .text(harga,size.x[2],y,{width:size.width[2],align:'right'})
    .text(total,size.x[3],y,{width:size.width[3],align:'right'})
  }

  private generateTotalTable(y: number,name: string,total: string) {
    const size = this.getTableSize();
    this.pdf.fontSize(11).font("Helvetica-Bold")
    .text(name,size.x[2],y,{width:size.width[2],align:'right'})
    .text(total,size.x[3],y,{width:size.width[3],align:'right'})
  }

  private calculateTableRect() {
    // SAVED TOP
    const firstTop = 225;
    let top = firstTop;

    // MULAI HITUNG
    top+=20;
    
    for(const it of this.emailOpts.items) {
      it.item.forEach((ii,i)=>{
        top+=15;
        
        if(i === it.item.length -1) top+=20
      })
    }
    
    Object.entries(this.emailOpts.footer).forEach(it=>{
      top+=20;
    })
    
    top+=20;
    
    top+=25; // TOTAL + RECT
    
    // PADDING
    top+=20*2;
    
    return top - firstTop;
  }
}
export default PdfInvoice