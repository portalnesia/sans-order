import { Dayjs } from "dayjs";
import { Context } from "koa";
import * as Main from '../../../../../utils/Main'
import { PaymentError } from "../../../../utils/payment";

export default function getFilter(ctx: Context) {
  const {filter,from,to} = ctx.query

  let filterString: string|{from: Dayjs,to:Dayjs}|undefined='today';
  
  if(filter) {
    if(filter === 'custom') {
      if(!from) throw new PaymentError('Missing from query',400);
      if(!to) throw new PaymentError('Missing to query',400);
      const fromDate = Main.getDayJs(from);
      const toDate = Main.getDayJs(to);
      if(!fromDate.isValid()) throw new PaymentError("Invalid from query",400);
      if(!toDate.isValid()) throw new PaymentError("Invalid to query",400);
      if(toDate.diff(fromDate,'month') > 2) throw new PaymentError("Maximum interval date is 2 months",400);

      filterString={
        from:fromDate,
        to:toDate
      }
    } else {
      filterString = filter;
    }
  }

  return filterString;
}