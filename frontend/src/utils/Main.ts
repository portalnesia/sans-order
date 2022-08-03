import dayjs from 'dayjs'
import utcDayjs from 'dayjs/plugin/utc'
import relativeDayjs from 'dayjs/plugin/relativeTime'
import pndayjs from '@portalnesia/dayjs-plugins'
import 'dayjs/locale/id'
import { TFunction } from 'next-i18next'
import { Outlet,daysArray, IDays, IUserAccess, Product } from '@type/index'
import { glob } from 'glob'
import portalnesia from './api'

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
  return process.env.NEXT_PUBLIC_CONTENT_URL + (path ? "/" + path : '');
}

export function href(path?: string) {
  return process.env.NEXT_PUBLIC_URL + (path ? "/" + path : '');
}

export function photoUrl(path?: string|null,content: boolean = false) {
  return (!path) ? staticUrl(`img/content?image=${encodeURIComponent("notfound.png")}&watermark=no`) : content ? staticUrl(path) : path; 
}

export function portalUrl(path?: string) {
  return 'https://portalnesia.com' + (path ? "/" + path : '');
}

export function getDayList(t: TFunction) {
  const days: Record<IDays,string> = {
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

export function isOutletOpen(outlet?: Pick<Outlet,'business_hour'|'self_order'|'busy'>,socketOpen?:boolean) {
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
    const now = outlet.business_hour.find(d=>d.day === day);
    if(now) {
      const [hour1,hour2] = [`1997-01-01 ${now.from}`,`1997-01-01 ${now.to}`];
      const h1 = getDayJs(hour1),h2 = getDayJs(hour2);
      if(isBetweenHour(h1,h2)) status.opened = true;
    }
  }
  status.enabled = !!(!outlet.busy && !!socketOpen && outlet.self_order && status.opened)
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
  let result=true;
  if(Array.isArray(access)) {
    for (const a of access) {
      if(!checkedAccess.includes(a)) result = false;
      continue;
    }
  } else {
    result = checkedAccess.includes(access);
  }
  return result;
}

export function getOutletAccess(outlet?: Outlet,access?: IUserAccess|IUserAccess[]) {
  if(!outlet) return false;
  if(!access) return false;
  if(outlet?.toko?.user?.id == portalnesia.user?.id) return true;
  if(!outlet.users || outlet.users.length === 0) return false;
  let result=true;
  
  for(const acc of outlet.users) {
    if(acc.user?.id != portalnesia.user?.id) {
      result = false;
      break;
    }
    if(Array.isArray(access)) {
      for(const r of acc.roles) {
        if(!access.includes(r.name as IUserAccess)) {
          result = false;
          break;
        }
      }
    } else {
      const role = acc.roles.find(r=>r.name === access);
      if(!role) {
        result = false;
        break;
      }
    }
  }
  return result;
}

export function getDir(dir: string) {
  return new Promise<string[]>((res,rej)=>{
    glob(dir,(err,result)=>{
      if(err) rej(err);
      res(result)
    })
  })
}

export function getDisscount(item: Pick<Product,'promo'|'price'>) {
  let disc = 0;
  if(item.promo?.type) {
    if(item.promo?.type === 'fixed') disc = item.promo.amount;
    else disc = Number.parseFloat((item.promo.amount * item.price / 100).toFixed(2))
  }
  return disc;
}

export function sortBusinessHour(businessHour?: Outlet['business_hour']) {
  if(businessHour) {
    const sorter = {
      sunday: 0,
      monday:1,
      tuesday:2,
      wednesday:3,
      thursday:4,
      friday:5,
      saturday:6
    } as Record<IDays,number>
    const bh = [...businessHour]
    bh.sort((a,b)=>{
      return sorter[a.day] - sorter[b.day];
    })
    return bh;
  }
  return [] as Outlet['business_hour'];
}

export function toFixed(num: number) {
  const fixed = num.toFixed(2).replace(/[.,]00$/,"");
  return fixed.replace('.',',');
}