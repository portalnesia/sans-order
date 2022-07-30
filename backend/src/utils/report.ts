import type { Transaction } from "../../types/Transaction";
import type { Outlet } from "../../types/Outlet";
import { Dayjs } from "dayjs";
import ExcelJs from 'exceljs'
import { getDayJs } from "../../utils/Main";
import Stream from './writable-stream'
import { CopyPartial, Without } from "../../types/General";

export interface ReportOptions {
  from: Dayjs;
  to: Dayjs
}

export type ReportTransaction = Without<Transaction,'user'|'name'|'email'|'telephone'> & ({
  user:{
    name?: string,
    email?: string,
    telephone?: string
  }
})

export default class TokoReport {
  private excel: ExcelJs.Workbook;
  private outlet: Outlet;
  private tr: ReportTransaction[];
  private opt: ReportOptions;
  private sheet: ExcelJs.Worksheet;
  private bodyHeight=0;
  private total=0;
  private hppTotal=0;

  constructor(outlet: Outlet,transactions: ReportTransaction[],options: ReportOptions) {
    this.opt = options;
    this.outlet = outlet;
    this.tr = transactions;
    this.excel = new ExcelJs.Workbook();

    this.excel.creator = "Portalnesia";
    this.excel.created = getDayJs().toDate();
    this.excel.subject = outlet.name;
    const diff = this.opt.from.diff(this.opt.to,'day');
    this.excel.title = `Report ${outlet.name} - ${diff === 1 ? this.opt.from.pn_format('fulldate') : `${this.opt.from.pn_format('fulldate')} - ${this.opt.to.pn_format('fulldate')}`}`;

    this.sheet = this.excel.addWorksheet("REPORT",{
      properties:{tabColor:{argb:"2F6F4E"}},
      pageSetup:{paperSize:9,orientation:'landscape'}
    })
  }

  create() {
    this.addHeader();
    this.addBody();
    this.formatBody();
    this.addFooter();
  }

  private addHeader() {
    const column = [{
      key:"no",
      header:"NO",
      width:7
    },{
      key:"id",
      header:"ID",
      width:20
    },{
      key:"date",
      header:"DATE",
      width:15
    },{
      key:"time",
      header:"TIME",
      width:10
    },{
      key:"name",
      header:"NAME",
      width:20
    },{
      key:"price",
      header:"PRICE",
      width:15
    },{
      key:"hpp",
      header:"HPP",
      width:15
    },{
      key:"qty",
      header:"QTY",
      width:10
    },{
      key:"discount",
      header:"DISSCOUNT",
      width:15
    },{
      key:"subtotal",
      header:"SUBTOTAL",
      width:20
    },{
      key:"hpp_total",
      header:"HPP TOTAL",
      width:20
    },{
      key:"total",
      header:"TOTAL",
      width:20
    }] 
    this.sheet.columns = column;

    this.sheet.mergeCells("A1:L1");
    this.sheet.mergeCells("A2:L2");
    this.sheet.mergeCells("A3:L3");

    const A = this.sheet.getCell("A1");
    const B = this.sheet.getCell("A2");
    const C = this.sheet.getCell("A3");

    A.style = {
      alignment:{
        vertical:'middle',
        horizontal:'center'
      },
      font:{
        bold:true
      }
    }
    B.style = {
      alignment:{
        vertical:'middle',
        horizontal:'center'
      },
      font:{
        bold:true
      }
    }
    C.style = {
      alignment:{
        vertical:'middle',
        horizontal:'center'
      },
      font:{
        bold:true
      }
    }
    const row = this.sheet.getRows(1,3);
    row?.forEach(r=>{
      r.height = 20;
    })

    A.value = `REPORT - ${this.outlet.name}`;
    const diff = this.opt.from.diff(this.opt.to,'day');
    B.value = diff === 1 ? this.opt.from.pn_format('fulldate') : `${this.opt.from.pn_format('fulldate')} - ${this.opt.to.pn_format('fulldate')}`
    C.value = `Generated with love by SansOrder`;

    this.sheet.addRow(column.map(()=>''));

    this.sheet.addRow(column.map((_,i)=>{
      if([4,5,6,7,8].includes(i)) return 'ITEMS';
      return column[i].header;
    }));
    this.sheet.addRow(column.map((_,i)=>{
      if([4,5,6,7,8].includes(i)) return column[i].header;
      return ""
    }));

    ['A','B','C','D','J','K','L'].forEach(t=>{
      this.sheet.mergeCells(`${t}5:${t}6`);
    })

    
    this.sheet.mergeCells('E5:I5');

    this.sheet.getRows(5,2)?.forEach(r=>{
      r.eachCell(c=>{
        c.style = {
          alignment:{
            vertical:'middle',
            horizontal:'center'
          },
          font:{
            bold:true
          },
          border:{
            top:{style:'medium'},
            bottom:{style:'medium'},
            left:{style:'medium'},
            right:{style:'medium'}
          }
        };
      })
    })
  }

  private addFooter() {
    this.sheet.addRow([
      "TOTAL",
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      this.hppTotal,
      this.total
    ])
    this.sheet.mergeCells(`A${this.bodyHeight+7}:J${this.bodyHeight+7}`);

    this.sheet.getRow(this.bodyHeight+7).eachCell((c,i)=>{
      c.style = {
        font:{
          bold:true
        },
        border:{
          top:{style:'medium'},
          bottom:{style:'medium'},
          left:{style:'medium'},
          right:{style:'medium'}
        },
        alignment:{
          vertical:'middle',
          ...(i===1 ? {
            horizontal:'center'
          } : {})
        }
      }

      if([11,12].includes(i)) {
        c.numFmt = '_(Rp* #,##0.00_);_(Rp* (#,##0.00);_(Rp* "-"??_);_(@_)';
      }
    })

    this.sheet.addRow([
      "KEUNTUNGAN BERSIH",
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      this.total - this.hppTotal,
      ''
    ])
    this.sheet.mergeCells(`A${this.bodyHeight+8}:J${this.bodyHeight+8}`);
    this.sheet.mergeCells(`K${this.bodyHeight+8}:L${this.bodyHeight+8}`);

    this.sheet.getRow(this.bodyHeight+8).eachCell((c,i)=>{
      c.style = {
        font:{
          bold:true
        },
        border:{
          top:{style:'medium'},
          bottom:{style:'medium'},
          left:{style:'medium'},
          right:{style:'medium'}
        },
        alignment:{
          vertical:'middle',
          ...(i===1 ? {
            horizontal:'center'
          } : {})
        }
      }

      if([11,12].includes(i)) {
        c.numFmt = '_(Rp* #,##0.00_);_(Rp* (#,##0.00);_(Rp* "-"??_);_(@_)';
      }
    })
  }

  private addBody() {
    let s = 7;
    this.tr.forEach((t,i)=>{
      this.bodyHeight=this.bodyHeight + t.items.length;
      let total_hpp = (t.items[0].hpp||0)*t.items[0].qty;
      this.sheet.addRow([
        i+1,
        `${t.uid}`,
        getDayJs(t.updated).toDate(),
        getDayJs(t.updated).format("HH:mm:ss"),
        t.items[0].item?.name||'',
        t.items[0].price,
        t.items[0].hpp||"-",
        t.items[0].qty,
        t.items[0].discount,
        t.subtotal,
        total_hpp,
        t.total
      ])
      if(t.items.length > 0) {
        t.items.forEach((it,ix)=>{
          if(ix > 0) {
            total_hpp = total_hpp+((it.hpp||0)*it.qty);
            this.sheet.addRow([
              '',
              '',
              '',
              '',
              it.item?.name||'',
              it.price,
              it.hpp||0,
              it.qty,
              it.discount,
              '',
              '',
              ''
            ])

            // MERGE ADD TOTAL_HPP
            if(ix === t.items.length -1) {
              ['A','B','C','D','J','K','L'].forEach(c=>{
                this.sheet.mergeCells(`${c}${s}:${c}${s+t.items.length - 1}`);
                this.sheet.getCell(`K${s}`).value = total_hpp;

              })
            }
          }
        })
      }
      s+=t.items.length
      this.total = this.total + t.total;
      this.hppTotal = this.hppTotal + total_hpp
    })
  }

  private formatBody() {
    this.sheet.getRows(7,this.bodyHeight)?.forEach(r=>{
      r.getCell(1).numFmt = "0";
      r.getCell(3).numFmt = 'dd-mmm-yy';

      r.eachCell((c,i)=>{
        c.style = {
          alignment:{
            vertical:'middle',
            ...([1,2,3,4].includes(i) ? {horizontal:'center'} : {})
          },
          border:{
            top:{style:'thin'},
            bottom:{style:'thin'},
            left:{style:i===1 ? 'medium':'thin'},
            right:{style:i===12 ? 'medium':'thin'}
          }
        }

        if([6,7,9,10,11,12].includes(i)) {
          c.numFmt = '_(Rp* #,##0.00_);_(Rp* (#,##0.00);_(Rp* "-"??_);_(@_)';
        }
      })
    })
  }

  toStream(stream: Stream, options?: Partial<ExcelJs.XlsxWriteOptions>) {
    return this.excel.xlsx.write(stream,options)
  }

  toBuffer(options?: Partial<ExcelJs.XlsxWriteOptions>) {
    return new Promise<Buffer>(async(res)=>{
      const stream = new Stream();
      stream.on('finish',()=>{
        const buffer = stream.toBuffer();
        stream.destroy();
        res(buffer)
      })

      this.excel.xlsx.write(stream);
    })
  }
}