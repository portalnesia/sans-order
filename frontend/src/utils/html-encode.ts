import { urlToDomain } from '@portalnesia/utils';
import {load,Element,CheerioAPI} from 'cheerio'
import { staticUrl } from './Main';
import { convert } from 'html-to-text';
import path from 'path';

const DEFAULT_WIDTH=400;

const parseImage=($:CheerioAPI,imgs: Element,ads?:boolean)=>{
  const img = $(imgs);
  const src_string = (typeof img.attr("src") === 'string' ? img.attr("src") : img.attr("data-src")) as string
  const src_domain = urlToDomain(src_string);
  const isUnsplash = /unsplash\.com/.test(src_domain);
  const src = src_domain == 'content.portalnesia.com' ? src_string : isUnsplash ? `${src_string.replaceAll(/(\?|\&)w\=\d+/g,"")}&auto=compress&mark=${encodeURIComponent(staticUrl('watermark.png'))}&mark-scale=5&mark-align=middle` : staticUrl(`img/url?image=${encodeURIComponent(src_string)}`);
  const imgWidth = img.attr("width");
  const width = imgWidth ? Number.parseInt(imgWidth) : undefined;
  const size = width && width < DEFAULT_WIDTH ? width : DEFAULT_WIDTH;
  const next = img.parent('figure').find('figcaption');
  const caption = next.length > 0 ? next.html() : undefined;
  const captionFormat = caption ? convert(caption,{selectors:[{selector:'a',options:{noLinkBrackets:true}}]}) : undefined;
  const captionText = captionFormat?.replaceAll(/\s+https?\:\/\/\S+/gim,"").replaceAll(/\n/gim," ");
  let withPng = img.attr('data-png') == 'true';
  if(src_domain == 'content.portalnesia.com' && /(\?|\&)image\=pixabay/.test(src)) {
      const url = new URL(src);
      if(url.searchParams.has('image')) {
          const imageUrl = decodeURIComponent(url.searchParams.get('image') as string);
          if(path.extname(imageUrl) === '.png') {
              withPng = true;
          }
      }
      if(url.searchParams.has('output') && url.searchParams.get('output') == 'png') {
          withPng = true;
      } 
  }

  if(withPng) img.attr('data-png','true');
  img.attr("loading","lazy");
  img.addClass("image-container");
  img.addClass("loading");
  img.removeAttr("width");
  img.removeAttr("height");

  // MANIPULATE IMG
  if(!ads) {
      if(isUnsplash) img.attr("src",`${src}&w=800&q=80&mark-pad=10`);
      else img.attr("src",`${src}&size=${size}`);
      img.removeAttr('data-src');

      return img.clone();
  } else {
      img.removeAttr("src");
      if(isUnsplash) img.attr("data-src",`${src}&w=300&q=55&mark-pad=5`);
      else img.attr("data-src",`${src}&size=${size}`);

      const a = $("<a></a>");
      a.attr("data-fancybox","true");
      if(isUnsplash) a.attr("data-src",`${src}&w=800&q=80&mark-pad=10`);
      else a.attr("data-src",src);
      if(captionText) a.attr('data-caption',captionText);
      const newImg = img.clone();
      a.append(newImg);
      return a;
  }
}

export default function blogEncode(html_string: string,ads=false) {
  const $ = load(html_string,null,false);
  const imagesOnly = $("img");
  const p_tag = $("p");
  const picture = $("picture");
  const figure = $("figure");

  if(picture.length > 0) {
      picture.each((i,f)=>{
          const img = $(f).find('img');
          if(img.length > 0) {
              img.each((_,i)=>{
                  const newImg = parseImage($,i,ads);
                  $(f).replaceWith(newImg)
              })
          }
      })
  }

  if(imagesOnly.length > 0) {
      imagesOnly.each((_,i)=>{
          const newImg = parseImage($,i,ads);
          $(i).replaceWith(newImg)
      })
  }

  if(figure.length > 0) {
      figure.each((i,fig)=>{
          const f = $(fig);
          const style = f.attr('style');
          if(!style || !/width/.test(style)) {
              f.attr('style','max-width:400px;width:90%');
          }
      })
  }

  if(p_tag.length > 0 && ads) {
      p_tag.each((i,_p)=>{
          if(i === Math.round(p_tag.length/3)) {
              const div = load([])("<div></div>");
              div.attr("data-portalnesia-action","ads")
              div.attr("data-ads","300");
              div.insertBefore(_p);
          }

          if(i === Math.round(2*p_tag.length/3)) {
              const div = load([])("<div></div>");
              div.attr("data-portalnesia-action","ads")
              div.attr("data-ads","468");
              div.insertBefore(_p);
          }
      })
  }

  return $.html();
}