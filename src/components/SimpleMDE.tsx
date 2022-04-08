import React from 'react'
import {SimpleMDEReactProps} from "react-simplemde-editor";
//import {UnsplashTypes,PixabayTypes} from 'portal/types/files'
import ReactDOMServer from "react-dom/server";
import {Markdown} from './Parser'
import dynamic from 'next/dynamic'
import 'easymde/dist/easymde.min.css'
import {Typography,Box} from '@mui/material'
import {styled} from '@mui/material/styles'
import { useRouter } from 'next/router';
import type {Options} from 'easymde'

const Browser=dynamic(()=>import('@comp/Browser'))
const SimpleMDE=dynamic(()=>import('react-simplemde-editor'),{ssr:false})
    
const Div = styled("div")<{disabled?:boolean}>(({theme,disabled})=>({
    '.editor-preview a':{
        color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
    },
    '.editor-toolbar.fullscreen, .EasyMDEContainer .CodeMirror-fullscreen, .editor-preview-side':{
        zIndex:1205
    },
    ...(disabled ? {
        pointerEvents:'none'
    } : {})
}))

export interface SimpleMDEProps extends SimpleMDEReactProps {
    image?: boolean;
    noSideBySide?: boolean;
    disabled?: boolean;
    label?: string;
    maxHeight?:number
}

const Simple=(props: SimpleMDEProps)=>{
    const {id="markdown-editor",value="",onChange,image,noSideBySide,disabled,label,options,maxHeight,...other} = props;
    const router = useRouter();
    const editor = React.useRef<any>()
    const [browser,setBrowser] = React.useState(false)

    const handleChange=React.useCallback((text: string)=>{
        if(disabled) return;
        const result=image === false ? text.replace(/(\[\!\[|\!\[)/g,"[") : text;
        if(onChange) onChange(result);
    },[image,disabled,onChange]);

    const handleSelectedImage=React.useCallback((url: string)=>{
        if(editor.current) editor.current?.drawImages(url);
    },[])

    const openBrowserImage=React.useCallback(()=>{
        setBrowser(true)
    },[])

    const opt = React.useMemo(()=>{
        const opt: Options={
            spellChecker: false,
            promptURLs:true,
            forceSync:true,
            sideBySideFullscreen:!noSideBySide,
            previewRender:(text: string)=>{
                return ReactDOMServer.renderToString(
                    <Markdown
                      source={text}
                      skipHtml={!Boolean(image)}
                      preview
                    />
                );
            },
            toolbar:["heading-1","heading-2","heading-3","unordered-list","ordered-list","horizontal-rule","|","bold", "italic", "quote","code","|","link",
                ...(image ? [{
                    name: "images",
                    action: openBrowserImage,
                    className: "fa fa-picture-o",
                    title: "Insert Image",
                }] : []),
                "table","preview",...(noSideBySide ? [] : ["side-by-side"]),"fullscreen",
                {
                    name: "guide",
                    action: function(){
                        return window.open('https://portalnesia.com/blog/markdown-guide')
                },
                className: "fa fa-question-circle",
                title: "Markdown Guide",
            }] as any,
            ...(maxHeight ? {
                maxHeight:`${maxHeight}px`
            } : {}),
            ...options
        }
        return opt;
    },[image,noSideBySide,options,maxHeight])
    
    return(
        <Div aria-disabled={disabled} disabled={disabled}>
            {label && (
                <Box ml={1}><Typography sx={{color:'text.secondary'}}>{label}</Typography></Box>
            )}
            <SimpleMDE
                onChange={handleChange}
                value={value}
                options={opt}
                getMdeInstance={(instance)=>{
                    editor.current=instance
                }}
                lang={router.locale||'en'}
                {...(id ? {id:id} : {})}
                {...other}
            />
            <Browser open={browser} onSelected={handleSelectedImage} onClose={()=>setBrowser(false)} />
        </Div>
    )
}
export default Simple;