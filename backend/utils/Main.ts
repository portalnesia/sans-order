import dayjs from 'dayjs'
import utcDayjs from 'dayjs/plugin/utc'
import relativeDayjs from 'dayjs/plugin/relativeTime'
import pndayjs from '@portalnesia/dayjs-plugins'
import 'dayjs/locale/id'

dayjs.extend(utcDayjs)
dayjs.extend(relativeDayjs)
dayjs.extend(pndayjs)

export function getDayJs(date?: string | number | Date | dayjs.Dayjs,defaultNow=false) {
  let datetime: dayjs.Dayjs;
  let dt = date;
  if(typeof date === 'undefined') return dayjs();
  if(typeof date === 'string') {
      const parse = Number(date);
      if(!Number.isNaN(parse)) {
          if(parse.toString().length === 10 || parse.toString().length === 13) dt = parse;
      }
  }
  if(typeof dt === 'number' && dt.toString().length === 10) {
      datetime = dayjs.unix(dt);
  } else {
      datetime = dayjs(dt);
  }
  if(!datetime.isValid()) {
      if(defaultNow) return dayjs();
      throw new Error('invalid date');
  }
  return datetime;
}

export function url(path?: string) {
  return `${process.env.URL}${path}`
}
export function webUrl(path?: string) {
  return `${process.env.WEB_URL}${path}`
}

export function isBetweenHour(d1: dayjs.Dayjs,d2:dayjs.Dayjs) {
  const now = getDayJs();
  const d1H = d1.hour();
  const d1M = d1.minute();

  const d2H = d2.hour();
  const d2M = d2.minute();

  const nowH = now.hour();
  const nowM = now.minute();

  if(nowH >= d1H && nowH <= d2H) {
    if(nowH === d1H) {
      if(nowM < d1M) return false;
    }
    if(nowH === d2H) {
      if(nowM > d2M) return false;
    }
    return true;
  }

  return false;
}