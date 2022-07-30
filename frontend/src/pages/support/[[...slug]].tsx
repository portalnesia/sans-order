import React from 'react'
import {TextareaAutosize,IconButton,List,ListItemButton,ListItemText,Hidden, Typography, ListItemAvatar, Toolbar, Badge, ListItemIcon, MenuItem} from '@mui/material'
import {
  ParentRoot,
  ListContainer,
  ListHeader,
  ListRoot,
  ChatInputContainer,
  ChatImage,
  ChatContainer,
  ChatWrapper,
  ChatToBottom,
  ChatSlidedown,
  ChatAvatar,
  ChatIconButton,
  ChatHeader,
  ChatDivWrapper,
  ChatFile,
  ChatRoot
} from '@comp/Chat'
import useNotif from '@utils/notification'
import {useAPI} from '@utils/api';
import {useRouter} from 'next/router'
import { State } from '@redux/index';
import { clean, copyTextBrowser, ucwords } from '@portalnesia/utils';
import Header from '@comp/Header';
import Image from '@comp/Image'
import Button from '@comp/Button'
import Dashboard from '../../layout/home/index';
import wrapper,{useSelector} from '@redux/store';
import {Support,Message, IPages} from '@type/index'
import { useTranslation } from 'next-i18next';
import { StrapiResponse } from '@portalnesia/portalnesia-strapi';
import * as Main from '@utils/Main'
import { Search as SearchIcon,Info as InfoIcon,ArrowBack,Send as SendIcon,Done,DoneAll,Refresh,ArrowDownward,
  Close as CloseIcon,Image as ImageIcon,FileCopy } from '@mui/icons-material';
import clx from 'classnames'
import Avatar from '@comp/Avatar';
import { Circular } from '@comp/Loading';
import { isMobile } from 'react-device-detect';
import { Parser } from '@comp/Parser';
import MenuPopover from '@comp/MenuPopover';
import Slidedown from 'react-slidedown'
import dynamic from 'next/dynamic';

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const Table=dynamic(()=>import('@mui/material/Table'))
const TableBody=dynamic(()=>import('@mui/material/TableBody'))
const TableRow=dynamic(()=>import('@mui/material/TableRow'))
const TableCell=dynamic(()=>import('@mui/material/TableCell'))

export const getServerSideProps = wrapper(async({getTranslation,redirect,token,params,request,locale}) => {
  const slug = params?.slug
  if(typeof slug?.[2] !== 'undefined') return redirect();
  if(typeof slug === 'undefined' && !token?.user) return redirect('/apps');
  if(slug?.[0] === 'admin' && !token?.user) return redirect();
  const isAdmin = slug?.[0] === 'admin';
  const id = isAdmin ? slug?.[1] : slug?.[0];
  let title='Support';
  let meta: StrapiResponse<Support, false, any>|undefined; 
  if(typeof slug !== 'undefined' && (slug?.[0] === 'admin' && typeof slug?.[1] !== 'undefined' || slug?.[0] !== 'admin')) meta = await request('get',`/supports/detail/${id}${isAdmin ? '?admin=true' : ''}`);

  if(meta) {
    title = `${meta?.data?.subject} - Support`
  }
  return {
    props:{
      ...(meta ? {meta} : {}),
      header:{
        title
      },
      ...(await getTranslation('support',locale||'en'))
    }
  }
});

function SupportMessage({dt,admin,diffDay}: {diffDay?:boolean,admin?:boolean,dt: Message & {day: string,time: string}}) {
  const {t} = useTranslation('support');
  const ref = React.useRef(null);
  const setNotif=useNotif()
  const [open,setOpen] = React.useState(false)

  const handleCopy=React.useCallback((text)=>()=>{
    setOpen(false);
    if(typeof text==='string') {
      copyTextBrowser(clean(text)).then(()=>{
        setNotif(t("copied"),false);
      }).catch(()=>{})
    }
  },[setNotif,t])

  const handleOpenMenu = React.useCallback((e: React.MouseEvent<HTMLDivElement>)=>{
    e.preventDefault();
    setOpen(true)
  },[])

  return (
    <React.Fragment key={`${dt.id}-${dt.room_id}`}>
      {diffDay && (
        <li className={'date'} key={`date-${dt?.id}`}>
          <span>{dt?.day}</span>
        </li>
      )}

      <ChatContainer
        id={`msg-${dt.id}`}
        chatAlign={!admin ? (dt?.from?.id != 1 ? 'right' : 'left') : (dt?.from?.id == 1 ? 'right' : 'left')}
      >
        <div className='chat'>
          <div className='chatP'>
            <div ref={ref} onContextMenu={handleOpenMenu} className='chatSpan noselect'>
              {dt?.file && (
                <Image fancybox src={`${dt?.file?.url}`} style={{maxWidth:200,maxHeight:200,marginBottom:5}} alt={dt?.message} />
              )}
              <Parser html={dt?.message||''} sx={{mb:1}} />
              <div className='info'>
                <Typography component='time'>{dt?.time}</Typography>
              </div>
            </div>
          </div>
        </div>

        <MenuPopover open={open} onClick={()=>setOpen(false)} anchorEl={ref.current} paperSx={{py:1}}>
          <MenuItem key={0} onClick={handleCopy(dt?.message)}><ListItemIcon><FileCopy /></ListItemIcon> Copy</MenuItem>
        </MenuPopover>
      </ChatContainer>
    </React.Fragment>
  )
}

type ISupportDetail = {
  homeReady?: boolean;
  selected?: string;
  support?: Support;
  initImage?: File;
  changeStatus(status: keyof Support,newstatus: any,id?: number): void;
  admin?: boolean
}
let pindah=false;
function SupportDetail({homeReady,selected,support,initImage,changeStatus,admin}: ISupportDetail) {
  const {t} = useTranslation('support');
  const {t:tCom} = useTranslation('common');
  const {user,ready} = useSelector<Pick<State,'user'|'ready'>>(s=>({user:s.user,ready:s.ready}));
  const router=useRouter()
  const locale = router.locale||'en'
  const [input,setInput]=React.useState<Partial<Message>>({message:''})
  const [imageUrl,setImageUrl]=React.useState<string|ArrayBuffer|undefined>();
  const [image,setImage]=React.useState<File|undefined>();
  const [loading,setLoading]=React.useState(true);
  const [reachEnd,setReachEnd]=React.useState(false);
  const [data,setData]=React.useState<(Message & {day: string,time: string})[]>([]);
  const [notif,setNotiff]=React.useState<string|null>(null);
  const setNotif=useNotif()
  const [showBottom,setShowBottom]=React.useState(false)
  const [lastScroll,setLastScroll]=React.useState(0)
  const [cekScroll,setCekScroll]=React.useState(false)
  const [botPos,setBotPos]=React.useState(71)
  const [disabled,setDisabled]=React.useState<string|null>(null);
  const [dialog,setDialog]=React.useState(false);
  const [badge,setBadge]=React.useState(0);
  const [page,setPage] = React.useState(0);
  const {get,upload,put} = useAPI();

  const fileRef=React.useRef<HTMLInputElement>(null)
  const inputRef=React.useRef<HTMLDivElement>(null)
  const conRef=React.useRef<HTMLDivElement>(null)
  const textRef=React.useRef<HTMLTextAreaElement>(null)

  const handleBack=React.useCallback(()=>{
    if(homeReady) return router.back();
    else return router.replace('/support/[[...slug]]',`/support${admin ? '/admin' : ''}`,{shallow:true})
  },[homeReady,admin])

  const getMsg=React.useCallback((page: number=1,scroll?:boolean,conc?: boolean)=>{
    get<Message,true>(`/supports/${support?.id}?pageSize=50&page=${page}${admin ? '&admin=true' : ''}`).then((res)=>{
      pindah=false;
      setReachEnd(res?.meta?.pagination?.page == res?.meta?.pagination?.pageCount)
      if(res?.data?.length) {
        const msgId=data?.length ? `msg-${data?.[0]?.id}` : false;
        setPage(res?.meta?.pagination?.page);
        const a = conc ? data : [];
        const c = res?.data?.map(dt=>{
          const date = Main.getDayJs(dt?.datetime);
          const day = date.locale(locale).format("MMM DD, YYYY");
          const time = date.locale(locale).format("HH:mm");
          return {
            ...dt,
            day,
            time
          }
        }).reverse();
        const b = c.concat(a);
        setData(b)
        setTimeout(()=>{
          const con=document.getElementById('chat-detail');
          if(scroll && msgId) {
            const msgCon=document.getElementById(msgId)
            if(msgCon) con?.scrollTo(0,msgCon?.offsetTop - 100)
          } else if(!scroll) {
            con?.scrollTo(0,con?.scrollHeight)
          }
        },50)
        setTimeout(()=>{
          setLoading(false)
        },150)
      } else {
        setLoading(false)
      }
    }).catch((err)=>{
      setLoading(false)
      pindah=false;
    })
  },[get,data,admin,support,locale])

  const processBottom=React.useCallback(()=>{
    if(conRef?.current && inputRef?.current) setBotPos(conRef?.current?.clientHeight - inputRef?.current?.offsetTop)
  },[])

  const handleLoadMore=React.useCallback(()=>{
    if(!loading && !reachEnd){
      setLoading(true)
      getMsg(page+1,true)
    }
  },[page,loading,reachEnd])

  const handleToBottom=React.useCallback(()=>{
    setCekScroll(false);
    setShowBottom(false)
    const con=document.getElementById('chat-detail')
    con?.scrollBy({left:0,top:con?.scrollHeight,behavior:'smooth'});
    setBadge(0)
  },[])

  const handleFileChange=React.useCallback((e)=>{
    const file=e?.target?.files?.[0] || e?.dataTransfer?.files?.[0] || false;
    if(file){
      if(file?.size>5242880) setNotif(t("max_file",{max:5}),true);
      if(file.type.match("image/*")) setImage(file);
      else setNotif(t('only_image'),true);
    }
  },[setNotif,t])

  const handleChange=React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>)=>{
    setInput({
      ...input,
      message:e.target.value
    })
    setTimeout(()=>processBottom(),100);
  },[input,processBottom])

  const handleCloseSupport=React.useCallback(()=>{
    setDisabled('dialog')
    put<Support>(`/supports/${support?.id}`,{status:'close'}).then((res)=>{
      setDisabled(null)
      setNotiff(t('ticket_close'))
      changeStatus('status','close',res?.data?.id);
      setDialog(false)
    }).catch(err=>{
      setDisabled(null)
    })
  },[put,changeStatus,support,t])

  const handleSubmit=()=>{
    if(!image && input?.message?.match(/\S/) === null) return setNotif(t('empty'),true);
    setDisabled('send')
    const form=new FormData();
    form.append('data',JSON.stringify({...input,admin:!!admin}));
    if(image) form.append(`files.file`,image,image.name);

    const opt={
      headers:{
        'Content-Type':'multipart/form-data'
      },
    }
    
    upload<Message>(`/supports/${support?.id}`,form,opt)
    .then((res)=>{
        setDisabled(null)
        const con=document.getElementById('chat-detail')
        const date = Main.getDayJs(res?.data?.datetime);
        const day = date.locale(locale).format("MMM DD, YYYY");
        const time = date.locale(locale).format("HH:mm");
        const a=data.concat([{...res.data,day,time}]);
        setData(a)
        setImage(undefined)
        setInput({message:''})
        setTimeout(()=>{
          changeStatus('status','customer-reply',support?.id)
          setNotiff(null)
          con?.scrollBy({left:0,top:con?.scrollHeight,behavior:'smooth'})
        },100);
        textRef?.current?.focus();
    }).catch((err)=>{
        setDisabled(null)
        textRef?.current?.focus();
    })
  }

  const handleKeyPress=React.useCallback((e)=>{
    if(e?.keyCode==13 && !e?.shiftKey && !isMobile) {
      if(input?.message?.match(/\S/) !== null){
        e.preventDefault();
        handleSubmit();
      }
    }
  },[input.message,handleSubmit])

  React.useEffect(()=>{
    if(initImage) {
        if(initImage?.size>5242880) setNotif(t("max_file",{max:5}),true);
        if(initImage?.type?.match("image/*")) setImage(initImage);
        else setNotif(t('only_image'),true);
    }
  },[initImage])

  React.useEffect(()=>{
    if(image){
      const reader = new FileReader();
      reader.onload = (e)=>{
        if(e?.target?.result) setImageUrl(e.target.result);
      };
      reader.readAsDataURL(image);
    } else {
      setImageUrl(undefined)
      if(fileRef.current) fileRef.current.value=''
    }
  },[image])

  React.useEffect(()=>{
    const con=document.getElementById('chat-detail')
    const onScroll=()=>{
      if(support && pindah===false && con) {
        const st=con?.scrollTop;
        if(st <= 100) {
          if(!loading && !reachEnd){
            setLoading(true)
            getMsg(page+1,true,true)
          }
        }
        if(st + con?.clientHeight >= con?.scrollHeight - 200) {
            setShowBottom(false)
            setBadge(0)
        } else if(st <= lastScroll && (st + con?.clientHeight) < con?.scrollHeight){
            setCekScroll(true);
            setShowBottom(false)
        } else if(st > lastScroll && (st + con?.clientHeight) < (con?.scrollHeight-200) && cekScroll===true) {
            setShowBottom(true)
        }
        setLastScroll(st);
      }
    }
    con?.addEventListener('scroll',onScroll);
    return ()=>{
      con?.removeEventListener('scroll',onScroll);
    }
  },[support,page,reachEnd,loading,cekScroll,lastScroll]);

  React.useEffect(()=>{
    pindah=true;
    if(support && ready) {
      getMsg(1,false,false);
    }
  },[support,ready])

  return (
    <ChatRoot ref={conRef} className={clx(selected && 'root-container')}>
      <ChatHeader position='absolute' square elevation={0}>
        <Toolbar>
          {selected && (
            <>
              <Hidden mdDown>
                {user && (
                  <ChatIconButton className={'margin-right'} onClick={handleBack} size="large">
                    <ArrowBack />
                  </ChatIconButton>
                )}
              </Hidden>
              <ChatAvatar 
                alt={admin ? support?.name||'' : 'SansOrder'}
                {...(admin && support?.picture ? {
                  children:<Image width={40} height={40} src={`${support.picture}&size=40`} alt={support.name} />
                } : admin ? {
                  children:support?.name
                } : {
                  children:<Image width={40} height={40} src={`${Main.photoUrl('/sans-icon/Sans-Text-Light-120.png',true)}`} alt="SansOrder" />
                })}
              />
              <Typography noWrap variant='h6' component='h6' style={{flex:1}}>
                  SansOrder Support
                  <Typography noWrap variant='caption' component='p' style={{padding:'2px 6px 2px 0'}}>
                    @sansorder
                  </Typography>
              </Typography>

              <ChatIconButton onClick={()=>setDialog(true)} size="large">
                <InfoIcon />
              </ChatIconButton>
            </>
          )}
        </Toolbar>
      </ChatHeader>

      {!selected ? (
        <ChatDivWrapper>
          <Typography variant='h6' component='h5' className='no-drag'>{t('select_message')}</Typography>
        </ChatDivWrapper>
      ) : (
        <>
          <ChatSlidedown>
            {notif && (
              <div className={'notification'}>
                <div><Typography>{notif?.split("\n").map((item,key)=><React.Fragment key={key}>{item}<br/></React.Fragment>)}</Typography></div>
                <IconButton onClick={()=>setNotiff(null)} size="large">
                  <CloseIcon />
                </IconButton>
              </div>
            )}
          </ChatSlidedown>

          {showBottom && (
            <ChatToBottom>
              <IconButton onClick={handleToBottom} size="large">
                {badge===0 ?  <ArrowDownward /> : (
                  <Badge badgeContent={badge} color="primary">
                    <ArrowDownward />
                  </Badge>
                )}
              </IconButton>
            </ChatToBottom>
          )}

          <ChatWrapper id='chat-detail'>
            {loading && (
              <li key='refreshing-msg' style={{textAlign:'center'}}>
                <div style={{margin:'20px 0'}}>
                  <Circular thickness={4.5} size={45}/>
                </div>
              </li>
            )}
            {reachEnd ? (
              <li key='info-msg' style={{textAlign:'center'}}>
                <div style={{fontSize:13,margin:'20px 0'}}>
                  <Typography>{t('no_message')}</Typography>
                </div>
              </li>
            ) : !reachEnd && !loading ? (
              <li key='refresh-msg' style={{textAlign:'center'}}>
                <IconButton onClick={handleLoadMore} size="large">
                  <Refresh />
                </IconButton>
              </li>
            ) : null}

            {data?.length > 0 ? data?.map((dt,i) => (
              <SupportMessage key={`${dt.id}-${dt.room_id}`} dt={dt} diffDay={dt?.day !== data?.[i-1]?.day} admin={admin} />
            )) : null}
          </ChatWrapper>

          <Slidedown style={{zIndex:80}}>
            {imageUrl ? (
              <ChatImage sx={{bottom:botPos}}>
                <div className='imgBtn'>
                  <IconButton onClick={()=>setImage(undefined)} size="large"><CloseIcon /></IconButton>
                </div>
                <Image blured fancybox src={imageUrl as unknown as string} />
              </ChatImage>
            ) : <React.Fragment></React.Fragment>}
          </Slidedown>

          <ChatInputContainer ref={inputRef} className={clx(disabled==='send' && 'disabled')}>
            <div key={0} style={{height:'100%',position:'relative',flex:1}}>
              <TextareaAutosize ref={textRef} minRows={1} maxRows={4} placeholder={t('type')} className={clx('input')} value={input?.message} onChange={handleChange} onKeyDown={handleKeyPress}  disabled={disabled==='send'} />
            </div>
            <div key={1} title='Images'>
              <input ref={fileRef} type='file' accept="image/*" style={{display:'none'}} onChange={handleFileChange} />
              <IconButton size='small' onClick={()=>fileRef?.current?.click()} disabled={disabled==='send'} className={clx(disabled==='send' && 'disabled')}>
                <span className={'icon-label img-icon'}>
                  <ImageIcon />
                </span>
              </IconButton>
            </div>
            <div key={2} title={tCom('send')}>
              <IconButton size='small' onClick={handleSubmit} disabled={disabled==='send'} className={clx(disabled==='send' && 'disabled')}>
                <span className={'icon-label'}>
                  <SendIcon />
                </span>
              </IconButton>
            </div>
          </ChatInputContainer>
        </>
      )}

      <Dialog open={dialog} scroll='body' handleClose={()=>setDialog(false)}>
        <DialogTitle>{t('information')}</DialogTitle>
        <DialogContent dividers>
          <div style={{overflowX:'auto'}}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>{t('subject')}</TableCell>
                  <TableCell>{support?.subject}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{tCom('name')}</TableCell>
                  <TableCell>{support?.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>{support?.email}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>{support?.status}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </DialogContent>
        <DialogActions>
          <Button text color='inherit' onClick={()=>setDialog(false)} disabled={disabled==='dialog'}>OK</Button>
          <Button color='error' size='medium' onClick={handleCloseSupport} disabled={disabled==='dialog'||support?.status==='close'} loading={disabled==='dialog'}>{t('close_ticket')}</Button>
        </DialogActions>
      </Dialog>
    </ChatRoot>
  )
}

type ISupportList = {
  selected?: string,
  chatLoading?: boolean,
  list: Support[],
  onClick(id: number): void,
  onSearch(value:string): void,
  getData(page: number): Promise<StrapiResponse<Support, true, any> | null>
  admin?:boolean
}
function SupportList({admin,selected,chatLoading,list,onClick,onSearch,getData}: ISupportList) {
  const [search,setSearch]=React.useState("")
  const user = useSelector<State['user']>(s=>s.user);
  const [reachEnd,setReachEnd] = React.useState(false);
  const [page,setPage] = React.useState(1);

  const handleSearch=React.useCallback((e)=>{
    setSearch(e.target.value)
    onSearch(e.target.value)
  },[onSearch])

  const handleClick=React.useCallback((id: number)=>(e: React.MouseEvent<HTMLDivElement>)=>{
    onClick(id);
  },[onClick])
  
  React.useEffect(()=>{
    const div = document.getElementById('chat-list-component');
    async function onScroll() {
      if(div) {
        const scrollTop = div.scrollTop;
        const scrollHeight = div.scrollHeight ;
        const docHeight = div.clientHeight;
        //console.log(scrl);
        if((scrollTop + docHeight) > (scrollHeight-200)) {
          if(!chatLoading && !reachEnd) {
            const res = await getData(page+1);
            if(res !== null) {
              setReachEnd(res.meta.pagination.page === res.meta.pagination.pageSize);
              setPage(res.meta.pagination.page);
            }
          }
        }
      }
    }
    if(user !== null) {
        div?.addEventListener('scroll',onScroll);
    }
    
    return ()=>{
      div?.removeEventListener('scroll',onScroll);
    }
  },[chatLoading,getData,reachEnd,page,user])

  return (
    <ListRoot
      open
      variant='permanent'
      PaperProps={{square:true,elevation:0}}
    >
      <ListHeader>
        <div className={'headerContainer'}>
          <div className={'inputContainer'}>
            <div className='search'><SearchIcon /></div>
            <input className={'input'} placeholder="Search Subject" value={search} onChange={handleSearch} />
            {search?.length > 0 && (
              <IconButton className={'closeSearch'} onClick={()=>{setSearch(""),onSearch("")}} size="large"><CloseIcon /></IconButton>
            )}
          </div>
        </div>
      </ListHeader>

      <ListContainer id='chat-list-component'>
        <List>
          {list.map((dt)=>(
            <ListItemButton key={`chatlist-${dt?.id}`} className={clx(`${dt?.id}` == selected ? 'selected' : 'listItem')} onClick={handleClick(dt?.id)}
            //{...(!dt?.read ? {secondaryAction:(<span className={clx(classes.read)}></span>)} : {})}
            >
              <ListItemAvatar>
                {!admin ? (
                  <Avatar alt={dt?.name}>
                    <Image width={40} height={40} src={`${Main.photoUrl('/sans-icon/Sans-Text-Light-120.png',true)}`} alt={dt?.name} style={{width:40}} />
                  </Avatar>
                ) : (
                  <Avatar alt={dt?.name}>{dt?.name}</Avatar>
                )}
              </ListItemAvatar>
              <ListItemText
                primary={<Typography variant='body1'>{dt?.subject}</Typography>}
                secondary={<Typography variant='body2'>{dt?.status}</Typography>}
              />
            </ListItemButton>
          ))}
          {chatLoading && (
            <div style={{textAlign:'center',justifyContent:'center',alignItems:'center'}}>
              <Circular thickness={4} size={40}/>
            </div>
          )}
        </List>
      </ListContainer>
    </ListRoot>
  )
}

export default function SupportPages({meta,header}: IPages<Support>) {
  const {t:tCom} = useTranslation('common');
  const {t} = useTranslation('support');
  const setNotif = useNotif();
  const {user,ready} = useSelector<Pick<State,'user'|'ready'>>(s=>({user:s.user,ready:s.ready}));
  const router=useRouter();
  const {slug}=router.query

  const slugId = React.useMemo(()=>{
    if(slug && slug?.[0] === 'admin') return slug?.[1];
    else if(slug && slug?.[0] !== 'admin') return slug?.[0];
    return undefined;
  },[slug])

  const [title,setTitle]=React.useState(header?.title||"Support");
  const [selected,setSelected] = React.useState<string|undefined>(slugId ? slugId : undefined);
  const [search,setSearch]=React.useState<Support[]|null>(null);
  const [data,setData]=React.useState<Support[]>([]);
  const [isDrop,setIsDrop]=React.useState(false);
  const [image,setImage]=React.useState<File|undefined>(undefined);
  const {get} = useAPI()
  const [sudahHome,setSudahHome]=React.useState(false)
  const [chatLoading,setChatLoading]=React.useState(false)
  
  const admin = React.useMemo(()=>{
    if(slug && slug?.[0] === 'admin' && user) return true;
    return false;
  },[user,slug])

  const handleClickList=React.useCallback((id)=>{
    router.push('/support/[[...slug]]',`/support${admin ? '/admin':''}/${id}`,{shallow:true})
  },[admin])

  const handleSearch=React.useCallback((value?: string)=>{
    if(data.length > 0 && value && value.length > 0) {
        const filter = data.filter(item=>{
          return item?.subject?.toLowerCase().indexOf(value.toLowerCase()) > -1 || 
          (admin && item.name?.toLowerCase().indexOf(value.toLowerCase()) > -1) || 
          (admin && item.email?.toLowerCase().indexOf(value.toLowerCase()) > -1)
        });
        if(filter?.length > 0) {
          setSearch(filter)
        } else {
          setSearch([])
        }
    } else {
      setSearch(null)
    }
  },[data,admin])

  const handleDrag=React.useCallback((enter)=>(e: React.DragEvent<HTMLDivElement>)=>{
    e.preventDefault();
    if(selected!==null) {
      if(enter){
        setIsDrop(true)
      } else {
        setIsDrop(false)
      }
    }
  },[selected])

  const handleOnDrop=React.useCallback((e: React.DragEvent<HTMLDivElement>)=>{
    e.preventDefault();
    e.stopPropagation();
    if(e?.dataTransfer?.files.length === 1) setImage(e?.dataTransfer?.files?.[0]);
    else setImage(undefined)
    setIsDrop(false)
  },[])

  const changeStatus=React.useCallback((status: keyof Support,newstatus: any,id?: number)=>{
    if(!id) return;
    const i = data.findIndex(d=>d?.id == id);
    if(i > -1 && data?.[i]) {
      let a = [...data];
      a[i]={
        ...a[i],
        [status]:newstatus
      }
      setData(a);
    }
  },[data])

  const changeTitle=React.useCallback((subject?: string)=>{
    if(subject) {
      setTitle(`${subject} - Support`)
    } else {
      setTitle("Support")
    }
  },[])

  const getData=React.useCallback(async(page: number)=>{
    setChatLoading(true)
    try {
      const res = await get<Support,true>(`/supports?pageSize=50&page=${page||1}${admin ? '&admin=true' : ''}`);
      const a = data;
      const b = a.concat(res.data);
      b.sort((c,d)=>{
        const statusToIndex = {
          open:1,
          answered:2,
          ['customer-reply']: 3,
          close:0
        }
        return statusToIndex[c.status] - statusToIndex[d.status];
      })
      setData(b);
      setChatLoading(false)
      return res;
    } catch(e: any) {
      setChatLoading(false)
      setNotif(e?.error?.message||tCom("error_500"),true);
      return null;
    }
  },[get,tCom,admin,setNotif])

  React.useEffect(()=>{
    if(slugId && data.length > 0) {
      const filter = data.find(item=>{
        return `${item?.id}` == slugId
      })
      if(filter) {
        setSelected(`${filter?.id}`)
        changeTitle(filter?.subject)
      }
    } else {
      setSelected(undefined)
      changeTitle()
    }
    if(typeof slugId==='undefined') setSudahHome(true)
  },[slugId,data]);

  React.useEffect(()=>{
    if(data.length === 0 && ready) {
      if(user) {
        getData(1);
      } else if(meta) {
        setData([meta.data])
      }
    }
  },[user,data,meta,ready])

  const support=React.useMemo(()=>{
    if(selected!==null && data.length > 0) {
      const filter = data.find(d=>`${d?.id}` === selected);
      if(filter) return filter;
    }
    return undefined;
},[selected,data])

  return (
    <Header title={title}>
      <Dashboard withPadding={false} withDashboard={false} withNavbar={false} backToTop={{enabled:false}} whatsappWidget={{enabled:false}} sx={{pt:'92px'}}>
        <ParentRoot onDragEnter={handleDrag(true)}>
          <ParentRoot className={`image${isDrop ? ' show':''}`} onDragEnter={handleDrag(true)} onDragOver={(e)=>e.preventDefault()} onDragLeave={handleDrag(false)} onDrop={handleOnDrop} >
            <Typography variant='h4' component='h4'>{t('drop_images')}</Typography>
          </ParentRoot>

          <SupportList chatLoading={chatLoading} list={search!==null ? search : data} selected={selected} onClick={handleClickList} onSearch={handleSearch} getData={getData} admin={admin} />
          <SupportDetail homeReady={sudahHome} selected={data.length > 0 ? selected : undefined} initImage={image} support={support} changeStatus={changeStatus} admin={admin} />
        </ParentRoot>
      </Dashboard>
    </Header>
  )
}