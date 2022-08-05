import React from 'react'
import useNotif from '@utils/notification'
import {useAPI} from '@utils/api'
import {File} from '@type/index'
import {nanoid,number_size} from '@portalnesia/utils'
import {Portal,DialogProps,Typography,Box} from '@mui/material'
import {styled,alpha,useTheme} from '@mui/material/styles'
import {useRouter} from 'next/router'
import {ProgressLinear} from '@comp/Backdrop'
import useSWR from '@utils/swr'
import useMediaQuery from '@mui/material/useMediaQuery'
import dynamic from 'next/dynamic'
import Pagination,{usePagination} from '@comp/Pagination'
import { getDayJs } from '@utils/Main'
import { useTranslation } from 'next-i18next'

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const IconButton=dynamic(()=>import('@mui/material/IconButton'))
const CloseIcon = dynamic(()=>import('@mui/icons-material/Close'))
const GridView = dynamic(()=>import('@mui/icons-material/GridView'))
const ViewList = dynamic(()=>import('@mui/icons-material/ViewList'))
const DeleteIcon = dynamic(()=>import('@mui/icons-material/Delete'))
const AddPhotoIcon = dynamic(()=>import('@mui/icons-material/AddAPhoto'))
const Image=dynamic(()=>import('@comp/Image'))
const CardActionArea=dynamic(()=>import('@mui/material/CardActionArea'));
const List=dynamic(()=>import('@mui/material/List'));
const ListItemIcon=dynamic(()=>import('@mui/material/ListItemIcon'));
const ListItemButton=dynamic(()=>import('@mui/material/ListItemButton'));
const ListItemAvatar=dynamic(()=>import('@mui/material/ListItemAvatar'));
const ListItemText=dynamic(()=>import('@mui/material/ListItemText'));
const Divider=dynamic(()=>import('@mui/material/Divider'));
const Menu=dynamic(()=>import('@comp/MenuPopover'));
const MenuItem=dynamic(()=>import('@mui/material/MenuItem'));
const TextField=dynamic(()=>import('@mui/material/TextField'))
const Paper=dynamic(()=>import('@mui/material/Paper'))
//const Skeleton=dynamic(()=>import('portal/components/Skeleton'));
// @ts-ignore
const Circular = dynamic(()=>import('@comp/Loading').then(m=>m.Circular));
const Button = dynamic(()=>import('@comp/Button'));
const Backdrop = dynamic(()=>import('@comp/Backdrop'));
const ImageList = dynamic(()=>import('@mui/material/ImageList'))
const ImageListItem = dynamic(()=>import('@mui/material/ImageListItem'))
const ImageListItemBar = dynamic(()=>import('@mui/material/ImageListItemBar'))

type FilesWithIdx = File & ({
    index: number
    action?: 'left_click'|'right_click'
})

export interface BrowserProps extends DialogProps {
    onSelected(fileUrl: File): void
    onDeleted(file: File): void
}

const Dialogs = styled(Dialog)(()=>({
    '& .MuiDialog-container,.MuiDialog-root,.MuiDialog-paper':{
        overflowY:'visible'
    }
}))

const CardAction = styled(CardActionArea)<{selected?: boolean}>(({theme,selected})=>({
    position:'relative'
}))
const SelectedArea = styled('div')<{selected?: boolean}>(({theme,selected})=>({
    ...(selected ? {
        position:'absolute',
        left:0,
        top:0,
        width:'100%',
        height:'100%',
        zIndex:5,
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity+0.4)
    } : {})
}))

const TF = styled(TextField)(()=>({
    '.MuiSelect-select, .MuiNativeSelect-select':{
        padding:'3.7px 9px',
    }
}))

const DivUpload = styled('div')(({theme})=>({
    [theme.breakpoints.down('sm')]: {
        paddingLeft:theme.spacing(2),
        paddingRight:theme.spacing(2)
    },
    [theme.breakpoints.up('sm')]: {
        paddingLeft:theme.spacing(3),
        paddingRight:theme.spacing(3)
    },
    paddingTop:theme.spacing(3),
    paddingBottom:theme.spacing(3)
}))

const Input = styled('div')<{isHover: boolean}>(({theme,isHover})=>({
    textAlign:'center',
    border:`1px dashed ${theme.palette.divider}`,
    padding:0,
    position:'relative',
    borderRadius:'.375rem',
    willChange:'border-color,background',
    transition:'border-color 250ms ease-in-out,background 250ms ease-in-out',
    '&:hover':{
        background:theme.palette.action.hover,
    },
    '& label':{
        padding:'4.75rem 15px',
        cursor:'pointer',
        display:'inline-block',
        width:'100%',
        fontSize:'1.2rem',
        fontWeight:600,
    },
    ...(isHover ? {
        background:theme.palette.action.hover
    } : {})
}))

const Sticky=styled('div')<{notSticky?:boolean}>(({theme,notSticky})=>({
    paddingLeft:24,
    paddingRight:24,
    ...(!notSticky ? {
        position:'sticky',
        top:0,
        zIndex:2,
        paddingTop:10,
        paddingBottom:10,
        backgroundColor:theme.palette.background.paper
    } : {
        paddingTop:5,
        paddingBottom:5
    })
}))

const getLicense = (props: any)=><a {...props} target='_blank' rel='nofollow noopener noreferrer' />

function BrowserComp(props: BrowserProps) {
    const theme = useTheme();
    const {t:tCom} = useTranslation('common')
    const {del,upload} = useAPI();
    const {onSelected,open,scroll='body',maxWidth='md',fullWidth=true,onClose,onDeleted} = props;
    const setNotif = useNotif();
    const router = useRouter();
    const {toko_id} = router.query;
    const [page,setPage] = usePagination()
    const [anchorEl,setAnchorEl]=React.useState<[number,number]|null>(null)
    const [menu,setMenu] = React.useState(false);
    const [selected,setSelected] = React.useState<FilesWithIdx|undefined|'upload'>();
    const [isHover,setIsHover]=React.useState(false)
    const [labelText,setLabelText] = React.useState("Drag files or click here to upload");
    const [progressUpload,setProgressUpload] = React.useState(0)
    const [disabled,setDisabled] = React.useState<null|string>(null);
    const [dialog,setDialog] = React.useState(false);
    const [isGrid,setGrid] = React.useState(true);
    const [serverType,setServerType] = React.useState<'unsplash'|'pixabay'|null>(null);
    const {data,error,mutate} = useSWR<File,true>(open ? `/upload/files/${toko_id}?pageSize=30&page=${page||1}` : null);
    const idScroll = React.useRef(nanoid());
    const smDown = useMediaQuery(theme.breakpoints.down('sm'));
    const mdDown = useMediaQuery(theme.breakpoints.between('sm','md'));
    const lgUp = useMediaQuery(theme.breakpoints.up('lg'));

    const cols = React.useMemo(()=>{
        if(smDown) return 2;
        else if(mdDown) return 3;
        else if(lgUp) return 4;
    },[smDown,mdDown,lgUp])

    const handleClose=React.useCallback(()=>{
        setDisabled(null);
        setPage({},1);
        setServerType(null)
        if(onClose) onClose({},'backdropClick');
    },[onClose,setPage])

    const handleSelect=React.useCallback((dt: FilesWithIdx)=>()=>{
        if(disabled !== null) return;
        handleClose();
        const {index:_,action:_a,...rest} = dt;
        if(onSelected) onSelected(rest);
    },[handleClose,onSelected,disabled])

    const onRightClick = React.useCallback((dt: File,index: number)=>(event: React.MouseEvent<HTMLButtonElement|HTMLDivElement>)=>{
        event.stopPropagation()
        event.preventDefault()
        setSelected({...dt,index,action:'right_click'})
        setMenu(true)
        setAnchorEl([event.clientX - 2,event.clientY - 4]);
    },[])

    const handleContextClose = React.useCallback(()=>{
        setSelected(undefined)
        setMenu(false)
        setAnchorEl(null)
    },[])

    const handleClick=React.useCallback((dt: File,index: number)=>()=>{
        if(disabled !== null) return;
        if(selected === undefined || selected === 'upload') {
            setSelected({...dt,index,action:'left_click'})
        } else {
            if(selected.id === dt.id) setSelected(undefined)
            else setSelected({...dt,index,action:'left_click'})
        }
    },[disabled,selected])

    const handleUpload = React.useCallback((e: React.DragEvent<HTMLDivElement>|React.ChangeEvent<HTMLInputElement>)=>{
        setLabelText("Drag files or click here to upload")
        setIsHover(false)
        if(disabled !== null || serverType !== null) return;
        const file = (typeof e?.target !== 'undefined' && typeof (e?.target as HTMLInputElement)?.files !== 'undefined') ? (e?.target as HTMLInputElement)?.files?.[0] : (typeof (e as React.DragEvent<HTMLDivElement>)?.dataTransfer !== 'undefined' ? (e as React.DragEvent<HTMLDivElement>)?.dataTransfer?.files?.[0] : undefined);
        if(file) {
            if(/image\/(jpg|jpeg|png)/.test(file.type)) {
                setDisabled('upload')
                if(Number(file.size) > 5242880) return setNotif("Sorry, your file is too large. Maximum images size is 5 MB",true);
                const form=new FormData();
                form.append('files',file);
                const opt = {
                    headers:{
                        'Content-Type':'multipart/form-data'
                    },
                    onUploadProgress:(progEvent: any)=>{
                        const complete=Math.round((progEvent.loaded * 100) / progEvent.total);
                        setProgressUpload(complete)
                    }
                }
                upload<File,FormData>(`/upload/${toko_id}`,form,opt)
                .then(()=>{
                  setSelected(undefined);
                  setPage({},1);
                  mutate();
                }).catch(e=>{
                  setNotif(e?.error?.message||tCom("error_500"),true);
                }).finally(()=>{
                  setProgressUpload(0)
                  setDisabled(null)
                })
            } else {
                setNotif("Error: File type not allowed",true);
            }
        }
    },[setNotif,upload,disabled,mutate,tCom,serverType,setPage,toko_id])

    const handleDrag=React.useCallback((enter: boolean)=>(e: React.DragEvent<HTMLDivElement>)=>{
        e.preventDefault();
        if(disabled !== null) return;
        if(enter){
            setLabelText("Drop your files now")
            setIsHover(true)
        } else {
            setLabelText("Drag files or click here to upload")
            setIsHover(false)
        }
    },[disabled])

    const handleDrop=React.useCallback((e: React.DragEvent<HTMLDivElement>)=>{
        e.preventDefault();
        e.stopPropagation();
        if(disabled !== null) return;
        handleUpload(e)
    },[handleUpload,disabled])

    const handleDelete=React.useCallback((dt: FilesWithIdx)=>()=>{
        if(disabled !== null || !data || serverType !== null) return;
        setDisabled('delete');
        del<File>(`/upload/files/${toko_id}/${dt?.id}`)
        .then((result)=>{
            if(!data) return;
            setSelected(undefined)
            //const a = [...data];
            const a = [...data.data]
            a.splice(dt.index,1);
            mutate({
                ...data,
                data:a
            })
            if(onDeleted) onDeleted(result.data)
            //setData(a);
        }).catch(()=>{

        }).finally(()=>{
            setDisabled(null);
        })
    },[del,disabled,data,mutate,serverType,toko_id,onDeleted])

    React.useEffect(()=>{
        if(open) {
            if(typeof router.query.i === 'undefined') {
                const query = {...router.query}
                if(typeof query.reloadedPage !== 'undefined') delete query.reloadedPage;
                const asss=router.asPath.match(/\&i\=.+?(?=\&)/) ? router.asPath.replace(/\&i\=.+?(?=\&)/gi,"") : router.asPath.match(/\&/) ? router.asPath.replace(/\?i\=.+?(?=\&)/gi,"").replace(/\&i\=.+/gi,"") : router.asPath.replace(/\?i\=.+/gi,"").replace(/\&i\=.+/gi,"")
                const asPath=(asss.match(/\?/) ? `${asss}&i=file-manager` : `${asss}?i=file-manager`)
                const newQ={
                    pathname:router.pathname,
                    query:{...query,i:'file-manager'}
                }
                router.push(newQ,asPath,{shallow:true})
            }
        } else {
            setSelected(undefined)
            if(typeof router.query.i !== 'undefined') router.back();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[open])

    return (
        <Portal>
            {open && (
                <React.Fragment>
                    <Dialogs classes={{scrollBody:`file-manager-${idScroll.current}`}} open={true} scroll={scroll} maxWidth={maxWidth} fullWidth={fullWidth}>
                        <DialogTitle>
                            <div className='flex-header'>
                                <Typography component='h2' variant='h6'>File Manager</Typography>
                                <IconButton onClick={handleClose} size="large">
                                    <CloseIcon />
                                </IconButton>
                            </div>
                        </DialogTitle>
                        <Divider />
                        <Sticky>
                            <div className='flex-header'>
                                <Box display={{xs:'block',sm:'flex'}}>
                                    <Button outlined sx={{mr:1}} disabled={disabled !== null} icon='upload' onClick={()=>setSelected('upload')}>Upload</Button>
                                    {(selected && selected !== 'upload' && selected?.action === 'left_click') && (
                                        <Box display='flex' mt={{xs:1,sm:0}}>
                                            <Button disabled={disabled !== null} sx={{ml:{xs:0,sm:1}}} onClick={handleSelect(selected)} icon='addphoto'>Use image</Button>
                                            <Button disabled={disabled !== null} sx={{ml:1}} loading={disabled==='delete'} color='error' icon='delete'  onClick={()=>setDialog(true)}>Delete</Button>
                                        </Box>
                                    )}
                                </Box>
                                
                                <IconButton
                                    edge="end"
                                    aria-label='view'
                                    onClick={()=>setGrid(!isGrid)}
                                >
                                    {isGrid ? <ViewList /> : <GridView />}
                                </IconButton>
                            </div>
                        </Sticky>
                        <DialogContent dividers sx={{zIndex:1}}>
                        {!data && !error ? (
                            <Circular />
                        ) : error ? (
                            <div style={{textAlign:'center'}}>
                                <Typography variant="body2">{error}</Typography>
                            </div>
                        ) : (data && data?.data?.length > 0) ? (
                            <>
                                {isGrid ? (
                                    <ImageList variant='masonry' cols={cols} gap={4}>
                                        {data?.data?.map((dt,i)=>(
                                            <ImageListItem key={`portalnesia-${i}`}>
                                                <CardAction title={dt?.name} disabled={disabled !== null} onClick={handleClick(dt,i)} onContextMenu={onRightClick(dt,i)}>
                                                    <SelectedArea selected={typeof selected === 'object' && selected.index === i} />
                                                    <Image src={dt.url} alt={dt.name} style={{width:200,height:'auto'}}/>
                                                    <ImageListItemBar
                                                        title={dt?.name}
                                                        subtitle={getDayJs(dt?.createdAt).pn_format('full')}
                                                    />
                                                </CardAction>
                                            </ImageListItem>
                                        ))}
                                    </ImageList>
                                ) : (
                                    <List>
                                        {data.data.map((dt,i)=>(
                                            <ListItemButton key={`data-list-${dt.id}-${i}`} selected={typeof selected === 'object' && selected.index === i} disabled={disabled !== null} onClick={handleClick(dt,i)} onContextMenu={onRightClick(dt,i)}>
                                                <ListItemAvatar>
                                                    <Image src={dt.url} alt={dt.name} width={40} height={40} />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={<Typography variant='body1'>{dt?.name}</Typography>}
                                                    secondary={
                                                        <React.Fragment>
                                                            <Typography sx={{fontSize:'.7rem'}} variant='body2'>{number_size(dt?.size)}</Typography>
                                                            <Typography sx={{fontSize:'.7rem'}} variant='body2'>{getDayJs(dt?.createdAt).pn_format('full')}</Typography>
                                                        </React.Fragment>
                                                    }
                                                />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                )}
                            </>
                        ) : null}
                        <Menu
                            anchorReference="anchorPosition"
                            anchorPosition={
                                anchorEl !== null ? { top: anchorEl[1], left: anchorEl[0] } : undefined
                            }
                            open={menu && typeof selected === 'object'}
                            onClose={handleContextClose}
                        >
                            <MenuItem onClick={handleSelect(selected as FilesWithIdx)}>
                                <ListItemIcon><AddPhotoIcon /></ListItemIcon>
                                <ListItemText>Use image</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={()=>{handleContextClose(),setDialog(true)}}>
                                <ListItemIcon sx={{color:'error.main'}}><DeleteIcon /></ListItemIcon>
                                <ListItemText sx={{color:'error.main'}}>Delete</ListItemText>
                            </MenuItem>
                        </Menu>
                        </DialogContent>

                        <DialogActions>
                            <Pagination count={Number(data?.meta.pagination.pageCount||1)} page={Number(page||1)} onChange={setPage} />
                        </DialogActions>
                    </Dialogs>

                    <Dialog open={dialog && typeof selected === 'object'} scroll={'body'} maxWidth={'sm'} fullWidth>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogContent dividers>
                            <Typography>{`Delete ${(selected as FilesWithIdx)?.name}`}</Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button text disabled={disabled!==null} sx={{mr:1}} onClick={()=>setDialog(false)}>Cancel</Button>
                            <Button icon='delete' disabled={disabled!==null} loading={disabled==='delete'} onClick={handleDelete(selected as FilesWithIdx)}>Yes</Button>
                        </DialogActions>
                    </Dialog>

                    <Backdrop open={selected==='upload'} loading={false} textColor='theme'>
                        <Paper>
                            <DivUpload sx={{pb:1}}>
                                <Box className='flex-header'>
                                    <Box>
                                        <Typography variant='h4' component='h4'>UPLOAD</Typography>
                                    </Box>
                                    <Box>
                                        <IconButton onClick={()=>setSelected(undefined)} size="large">
                                            <CloseIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </DivUpload>
                            <DivUpload>
                                <Box sx={{backgroundColor:'background.default'}}>
                                    <Input 
                                        isHover={isHover}
                                        onDragEnter={handleDrag(true)}
                                        onDragLeave={handleDrag(false)}
                                        onDragOver={e=>e.preventDefault()}
                                        onDrop={handleDrop}
                                    >
                                        <input disabled={disabled !== null} type="file" accept="image/*" id="fileInput" style={{display:'none'}} onChange={handleUpload} />
                                        <label htmlFor="fileInput">{labelText}</label>
                                    </Input>
                                </Box>
                            </DivUpload>
                            {progressUpload > 0 && (
                                <React.Fragment>
                                    <Divider sx={{mt:1,mb:1}} />
                                    <ProgressLinear progress={progressUpload} textColor="theme" />
                                </React.Fragment>
                            )}
                        </Paper>
                    </Backdrop>
                </React.Fragment>
            )}
        </Portal>
    )
}

const Browser = React.memo(BrowserComp);
export default Browser;