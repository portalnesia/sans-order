import React from 'react'
import {getOffset} from '@comp/TableContent'

export interface SidebarProps {
  children?: React.ReactNode,
  type?: 'top'|'bottom',
  id: string,
  disabled?: boolean
}

export default function Sidebar(props: SidebarProps) {
  const {id,disabled=false,type='bottom',children} = props;

  React.useEffect(()=>{
    function getScrollTop() {
      return document?.documentElement?.scrollTop || document.body.scrollTop
    }
    const z = document.getElementById('staticdynamic');
    const x = window.matchMedia("(min-width: 960px)");
    const xx = window.matchMedia("(min-width: 1200px)")
    const padding = x.matches ? 92+24 : 64+24;
    let lastScroll = getScrollTop(),last: number|null=null,t: number;
    const dynamic = document.getElementById('dynamic')
    const dynOfs = (dynamic?.offsetHeight||0) + padding
    function onScroll() {
      if(last === null) last = getScrollTop()+padding;
      if(type === 'bottom' && Number(dynOfs) > Number(window.outerHeight - padding)) {
        const eh = Number(dynOfs),a = Number(getOffset(document.getElementById('static')).top),st=getScrollTop();
        if((st + padding >= a) && (a + eh) < Number((document.getElementById(id)?.offsetHeight||0) + padding)) {
          t = Math.round(last - (st - lastScroll));

          // Scroll ke bawah
          if(st - lastScroll > 0) {
            if(t < Math.round(window.outerHeight - eh - 10)) {
              t = Math.round(window.outerHeight - eh - 10)
            } else if(t > padding) t = padding;
            //console.log("1")
          }

          // Scroll ke atas
          else {
            //console.log("2")
            if(t < Math.round(window.outerHeight - eh)) {
              t = Math.round(window.outerHeight - eh)
            } else if (t > padding){
              t=padding;
            }
          }
          if(dynamic) dynamic.style.zIndex='1';
          if(dynamic) dynamic.style.position='fixed';
          if(dynamic) dynamic.style.top = `${t.toString()}px`
          if(dynamic) dynamic.style.width = `${z?.clientWidth}px`;
        } else {
          //console.log("3")
          t=padding;
          if(dynamic) dynamic.style.removeProperty('top')
          if(dynamic) dynamic.style.removeProperty('width')
          if(dynamic) dynamic.style.zIndex='1';
          if(dynamic) dynamic.style.position='relative';
        }
        last=t;
        lastScroll = st;
      } else {
        //console.log("4")
        if(z) z.style.zIndex='1';
        if(z) z.style.position='sticky';
        if(z) z.style.top = `${padding}px`
        if(z) z.style.width = `${z.clientWidth}px`;
      }
    }

    function onResize() {
      window.removeEventListener('scroll',onScroll)
      if(x.matches){
          window.addEventListener('scroll',onScroll)
      } else {
        if(dynamic) {
          dynamic.style.position='relative';
          dynamic.style.zIndex = '1'
        }
      }
    }

    if(disabled === false) {
      onResize();
      window.addEventListener('resize',onResize);
    }

    return ()=>{
      window.removeEventListener('resize',onResize)
      window.removeEventListener('scroll',onScroll)
    }

  },[id,disabled,type])

  return (
    <div id='staticdynamic'>
      <div key='static' id='static'></div>
      <div key='dynamic' id='dynamic'>
        {children}
      </div>
    </div>
  )
}