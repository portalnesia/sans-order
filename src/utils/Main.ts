import dayjs from 'dayjs'
import utcDayjs from 'dayjs/plugin/utc'
import relativeDayjs from 'dayjs/plugin/relativeTime'
import pndayjs from '@portalnesia/dayjs-plugins'
import 'dayjs/locale/id'
import { TFunction } from 'next-i18next'
import { daysArray, IDay, IOutlet, IUserAccess } from '@type/toko'

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
  return process.env.NEXT_PUBLIC_URL + (path ? "/" + path : '');
}

export function photoUrl(path: string|null) {
  return (path === null) ? staticUrl(`img/content?image=${encodeURIComponent("notfound.png")}`) : path; 
}

export function getDayList(t: TFunction) {
  const days: Record<IDay,string> = {
    sunday:t("sunday"),
    monday:t("monday"),
    tuesday:t("tuesday"),
    wednesday:t("wednesday"),
    thursday:t("thursday"),
    friday:t("friday"),
    saturday:t("saturday"),
  }
  return days;
}

export function isOutletOpen(outlet?: Pick<IOutlet,'business_hour'|'self_order'|'busy'>,socketOpen?:boolean) {
  let status = {
    enabled:false,
    opened:false,
    busy:!!outlet?.busy && !!socketOpen
  }
  if(!outlet) return status;
  if(outlet.business_hour) {
    const date = getDayJs();
    const i = date.day();
    const day = daysArray[i];
    if(typeof outlet.business_hour[day] !== 'undefined') {
      const [hour1,hour2] = outlet.business_hour[day];
      const h1 = getDayJs(hour1),h2 = getDayJs(hour2);
      if(isBetweenHour(h1,h2)) status.opened = true;
    }
  }
  status.enabled = (!outlet.busy && !!socketOpen && outlet.self_order && status.opened)
  return status;
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

/**
 * 
 * @param checkedAccess Akses yang di cek
 * @param access Akses yang harus dipenuhi
 * @return {boolean} boolean
 * 
*/ 
export function getUserAccess(checkedAccess: IUserAccess[],access: IUserAccess|IUserAccess[]) {
  if(checkedAccess.includes('superusers')) return true;
  let result=true;
  if(Array.isArray(access)) {
    for (let a of access) {
      if(!checkedAccess.includes(a)) result = false;
      continue;
    }
  } else {
    result = checkedAccess.includes(access);
  }
  return result;
}

export function getOutletAccess(outlet?: IOutlet,access?: IOutlet['access'][number]|IOutlet['access']) {
  if(!outlet) return false;
  if(!access) return false;
  if(outlet.isOwner) return true;
  if(outlet.access.includes('superusers')) return true;
  let result=true;
  if(Array.isArray(access)) {
    for (let a of access) {
      if(!outlet.access.includes(a)) result = false;
      continue;
    }
  } else {
    result = outlet.access.includes(access);
  }
  return result;
}