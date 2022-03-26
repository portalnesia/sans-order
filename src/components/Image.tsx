import React from 'react'
import {LazyLoadImage} from 'react-lazy-load-image-component'
import {Menu,MenuItem} from '@mui/material'

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    id?: string;
    /**
     * If true, will add webp component
     */
    webp?: boolean;
    /**
     * Image url
     */
    src: string;
    /**
     * If webp is true, default image type.
     */
    type?: 'png'|'jpg'|'jpeg';
    className?: string;
    /**
     * If true, add fancybox component
     */
    fancybox?:boolean;
    /**
     * Data for fancybox component
     */
    dataFancybox?:string;
    /**
     * If fancybox is true, URL of original image
     */
    dataSrc?:string;
    /**
     * Alt of images
     */
    alt?: string;
    lazy?:boolean;
    withPng?:boolean;
    blured?: boolean;
    caption?: string;
}

function getPortalnesiaImagePng(img: string) {
    try {
        const url = new URL(img);
        if(url.searchParams.has('output') && url.searchParams.get('output') == 'png') return img;
        return `${img}&output=png`
    } catch {
        return `${img}&output=png`
    }
}

/**
 * 
 * Custom Image Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
const Image=(props: ImageProps)=>{
    const {webp,src,lazy=true,type,withPng,className,fancybox,dataFancybox='images',dataSrc,alt,onContextMenu: __,placeholder:_,blured:p,caption,...rest}=props
    const [anchorEl,setAnchorEl]=React.useState<[number,number]|null>(null)
    const [menu,setMenu]=React.useState(false);
    const imgRef=React.useRef<HTMLAnchorElement|null>(null);

    const onRightClick: React.MouseEventHandler<HTMLImageElement> = React.useCallback((event: React.MouseEvent<HTMLImageElement>)=>{
        event.stopPropagation()
        event.preventDefault()
        setMenu(!menu)
        setAnchorEl([event.clientX - 2,event.clientY - 4]);
    },[menu])
    
    const onClose=React.useCallback(()=>{
        setMenu(false)
        setAnchorEl(null)
    },[])

    React.useEffect(()=>{
        if(fancybox) {
            const wind = window;
            const $=require('jquery');
            (wind as any).jQuery=$;
            require('@fancyapps/fancybox');
            $('[data-fancybox]').fancybox({
                protect: true,
                hash: false,
                mobile:{
                    clickSlide: function() {
                        return "close";
                    }
                },
            });
        }
    },[fancybox,src,dataSrc])

    const webpSrc = React.useMemo(()=>{
        if(/unsplash\.com/.test(src)) {
            return `${src}&fm=webp`
        }
        return `${src}&output=webp`
    },[src,webp])

    const pngDataSrc = React.useMemo(()=>{
        if(!/content\.portalnesia\.com/.test(dataSrc||src)) {
            if(/unsplash\.com/.test(src)) return `${(dataSrc||src)}&fm=png`
            return (dataSrc||src)
        }
        return getPortalnesiaImagePng((dataSrc||src))
    },[dataSrc,src])

    const pngSrc = React.useMemo(()=>{
        if(!/content\.portalnesia\.com/.test(dataSrc||src)) {
            if(/unsplash\.com/.test(src)) return `${(src)}&fm=png`
            return (src)
        }
        return getPortalnesiaImagePng((src))
    },[src])
    
    if(webp) {
        return (
            <div>
                {fancybox ? (
                    <a ref={(ref)=>imgRef.current=ref} data-fancybox={dataFancybox} data-src={withPng ? pngDataSrc : (dataSrc||src)} data-options="{'protect':'true'}" {...(caption||alt ? {'data-caption':caption||alt} : {})}>
                        <picture>
                            {!withPng && <source type='image/webp' srcSet={webpSrc}/>}
                            <source type={withPng ? 'image/png' : 'image/jpeg'} srcSet={withPng ? pngSrc : src}/>
                            {lazy ? (
                                <LazyLoadImage src={withPng ? pngSrc : src} className={`no-drag ${className ? ' '+className : ''}`} onContextMenu={onRightClick} {...(alt ? {alt:alt} : {})} {...rest} />
                            ) : (
                                <img src={withPng ? pngSrc : src} className={`no-drag ${className ? ' '+className : ''}`} onContextMenu={onRightClick} {...(alt ? {alt:alt} : {})} {...rest} />
                            )}
                        </picture>
                    </a>
                ) : (
                    <picture>
                        {!withPng && <source type='image/webp' srcSet={webpSrc}/> }
                        <source type={withPng ? 'image/png' : 'image/jpeg'} srcSet={withPng ? pngSrc : src}/>
                        {lazy ? (
                            <LazyLoadImage src={withPng ? pngSrc : src} className={`no-drag${className ? ' '+className : ''}`} onContextMenu={(e)=>e.preventDefault()} {...(alt ? {alt:alt} : {})} {...rest} />
                        ) : (
                            <img src={withPng ? pngSrc : src} className={`no-drag${className ? ' '+className : ''}`} onContextMenu={(e)=>e.preventDefault()} {...(alt ? {alt:alt} : {})} {...rest} />
                        )}
                    </picture>
                )}
                <Menu
                    anchorReference="anchorPosition"
                    anchorPosition={
                        anchorEl !== null ? { top: anchorEl[1], left: anchorEl[0] } : undefined
                    }
                    open={menu}
                    onClose={onClose}
                >
                    <MenuItem onClick={()=>{onClose(),imgRef?.current?.click()}}>Open images</MenuItem>
                </Menu>
            </div>
        )
    } else {
        return(
            <div>
                {fancybox ? (
                    <a ref={(ref)=>imgRef.current=ref} data-fancybox={dataFancybox} data-src={withPng ? pngDataSrc : (dataSrc||src)} data-options="{'protect':'true'}" {...(caption||alt ? {'data-caption':caption||alt} : {})}>
                        {lazy ? (
                            <LazyLoadImage src={withPng ? `${src}&output=png` : src} className={`no-drag${className ? ' '+className : ''}`} onContextMenu={onRightClick} {...(alt ? {alt:alt} : {})} {...rest} />
                        ) : (
                            <img src={withPng ? `${src}&output=png` : src} className={`no-drag${className ? ' '+className : ''}`} onContextMenu={onRightClick} {...(alt ? {alt:alt} : {})} {...rest} />
                        )}
                        
                    </a>
                ) : lazy ? (
                    <LazyLoadImage src={withPng ? `${src}&output=png` : src} className={`no-drag${className ? ' '+className : ''}`} onContextMenu={(e)=>e.preventDefault()} {...(alt ? {alt:alt} : {})} {...rest} />
                ) : (
                    <img src={withPng ? `${src}&output=png` : src} className={`no-drag${className ? ' '+className : ''}`} onContextMenu={(e)=>e.preventDefault()} {...(alt ? {alt:alt} : {})} {...rest} />
                )}
                <Menu
                    anchorReference="anchorPosition"
                    anchorPosition={
                        anchorEl !== null ? { top: anchorEl[1], left: anchorEl[0] } : undefined
                    }
                    open={menu}
                    onClose={onClose}
                >
                    <MenuItem onClick={()=>{onClose(),imgRef?.current?.click()}}>Open images</MenuItem>
                </Menu>
            </div>
        )
    }
}

export default Image;