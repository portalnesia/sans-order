import {marked} from 'marked';
//@ts-ignore
import markedPlainText from 'marked-plaintext';
import hljs from 'highlight.js';

export function convertToHtml(markdown: string,preview?: boolean) {
  if(typeof markdown !== 'string') return '';
  const html = marked.parse(markdown,{
    breaks:true,
    ...(preview ? {
      highlight: function(code: string,language: string){
        const validLanguage = hljs.getLanguage(language) ? language : 'plaintext'
        return hljs.highlight(code,{language:validLanguage}).value
      }
    } : {})
  })
  return html;
}

export function convertToPlaintext(markdown: string) {
  if(typeof markdown !== 'string') return '';
  const renderer = new markedPlainText();
  const text = marked.parse(markdown,{renderer,sanitize:false});
    return text;
}