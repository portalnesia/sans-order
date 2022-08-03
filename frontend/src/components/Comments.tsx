import React from 'react';
import {useDefaultSWR as useSWR} from '@utils/swr';
import { useSelector } from '@redux/store';
import { State,PortalnesiaUser } from '@redux/index';
import { Box, Stack, Typography, TextareaAutosize,styled, Divider, Collapse, Portal, Grid, TextField } from '@mui/material';
import { href, photoUrl, portalUrl } from '@utils/Main';
import portalnesia, { useAPI } from '@utils/api';
import useNotification from '@utils/notification';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic'
import Avatar from './Avatar';
import Image from './Image';
import Button from './Button';
import { Circular } from './Loading';
import Iconify from './Iconify';
import Select,{SelectItem} from './Select';
import { useRouter } from 'next/router';
import SessionStorage from '@utils/session-storage';

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))

const TextArea = styled(TextareaAutosize)(({theme})=>({
  width:'100%',
  height:'100%',
  margin:'0',
  padding:8,
  boxSizing:'border-box',
  resize:'none',
  boxShadow:'none',
  outline:'none',
  background:'transparent',
  color:theme.palette.text.primary,
  cursor:'auto',
  border:`1px solid ${theme.palette.text.primary}`,
  borderRadius:8,
  fontFamily:'"Inter var",Inter,-apple-system,BlinkMacSystemFont,"Helvetica Neue","Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,Droid Sans,Fira Sans,sans-serif',
  '&:hover':{
    border:`1px solid ${theme.palette.primary.darker}`,
  },
  '&:active, &:focus':{
    border:`1px solid ${theme.palette.primary.main}`,
  },
  '@media (hover: hover) and (pointer: fine)':{
    '&::-webkit-scrollbar':{
      width:'.4em',
      borderRadius:4
    },
    '&::-webkit-scrollbar-thumb':{
      background:theme.palette.background.default,
      borderRadius:4
    },
  },
  '&::placeholder':{
    color:theme.palette.mode==='dark' ? theme.palette.grey[400] : theme.palette.grey[100]
  },
}))

export interface CommentsProps {
  /**
   * Content type
   * @example api::blog.blog
   */
  type: string
  /**
   * Content ID
   */
  id: string|number
}

type BaseCommentModel = {
  id: number,
  content: string,
  blocked: boolean|null,
  blockedThread: boolean,
  blockReason: any,
  authorUser: any,
  removed: boolean|null,
  approvalStatus: null | "APPROVED", // Only in case of enabled approval flow. Default: null
  author: {
    id: string|number, // For Strapi users id reflects to the format used by your Strapi
    name: string, // For Strapi users it is equal to 'username' field
    username: string,
    email: string,
    picture: string | null
  },
  createdAt: Date,
  updatedAt: Date,
  related: any // Related content type entity
  reports: any[] // Reports issued against this comment
}

type CommentModel = BaseCommentModel & ({
  children?: BaseCommentModel[]
})

const CommentAvatar = ({user}: {user: {name: string,picture: string|null}})=>(
  <Avatar alt={user.name} sx={{height:32,width:32}} {...(user.picture ? {
    children: <Image alt={user.name} src={photoUrl(user.picture)} style={{width:32,height:32}} />
  } : {
    children:user.name
  })} />
)

const CustomNoComment = ()=>{
  const {t} = useTranslation('common')
  return (
    <Box height={100} display='flex' alignItems='center' justifyContent={'center'}>
      <Typography variant='h6' component='h6'>{t('no_comment')}</Typography>
    </Box>
  )
}

function CommentInput({user,onSubmit,disabled,loading,reply}: {reply?:boolean,disabled?:boolean,loading?: boolean,user: PortalnesiaUser,onSubmit?(input: string): Promise<void>}) {
  const {t} = useTranslation('common')
  const [input,setInput] = React.useState('');

  const handleSubmit=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    e?.preventDefault();
    if(onSubmit) {
      await onSubmit(input);
      setInput('');
    }
  },[input,onSubmit])

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction='row' spacing={1} alignItems='flex-start'>
        <CommentAvatar user={user} />
        <TextArea
          required
          placeholder={t(reply ? 'type_comment_reply' : 'type_comment')}
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          minRows={2}
          maxRows={6}
          sx={{
            flexGrow:1
          }}
          disabled={!!disabled}
        />
        <Button type='submit' disabled={!!disabled} loading={!!loading}>{t(reply ? 'reply' : 'send')}</Button>
      </Stack>
    </form>
  )
}

function CommentInputNotLogedIn() {
  const {t} = useTranslation('common')
  const {t:tMenu} = useTranslation('menu')

  const router = useRouter();
  const login = React.useCallback(()=>{
    const {pathname,query,asPath} = router;
    SessionStorage.set('auth',{pathname,query,asPath})
    const url = portalnesia.getAuthUrl()
    window.location.href = url;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[router.asPath,router.pathname,router.query])

  return (
    <Stack sx={{px:1}} direction='row' spacing={2} alignItems='center' justifyContent='space-between'>
      <Typography>{t('login_comment')}</Typography>
      <Button onClick={login} sx={{mt:3,backgroundColor:'#2f6f4e !important'}} size="large" startIcon={<Image alt='Login' src="/portalnesia-icon/android-icon-48x48.png" width={25} />}>{tMenu("signin")}</Button>
    </Stack>
  )
}

type ICommentSection = {
  item: CommentModel,
  disabled?:boolean,
  loading?: boolean,
  user: State['user'],
  onSubmit(input: string): Promise<void>,
  onDelete: () => Promise<void>
  onReport: (item: CommentModel) => () => void
}
function CommentSection({item,disabled,loading,user,onSubmit,onDelete,onReport}: ICommentSection) {
  const {t} = useTranslation('common')
  const {t:tReport} = useTranslation('report')
  const [showReply,setShowReply] = React.useState(false)

  const handleReply = React.useCallback((e: React.MouseEvent<HTMLButtonElement>)=>{
    setShowReply(a=>!a);
  },[setShowReply])

  const handleSubmit = React.useCallback(async(input: string)=>{
    await onSubmit(input);
    setShowReply(false);
  },[onSubmit])

  return (
    <>
      <Stack direction='row' spacing={2} alignItems='flex-start'>
        <Box mt={1}>
          <CommentAvatar user={item.author} />
        </Box>
        <Box>
          <a href={portalUrl(`user/${item.author.username}`)} target='_blank' rel='noreferrer noopener'><Typography>{item.author.name}</Typography></a>
          <Typography variant='body2' {...(item.blocked ? {sx:{fontStyle:'italic',color:t=>t.palette.action.disabled}} : {})}>{item.blocked ? t('comment_blocked') : item.content}</Typography>

          <Stack sx={{mt:1}} direction='row' spacing={1} alignItems='center'>
            {!item.blocked && <Button sx={{fontSize:12,fontWeight:'normal'}} size='small' color='inherit' text onClick={onReport(item)} startIcon={<Iconify icon={'ic:round-report-problem'} width={15} height={15} />}>{tReport('report')}</Button> }
            
            {(user && !item.blocked) && <Button sx={{fontSize:12,fontWeight:'normal'}} size='small' color='inherit' text onClick={handleReply} startIcon={<Iconify icon={'fluent:arrow-reply-16-filled'} width={15} height={15} />}>{t('reply')}</Button> }
            
            {(user && (user.id === item.author.id || user.admin)) && <Button sx={{fontSize:12,fontWeight:'normal'}} size='small' color='error' text onClick={onDelete} startIcon={<Iconify icon={'fluent:delete-12-filled'} width={15} height={15} />}>{t('del')}</Button>}
          </Stack>
        </Box>
      </Stack>
      {user && (
        <>
          <Collapse in={showReply} unmountOnExit>
            <Box ml={6} py={2}>
              <CommentInput reply onSubmit={handleSubmit} disabled={disabled} loading={loading} user={user} />
            </Box>
          </Collapse>
        </>
      )}
    </>
  )
}

type ICommentContainer = {
  onSubmit: (loadingType: string, replyId?: number) => (input: string) => Promise<void>
  item: CommentModel,
  loading: string|null,
  user: State['user'],
  onDelete: (item: CommentModel, parentId?: number) => () => Promise<void>
  onReport: (item: CommentModel) => () => void
}
function CommentContainer({onSubmit,item,loading,user,onDelete,onReport}: ICommentContainer) {
  const {t} = useTranslation('common')
  const [show,setShow] = React.useState(false);

  const showReply = React.useCallback((e: React.MouseEvent<HTMLAnchorElement>)=>{
    e.preventDefault();
    setShow(a=>!a);
  },[setShow])

  return (
    <>
      <CommentSection onReport={onReport} item={item} onSubmit={onSubmit(`reply-${item.id}`,item.id)} onDelete={onDelete(item)} loading={loading===`reply-${item.id}`} disabled={loading!==null} user={user} />
    
      {(item?.children && item?.children?.length > 0) && (
        <Box ml={6}>
          <a href='#' className='underline' onClick={showReply}><Typography sx={{textAlign:'center',fontSize:13}} variant='body2' component='p'>{show ? t('hide_reply') : t('show_reply',{count:item.children?.length})}</Typography></a>
          <Collapse in={show} unmountOnExit>
            <Box>
              {item.children?.map(dd=>(
                <CommentSection key={dd.id} onReport={onReport} item={dd} onSubmit={onSubmit(`reply-${dd.id}`,item.id)} onDelete={onDelete(dd,item.id)} loading={loading===`reply-${dd.id}`} disabled={loading!==null} user={user} />
              ))}
            </Box>
          </Collapse>
        </Box>
      )}
    </>
  )
}

const REPORT_REASON = ['BAD_WORDS','DISCRIMINATION','OTHER'];

export default function Comments({type,id}: CommentsProps) {
  const {t:tCom} = useTranslation('common')
  const {t:tReport} = useTranslation('report')
  const user = useSelector<State['user']>(s=>s.user);
  const {data,error,mutate} = useSWR<CommentModel[]>(`/comments/${type}:${id}`);
  const {post,del} = useAPI();
  const [loading,setLoading] = React.useState<string|null>(null)
  const setNotif = useNotification();
  const [dialog,setDialog] = React.useState<{item: CommentModel,parentId?: number}|null>(null);
  const [iReport,setIReport] = React.useState<{reason:string|null,content:string}>({reason:null,content:''})
  const [dReport,setDReport] = React.useState<CommentModel|null>(null);

  const onSubmit = React.useCallback((loadingType:string,replyId?:number)=>async(input: string)=>{
    if(!user) return;
    setLoading(loadingType);
    try {
      const postData = {
        content:input,
        ...(replyId ? {threadOf:replyId} : {})
      }

      const results = [...(data||[])];

      if(!replyId) {
        const res = await post(`/comments/${type}:${id}`,postData,undefined,false) as unknown as CommentModel;
        results.unshift(res);
      } else {
        const index = results.findIndex(r=>r.id === replyId);
        if(index < 0) return setNotif(tCom('comment_not_available'),true);
        const reply = results[index];

        const res = await post(`/comments/${type}:${id}`,postData,undefined,false) as unknown as CommentModel;
        if(reply.children) {
          reply.children.unshift(res);
        } else {
          reply.children = [res];
        }
      }
      mutate(results);
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error_500"),true);
    } finally {
      setLoading(null)
    }
  },[post,setNotif,tCom,type,id,data,mutate,user])

  const onDelete=React.useCallback((item: CommentModel,parentId?: number)=>async()=>{
    if(!user || user.id !== item.author.id) return;
    setDialog({item,parentId});
  },[user])

  const handleDelete=React.useCallback(async()=>{
    if(dialog) {
      if(!user || user.id !== dialog.item.author.id) return;
      setLoading('delete');
      try {
        await del(`/comments/${type}:${id}/comment/${dialog.item.id}?authorId=${dialog.item.author.id}`);

        const results = [...(data||[])];
        if(dialog.parentId) {
          const index = results.findIndex(r=>r.id === dialog.parentId);
          if(index > -1) {
            const child = results[index];
            if(child.children) {
              const i = child.children?.findIndex(d=>d.id === dialog.item.id)
              if(i > -1) {
                child.children.splice(i,1);
                results[index].children = child.children;
              }
            }
          }
        } else {
          const index = results.findIndex(r=>r.id === dialog.item.id);
          if(index > -1) results.splice(index,1);
        }
        mutate(results);
        setDialog(null);
      } catch(e: any) {
        setNotif(e?.error?.message||tCom("error_500"),true);
      } finally {
        setLoading(null)
      }
    }
  },[del,setNotif,tCom,type,id,data,mutate,dialog,user])

  const onReport = React.useCallback((item: CommentModel)=>()=>{
    setDReport(item);
  },[])

  const handleReport = React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    e?.preventDefault();
    if(!dReport) return;
    setLoading('report');

    try {
      await post(`/comments/${type}:${id}/comment/${dReport.id}/report-abuse`,iReport,undefined,false);

      setNotif(tReport('response_report'),false);
      setDReport(null);
      setIReport({reason:null,content:''});
    }  catch(e: any) {
      setNotif(e?.error?.message||tCom("error_500"),true);
    } finally {
      setLoading(null)
    }
  },[dReport,iReport,post,setNotif,tCom,tReport,type,id])

  React.useEffect(()=>{
    console.log(user)
  },[user])

  return (
    <Box>
      <Box>
        <Typography variant='h4' component='h4'>{data ? tCom('count_comments',{count:data.length}) : undefined}</Typography>
      </Box>

      <Divider />
      
      <Box mt={2} py={2} px={1} borderRadius={1} sx={{background:t=>t.palette.background.paper}}>
        {user ? <CommentInput onSubmit={onSubmit('comment')} loading={loading==='comment'} disabled={loading!==null} user={user} /> : <CommentInputNotLogedIn />}
      </Box>

      <Box>
        {typeof data === 'undefined' && !error ? (
          <Box height={300} display='flex' alignItems='center' justifyContent={'center'}>
            <Circular />
          </Box>
        ) : error ? (
          <Box height={300} display='flex' alignItems='center' justifyContent={'center'}>
            <Typography>{error?.error?.message||tCom('error_500')}</Typography>
          </Box>
        ) : data?.length === 0 ? (
          <CustomNoComment />
        ) : (
          <Box py={2} px={1} mt={2}>
            {data?.map((d)=>(
              <CommentContainer onReport={onReport} key={`comment-${d.id}`} item={d} onSubmit={onSubmit} onDelete={onDelete} loading={loading} user={user} />  
            ))}
          </Box>
        )}
      </Box>
      <Portal>
        <Dialog open={dialog!==null} onClose={()=>loading === null && setDialog(null)}>
          <DialogTitle>{tCom('are_you_sure')}</DialogTitle>
          <DialogContent>
            <Typography>{tCom('dialog_comment_delete')}</Typography>
          </DialogContent>
          <DialogActions>
            <Button text color='inherit' disabled={loading !== null} onClick={()=>loading === null && setDialog(null)}>{tCom('cancel')}</Button>
            <Button text color='error' disabled={loading !== null} loading={loading==='delete'} onClick={handleDelete}>{tCom('del')}</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={dReport!==null} onClose={()=>loading === null && setDReport(null)}>
          <form onSubmit={handleReport}>
            <DialogTitle>{tReport('report')}</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography>{`${tCom('comment')}: ${dReport?.content}`}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Select
                    value={iReport.reason}
                    onChange={e=>setIReport({...iReport,reason:e.target.value})}
                    required
                    disabled={loading!==null}
                    fullWidth
                    label={tReport('reason')}
                  >
                    {REPORT_REASON.map(r=>(
                      <SelectItem key={r} value={r}>{tReport(r.toLowerCase())}</SelectItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    value={iReport.content}
                    onChange={e=>setIReport({...iReport,content:e.target.value})}
                    disabled={loading!==null}
                    fullWidth
                    label="Detail"
                    placeholder={tReport('content_report')}
                    minRows={2}
                    maxRows={5}
                    multiline
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button text color='inherit' disabled={loading !== null} onClick={()=>loading === null && setDReport(null)}>{tCom('cancel')}</Button>
              <Button disabled={loading !== null} loading={loading==='report'} type='submit'>{tCom('send')}</Button>
            </DialogActions>
          </form>
        </Dialog>
      </Portal>
    </Box>
  )
}