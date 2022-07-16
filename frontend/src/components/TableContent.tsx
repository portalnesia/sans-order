import React from 'react'
import {ucwords} from '@portalnesia/utils'
import {Typography,styled} from '@mui/material'
import { handlePageContent as onPageContentClicked } from './Parser'

export const ContentRoot = styled('div')(({theme})=>({
  position:'fixed',
  top:200,
  zIndex:101,
  transition: theme.transitions.create(['right','opacity'],{
      easing:theme.transitions.easing.easeIn,
      duration:500
  }),
  maxWidth:'80%'
}))

export const ContentButton = styled('div')(({theme})=>({
  cursor:'pointer',
  fontSize:15,
  padding:'7px 20px',
  backgroundColor:theme.palette.primary.main,
  color:'#ffffff',
  display:'inline-block',
  position:'absolute',
  top:61,
  left:-97,
  transform:'rotate(-90deg)',
  borderRadius:'10px 10px 0 0',
}))

export const ContentContainer = styled('div')(({theme})=>({
  backgroundColor:theme.palette.background.default,
  position:'relative'
}))

export const ContentSpan = styled('a')(({theme})=>({
  '& span':{
    '&:hover':{
      textDecoration:'underline'
    },
  },
  '&.active':{
    color:`${theme.palette.primary.main} !important`,
  }
}))

export const ContentContainerChild = styled('div')(({theme})=>({
  maxHeight:'calc(100vh - 220px)',
  overflowY:'auto',
  WebkitBoxShadow:'50px 4px 40px -7px rgba(0,0,0,0.2)',
  boxShadow:'50px 4px 40px -7px rgba(0,0,0,0.2)',
  padding:20,
  wordBreak:'break-word',
  minHeight:167
}))

type Args = {
  data: any
}

type Content = {
  id: string,
  name: string
}

export function getOffset(elem: Element|null){
  if(elem === null || !elem.getClientRects().length) return {top:0,left:0}
  const rect = elem.getBoundingClientRect();
  const win = elem.ownerDocument.defaultView;
  return {
    top:rect.top + (win?.scrollY||0),
    left: rect.left + (win?.scrollX||0)
  }
}

export default function useTableContent(opt: Args) {
  const [content,setContent] = React.useState<Content[]>([])
  const [right,setRight] = React.useState<number|null>(-500);
  const [opacity,setOpacity]=React.useState(0)
  const containerRef = React.useRef<number|null>(0)
  const hashRef = React.useRef<number|null>(null)
  
  const handlePageContent=React.useCallback((id: string,tutup?: boolean)=>(e?: any)=>{
    if(e && e.preventDefault) e.preventDefault()
    onPageContentClicked(id)(e)
    if(tutup===true) setRight(containerRef.current)
  },[])

  const btnPageContent=React.useCallback(()=>{
    if(right === 0) setRight(containerRef.current)
    else setRight(0)
  },[right])

  React.useEffect(()=>{
    const tim1 = setTimeout(()=>{
      let konten: Content[]=[];
      document.querySelectorAll('a > h2[id], a > h3[id], .table-content[id]').forEach(e=>{
          const id = e.getAttribute('id')||'';
          const name = (e.textContent||'')
          konten = konten.concat({id:id,name:name})
      })
      setContent(konten);
    },500)
  
    return()=>{
      clearTimeout(tim1)
    }
  },[opt.data])

  React.useEffect(()=>{
    function onScroll() {
        document.querySelectorAll<HTMLAnchorElement>('#tableOfContents a').forEach(a=>{
            if(a.hash.length > 0) {
                const o = document?.documentElement?.scrollTop || document.body.scrollTop
                const id = document.querySelector<Element>(a.hash);
                const x = window.matchMedia("(min-width: 1200px)")
                const padding = x.matches ? 92+24 : 64+24;
                if(getOffset(id).top - padding <= o+5) {
                  if(a.parentNode) {
                    for(let siblings of a.parentNode?.children) {
                      siblings.classList.remove('active');
                    }
                    a.classList.add('active');
                  }
                }
            }
        })
    }
    const tim2 = setTimeout(()=>{
      if(content.length > 0) {
        if(hashRef.current===null) {
          hashRef.current=10;
          const hash = window.location.hash;
          if(hash.length > 0) {
              handlePageContent(hash.substring(1))()
          }
        }
        if(containerRef.current===null) {
          const cont=document.getElementById('table-contents')
          if(cont) {
            const a=cont.clientWidth||cont.offsetWidth;
            containerRef.current=Number(a*-1);
            setRight(Number(a*-1));
            setOpacity(1)
          }
        }
        window.addEventListener('scroll',onScroll);
      }
    },500)
    return ()=>{
      window.removeEventListener('scroll',onScroll);
      clearTimeout(tim2)
      setRight(-500)
      setOpacity(0)
      containerRef.current=null
    }
  },[content])

  return {content,btnPageContent,handlePageContent,right,opacity};
}

export function HtmlLgDown(props: Args) {
  const {content,handlePageContent} = useTableContent(props);

  if(content?.length === 0) return null;
  return (
    <div id='tableOfContents'>
      {content.map((dt,i)=>(
          <ContentSpan key={`${dt?.id}-${i}`} href={`#${dt?.id}`} onClick={handlePageContent(dt?.id)}><Typography>{i+1}. <span>{dt?.name}</span></Typography></ContentSpan>
      ))}
    </div>
  )
}

export function HtmlLgUp(props: Args) {
  const {content,btnPageContent,right,opacity,handlePageContent} = useTableContent(props);

  if(content?.length === 0) return null;
  return (
    <ContentRoot sx={{right,opacity}}>
      <ContentContainer>
        <ContentButton onClick={btnPageContent} key={'0'}>Table of Content</ContentButton>
        <ContentContainerChild key={'1'} id='table-contents'>
          <div id="tableOfContents">
            {content.map((dt,i)=>(
              <ContentSpan key={`${dt?.id}-${i}`} href={`#${dt?.id}`} onClick={handlePageContent(dt?.id,true)}><Typography>{i+1}. <span>{dt?.name}</span></Typography></ContentSpan>
            ))}
          </div>
        </ContentContainerChild>
      </ContentContainer>
    </ContentRoot>
  )
}