import dayjs from 'dayjs'
import utcDayjs from 'dayjs/plugin/utc'
import relativeDayjs from 'dayjs/plugin/relativeTime'
import pndayjs from '@portalnesia/dayjs-plugins'
import 'dayjs/locale/id'
import { clean, specialHTML, urlToDomain } from '@portalnesia/utils'

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

export function externalLink(path: string) {
  return `https://portalnesia.com/link?u=${Buffer.from(encodeURIComponent(clean(path))).toString("base64")}`
}

/**
 * 
 * @param text https:\/\/bla 
 * @returns &lt;a href="https:\/\/bla">bla&lt;/a>
 */
 export function linkWrap(text: string) {
  return text.replace(/<a.*?<\/a>|((http|https):\/\/)?([A-Za-z0-9.-]+\.[A-Za-z]{1,})/gim,function(match,out1,out2,out3){
      if(!out1 && !out3) return match;
      const http = out1 ? out1 : 'http://';
      if(urlToDomain(`http://${out3}`) == 'portalnesia.com') {
          return `<a href="${http}${clean(out3)}">${specialHTML(out3)}</a>`;
      } else {
          return `<a rel="nofollow" target="_blank" href="${externalLink(clean(out3))}">${specialHTML(out3)}</a>`;
      }
  })
}

/**
 * 
 * @param text 
 * Halo
 * 
 * Apa kabar
 * @param html 
 * if true, specialHTML    
 * Default `true`
 * @returns 
 * &lt;p>Halo&lt;/p>&lt;br />&lt;p>Apa kabar?&lt;/p> 
 */
 export function emailEncode(text: string,html=true) {
  text = text.replace(/\r\n/gim,"\n");
  text = text.replace(/(\n{1,})/gim,(match,out1)=>{
    const a = html ? out1 : specialHTML(out1);
    return a.replace(/\n/gim,"<br />");
  })
  text = text.replace("<br /><br />","</p><p>");
  return `<p>${text}</p>`;
}

/**
* 
* @param text 
*  \[Halo](https:\/\/portalnesia.com)
* @param social 
* If true, return link only    
* Default `false`
* @returns 
* &lt;a href="https:\/\/portalnesia.com">Halo&lt;/a>, if `social` false, or     
* https:\/\/portalnesia.com, if `social` true.
*/
export function linkEncode(text: string,social=false) {
  return text.replace(/\[([^\[]+)\]\(((http|https)\:\/\/(\S+))\)/gim,(match,out1,out2,out3,out4)=>{
      if(!social) {
          if(urlToDomain(out4) == 'portalnesia.com') {
              return `<a href="${clean(out2)}">${specialHTML(out1)}</a>`;
          } else {
              return `<a rel="nofollow" target="_blank" href="${externalLink(clean(out2))}">${specialHTML(out1)}</a>`;
          }
      } else {
          return clean(out2);
      }
  })
}

export function toFixed(num: number) {
  const fixed = num.toFixed(2).replace(/[.,]00$/,"");
  return fixed.replace('.',',');
}