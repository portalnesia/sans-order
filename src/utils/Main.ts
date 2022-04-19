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

export function staticUrl(path?: string) {
  return process.env.CONTENT_URL + (path ? "/" + path : '');
}

export function href(path?: string) {
  return process.env.URL + (path ? "/" + path : '');
}

export function photoUrl(path: string|null) {
  return (path === null) ? staticUrl(`img/content?image=${encodeURIComponent("notfound.png")}`) : path; 
}