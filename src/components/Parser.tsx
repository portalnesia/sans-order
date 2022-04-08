import React from 'react'
import Parserr,{domToReact,Element,HTMLReactParserOptions,attributesToProps} from 'html-react-parser'
import {styled} from '@mui/material/styles'
import Image from '@comp/Image'
import clx from 'classnames'
import Link from 'next/link'
import {slugFormat} from '@portalnesia/utils'
import {Table,TableHead,TableBody,TableRow,TableCell,Typography,SxProps,Theme} from '@mui/material'
import {convertToHtml} from '@utils/marked'
import DOMpurify from 'dompurify'
import hljs from 'highlight.js'
import Script from 'next/script'

export const editorStyles=(theme: Theme)=>({
  '& code:not(.hljs), & blockquote, & code.code:not(.hljs)':{
    background:theme.palette.action.hover,
    borderRadius:'.5rem'
  },
  '& pre code':{
    borderRadius:'.5rem',
    '@media (hover: hover) and (pointer: fine)':{
      '&::-webkit-scrollbar':{
        height:8,
        borderRadius:4
      },
      '&::-webkit-scrollbar-thumb':{
        //background:theme.palette.mode=='dark' ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)',
        background:'rgba(255,255,255,.2)',
        borderRadius:4,
        '&:hover':{
            background:'rgba(255,255,255,.4)'
        }
      },
    }
  },
  '& table':{
    '& td':{
      color:theme.palette.text.primary,
      borderTop:`1px solid ${theme.palette.divider}`,
    },
    '& th':{
      borderTop:`1px solid ${theme.palette.divider}`,
      borderBottom:`2px solid ${theme.palette.divider}`
    }
  },
  '& h1:not(.no-underline), & h2:not(.no-underline), & h3:not(.no-underline), & h4:not(.no-underline), .underline':{
    paddingBottom:'.3em',
    borderBottom:`1px solid ${theme.palette.divider}`
  },
  '& a':{
    '&[href]:not(.no-format)':{
      color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
    },
    '&[href]:not(.no-format):hover':{
      textDecoration:'underline'
    },
  }
})

const Div = styled('div')(({theme})=>({
  ...editorStyles(theme)
}))

const Img = styled(Image)(({theme})=>({
    [theme.breakpoints.up('sm')]: {
      maxWidth:400
    },
    [theme.breakpoints.down('sm')]: {
      maxWidth:'80%'
    },
    height:'auto'
}))

const handlePageContent=(id: string)=>(e: React.MouseEvent<HTMLAnchorElement>)=>{
  if(e && e.preventDefault) e.preventDefault()
  const conta=document.getElementById(id);
  if(conta){
      const a=conta.offsetTop,b=a-10;
      window.scrollTo({top:b,left:0,behavior:'smooth'});
  }
}

const parseOption = (opt : {preview?:boolean}): HTMLReactParserOptions =>({
  replace: (htmlNode)=>{
    const node = htmlNode as Element
    if(node?.type==='tag'&&node?.name==='div'){
      if(/table\-responsive/.test(node?.attribs?.class||"")) {
        return domToReact(node?.children,parseOption(opt)) as any;
      }
    }
    // A LINK
    if(node?.type==='tag'&&node?.name==='a'){
      if(node?.attribs?.['data-fancybox']){
        return domToReact(node?.children,parseOption(opt)) as any
      } else if(node?.attribs?.href) {
        const parent=node?.parent as Element;
        const isSocMed = parent?.name === 'blockquote' && ['instagram-media','twitter-tweet','tiktok-embed'].includes(parent?.attribs?.class||'');
        if(!isSocMed) {
          const {href,target,rel,...other}=node?.attribs
          if(href?.match(/^\#/)) {
              const idd = href.substring(1);
              return (
                  <a href={href} onClick={handlePageContent(idd)}>{domToReact(node?.children,parseOption(opt))}</a>
              )
          }
          if(
            /^https?\:\/\//.test(href)
            && !/portalnesia\.com/.test(href)
            && !/kakek\.c1\.biz/.test(href)
          ) {
            const hreff = /utm\_source\=portalnesia/i.test(href) ? href : `/link?u=${Buffer.from(encodeURIComponent(href)).toString('base64')}`
            return (
              <a target="_blank" rel='nofollow noreferrer noopener' href={hreff} {...other}>
                  {domToReact(node?.children,parseOption(opt))}
              </a>
            )
          } else if(
              (typeof target === 'undefined' || target=='_self')
              && (/^https:\/\/portalnesia\.com+/.test(href) || /^\//.test(href))
          ) {
            const hreff=href?.replace(/^https:\/\/portalnesia\.com\/?/,"/");
            return <Link href={hreff} passHref><a {...other}>{domToReact(node?.children,parseOption(opt))}</a></Link>
          }
        }
      }
    }
    // PICTURE
    if(node?.type==='tag'&&node?.name==='picture'){
      const parent=node?.parent as Element;
      const oriSrc = parent?.attribs?.['data-src']||parent?.attribs?.href;
      const caption = parent?.attribs?.['data-caption'];
      const child = node?.children?.[node?.children?.length -1] as Element|undefined;
      if(child?.name === 'img') {
          const {src,class:classs,...other}=child?.attribs;
          const srrrc=child?.attribs?.['data-src']||src;
          const ssrc=oriSrc||srrrc;
          const isUnsplash = /unsplash\.com/.test(srrrc);
          const srrc=!(/portalnesia\.com\/+/.test(srrrc)) && !(/^\/+/.test(srrrc)) && !isUnsplash ? `${process.env.CONTENT_URL}/img/url?image=${encodeURIComponent(srrrc)}&size=300&compress` : isUnsplash ? srrrc : `${srrrc}&compress`;
          const withPng = Boolean(child?.attribs?.['data-png']=='true');
          //return null
          return <Img caption={caption} lazy={!opt.preview} webp withPng={withPng} fancybox src={srrc} dataSrc={ssrc} className={clx('image-container',classs)} {...attributesToProps(other)} />
      }
    }
    // IMG
    if(node?.type==='tag' && node?.name==='img' && (node?.attribs?.src||node?.attribs?.['data-src'])){
      const {src,class:classs,...other}=node?.attribs
      const parent=node?.parent as Element;
      const srrrc=node?.attribs?.['data-src']||src;
      const isUnsplash = /unsplash\.com/.test(srrrc);
      const srrc=!(/portalnesia\.com\/+/.test(srrrc)) && !(/^\/+/.test(srrrc)) && !isUnsplash ? `${process.env.CONTENT_URL}/img/url?image=${encodeURIComponent(srrrc)}&size=300&compress` : isUnsplash ? srrrc : `${srrrc}&compress`;
      const withPng = Boolean(node?.attribs?.['data-png']=='true');
      const caption = parent?.attribs?.['data-caption'];
      const oriSrc = parent?.attribs?.['data-src'];
      const ssrc=oriSrc||srrrc;
      return <Img caption={caption} lazy={!opt.preview} webp withPng={withPng} fancybox src={srrc} dataSrc={ssrc} className={clx('image-container',classs)} {...attributesToProps(other)} />
    }

    // TABLE
    if(node?.type==='tag'&&node?.name==='table'){
      return(
        <div className='table-responsive'>
            <Table>
                {domToReact(node?.children,parseOption(opt))}
            </Table>
        </div>
      )
    }
    // THEAD
    if(node?.type==='tag'&&node?.name==='thead'){
      return(
        <TableHead>
            {domToReact(node?.children,parseOption(opt))}
        </TableHead>
      )
    }
    // TBODY
    if(node?.type==='tag'&&node?.name==='tbody'){
      return(
        <TableBody>
            {domToReact(node?.children,parseOption(opt))}
        </TableBody>
      )
    }
    // TR
    if(node?.type==='tag'&&node?.name==='tr'){
      return(
        <TableRow>
            {domToReact(node?.children,parseOption(opt))}
        </TableRow>
      )
    }
    // TH || TD
    if(node?.type==='tag'&&(node?.name==='th'||node?.name==='td')){
      return(
        <TableCell>
            {domToReact(node?.children,parseOption(opt))}
        </TableCell>
      )
    }
    if(node?.type==='tag'&&(node?.name==='html'||node?.name==='body')) {
      return <div>{domToReact(node?.children,parseOption(opt))}</div>
    }
    // P
    if(node?.type==='tag'&&node?.name==='p') {
      return <Typography paragraph variant='body1' component='p' gutterBottom>{domToReact(node?.children,parseOption(opt))}</Typography>
    }
    // SCRIPT
    if(node?.type==='tag'&&node?.name==='script') {
      const src = node?.attribs?.src;
      if(src) {
        return <Script src={src} strategy='lazyOnload' />
      }
    }

    if(node?.type==='tag' && ['h1','h2','h3','h4'].includes(node?.name)) {
      let {id,style,...other}=node?.attribs;
      const styles = attributesToProps({style})
      if(!id) {
        let text="";
        node?.children?.forEach(c=>{
          if(c?.type === 'text') text+=` ${(c as any)?.data}`;
          else {
            (c as Element)?.children?.forEach(cc=>{
              if(cc?.type === 'text') text+=` ${(cc as any)?.data}`;
            })
          }
        })
        if(text?.length > 0) id = slugFormat(text);
      }
      const parent = node?.parent as Element
      if(id && parent?.name != 'td') {
        if(node?.name === 'h1') {
          return <a className="no-format" href={`#${id}`} onClick={handlePageContent(id)}><Typography paragraph variant='h2' component='h2' {...attributesToProps(other)} style={styles.style} id={id} >{domToReact(node?.children,parseOption(opt))}</Typography></a>
        }
        else if(node?.name === 'h2') {
          return <a className="no-format" href={`#${id}`} onClick={handlePageContent(id)}><Typography paragraph variant='h3' component='h3' {...attributesToProps(other)} style={styles.style} id={id}>{domToReact(node?.children,parseOption(opt))}</Typography></a>
        }
        else if(node?.name === 'h3'||node?.name === 'h4'||node?.name === 'h5'||node?.name === 'h6') {
          return <a className="no-format" href={`#${id}`} onClick={handlePageContent(id)}><Typography paragraph variant='h4' component='h4' {...attributesToProps(other)} style={styles.style} id={id}>{domToReact(node?.children,parseOption(opt))}</Typography></a>
        }
      } else {
        if(node?.name === 'h1') {
            return <Typography paragraph variant='h2' component='h2' {...attributesToProps(other)} id={id} {...(parent?.name == 'td' ? {style:{...styles.style,paddingBottom:'unset',borderBottom:'unset'}} : {style:styles.style})}>{domToReact(node?.children,parseOption(opt))}</Typography>
        }
        else if(node?.name === 'h2') {
            return <Typography paragraph variant='h3' component='h3' {...attributesToProps(other)} id={id} {...(parent?.name == 'td' ? {style:{...styles.style,paddingBottom:'unset',borderBottom:'unset'}} : {style:styles.style})}>{domToReact(node?.children,parseOption(opt))}</Typography>
        }
        else if(node?.name === 'h3'||node?.name === 'h4'||node?.name === 'h5'||node?.name === 'h6') {
            return <Typography paragraph variant='h4' component='h4' {...attributesToProps(other)} id={id} {...(parent?.name == 'td' ? {style:{...styles.style,paddingBottom:'unset',borderBottom:'unset'}} : {style:styles.style})}>{domToReact(node?.children,parseOption(opt))}</Typography>
        }
      }
    }
  }
})

export interface ParserProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  html: string,
  preview?: boolean,
  sx?: SxProps<Theme>
}

export function Parser({html,preview,...other}: ParserProps) {
  const divRef=React.useRef<HTMLDivElement>(null)

    React.useEffect(()=>{
        if(divRef.current) {
          //,code.code:not(.not-hljs)
          divRef.current.querySelectorAll('pre code:not(.not-hljs),code.code:not(.not-hljs)').forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
          });
        }
    },[html])

    return(
      <Div ref={divRef} {...other}>
        {Parserr(html,parseOption({preview}))}
      </Div>
    )
}

export interface MarkdrownProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  source: string,
  preview?: boolean,
  skipHtml?: boolean,
  sx?: SxProps<Theme>
}

export function Markdown({source,skipHtml,preview,...other}: MarkdrownProps) {
  const html = React.useMemo(()=>{
    const hhtm = convertToHtml(source,preview);
    const forb = skipHtml ? ['img','iframe','video'] : ['video'];
    return DOMpurify.sanitize(hhtm, {FORBID_TAGS: forb,USE_PROFILES: {html: true}})
  },[source,skipHtml,preview])

  return <Parser preview={preview} html={html} {...other} />
}