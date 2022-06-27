// material
import { Box, Grid, Container, Typography,Checkbox,Divider,IconButton,TextField, FormGroup,FormLabel, FormControlLabel, Switch,Table,TableHead,TableRow,TableBody,TableCell,TablePagination,CircularProgress,Stack,MenuItem,ListItemIcon,ListItemText, Card } from '@mui/material';
// components
import {DatePicker,LocalizationProvider, TimePicker} from '@mui/lab'
import AdapterDayjs from '@mui/lab/AdapterDayjs'
import Header from '@comp/Header';
import Dashboard from '@layout/dashboard/index'
import React from 'react'
import useNotif from '@utils/notification'
import {useAPI} from '@utils/portalnesia'
import Recaptcha from '@comp/Recaptcha'
import Button from '@comp/Button'
import Backdrop from '@comp/Backdrop'
import Image from '@comp/Image'
import Popover from '@comp/Popover'
import {IDay, IOutlet,IPages,IUserAccess,ResponsePagination,TokoUsers, userAccess} from '@type/index'
import wrapper from '@redux/store'
import {TFunction, useTranslation} from 'next-i18next';
import useSWR from '@utils/swr';
import { useRouter } from 'next/router';
import Iconify from '@comp/Iconify';
import MenuPopover from '@comp/MenuPopover'
import useOutlet from '@utils/useOutlet'
import Scrollbar from '@comp/Scrollbar'
import usePagination from '@comp/TablePagination'
import Avatar from '@comp/Avatar'
import Label from '@comp/Label'
import dynamic from 'next/dynamic'
import { isEmptyObj, ucwords } from '@portalnesia/utils';
import { useMousetrap } from '@utils/useKeys';
import { Dayjs } from 'dayjs';
import { getOutletAccess, getDayJs, getDayList, getUserAccess } from '@utils/Main';
import { Circular } from '@comp/Loading';

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const SimpleMDE = dynamic(()=>import('@comp/SimpleMDE'))

export const getServerSideProps = wrapper(async({checkOutlet,params,redirect})=>{
  const slug = params?.slug;
  if(typeof slug?.[0] === 'string' && !['outlet','team'].includes(slug?.[0])) {
    return redirect();
  }
  if(slug?.[0] === 'outlet') {
    return await checkOutlet({onlyAccess:['outlet']},'dash_setting');
  } else {
    return await checkOutlet({onlyAccess:['outlet','users']},'dash_setting');
  }
})

type DayTimeProps = {
  open: boolean,
  onClose:(name:IDay,save?: boolean)=>()=>void,
  days: Record<IDay,string>
  k: IDay,
  onChecked: (name: IDay)=>(e: React.ChangeEvent<HTMLInputElement>)=>void,
  loading: string|null
  tempHour: [Dayjs,Dayjs],
  value: IOutlet['business_hour']
  onTimeChange:(name:IDay,type:'from'|'to')=>(value: any)=>void;
}

function DayTime({open,onClose,onChecked,k,days,loading,tempHour,value,onTimeChange}: DayTimeProps) {
  const {t:tCom} = useTranslation('common')
  const ref = React.useRef(null)
  return (
    <>
      <FormControlLabel
        ref={ref}
        label={
          <>
            <Typography noWrap>{days[k as IDay]}</Typography>
            {value?.[k] ? (
              <Typography noWrap variant='caption'>{`${getDayJs(value[k][0]).pn_format('time')} - ${getDayJs(value[k][1]).pn_format('time')}`}</Typography>
            ) : null}
          </>
        }
        control={<Checkbox disabled={loading!==null} checked={(!!value?.[k])} color="primary" onChange={onChecked(k as IDay)} />}
      />
      <MenuPopover open={open} onClose={onClose(k)} paperSx={{width:350}} anchorEl={ref.current}>
        <Box p={2}>
          <Stack direction='row' alignItems='center' justifyContent={'space-evenly'} spacing={4} width='100%' mb={4}>
            <TimePicker
              ampm={false}
              inputFormat='HH:mm'
              value={tempHour[0]}
              onChange={onTimeChange(k as IDay,'from')}
              renderInput={params=><TextField {...params} />}
            />
            <Typography>-</Typography>
            <TimePicker
              ampm={false}
              inputFormat='HH:mm'
              value={tempHour[1]}
              onChange={onTimeChange(k as IDay,'to')}
              renderInput={params=><TextField {...params} />}
            />
          </Stack>
          <Button size='small' onClick={onClose(k,true)}>{tCom('save')}</Button>
        </Box>
      </MenuPopover>
    </>
  )
}


export function GeneralSetting() {
  const {t} = useTranslation('dash_setting');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const {put} = useAPI();
  const setNotif = useNotif();
  const {toko_id,outlet_id} = router.query;
  const [loading,setLoading] = React.useState<'submit'|null>(null)
  const [opDialog,setOpDialog] = React.useState(false)
  const [input,setInput] = React.useState<Pick<IOutlet,'name'|'description'|'address'|'cod'|'online_payment'|'self_order'|'table_number'|'busy'|'business_hour'>>({name:'',description:null,address:null,cod:false,online_payment:false,self_order:false,table_number:false,busy:false,business_hour:null});
  const {outlet,errOutlet,mutateOutlet} = useOutlet(toko_id,outlet_id,{with_wallet:true});
  const [busHour,setBusHour] = React.useState< IDay | null>(null)
  const [tempHour,setTempHour] = React.useState<[Dayjs,Dayjs]>([getDayJs(),getDayJs()])

  const captchaRef = React.useRef<Recaptcha>(null);

  useMousetrap(['ctrl+s','meta+s'],(e)=>{
    handleSubmit(e as any)
  },true)

  const days = React.useMemo(()=>{
    return getDayList(t);
  },[t])

  const handleChange=React.useCallback((name: keyof typeof input)=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement> | string)=>{
    const inp = typeof e === 'string' ? e : e.target.value;
    setInput({...input,[name]:inp});
  },[input])

  const handleCheckedChange=React.useCallback((name: 'cod'|'online_payment'|'self_order'|'table_number'|'busy')=>(e: React.ChangeEvent<HTMLInputElement>)=>{
    if(name === 'self_order' && e.target?.checked === false) {
      setInput({...input,self_order:false,cod:false,online_payment:false})
      return;
    }
    if(name === 'online_payment' && e.target?.checked===true && !outlet?.wallet) {
      setOpDialog(true)
      return;
    }
    setInput({...input,[name]:e.target.checked});
  },[input,outlet])

  const handleCheckedHourChange=React.useCallback((name: IDay)=>(e: React.ChangeEvent<HTMLInputElement>)=>{
    if(e.target.checked===false) {
      const inp = input.business_hour;
      const d = inp?.[name];
      if(d) {
        delete inp[name];
      }
      if(inp !== null && isEmptyObj(inp)) setInput({...input,business_hour:null})
      else setInput({...input,business_hour:inp});
    } else {
      setTempHour([getDayJs(),getDayJs()])
      setBusHour(name);
    }
  },[input])

  const handleTimeBusinessHourChange = React.useCallback((name: IDay,type:'from'|'to')=>(value: any)=>{
    const index = type==='from' ? 0 : 1;
    const hour = [...tempHour] as [Dayjs,Dayjs];
    hour[index] = getDayJs(value);
    setTempHour(hour);
  },[tempHour])

  const closeTimeBusinessHour = React.useCallback((name:IDay,save?: boolean)=>()=>{
    if(save) {
      let bh = input.business_hour;
      const unix = tempHour.map(d=>d.unix()) as [number,number];
      if(bh) {
        bh[name] = unix
      } else {
        //@ts-ignore
        bh = {
          [name]: unix
        }
      }
      setInput({...input,business_hour:bh})
    }
    setBusHour(null);
  },[tempHour,input])

  const handleSubmit = React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading('submit');
    try {
      const recaptcha = await captchaRef.current?.execute();
      await put(`/sansorder/toko/${toko_id}/${outlet_id}`,{...input,recaptcha});
      setLoading(null);
      setNotif(tCom("saved"),false);
      mutateOutlet();
    } catch(e: any) {
      setNotif(e?.message||tCom("error"),true);
    } finally {
      setLoading(null)
    }
  },[put,setNotif,input,tCom])

  React.useEffect(()=>{
    if(input.name.length === 0 && outlet) {
      const {owner:_,toko:_1,id:_2,access:_3,isOwner:_4,isMyToko:_5,token_download_qr:_6,busy,business_hour,...rest} = outlet;
      setInput({...rest,busy,business_hour});
    }
  },[outlet])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {errOutlet ? (
        <Box display='flex' alignItems='center' flexGrow='1' justifyContent='center'>
          <Typography variant='h3' component='h3'>{errOutlet?.message}</Typography>
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Box pb={2} mb={5}>
            <Typography variant="h3" component='h3'>{tMenu("setting")}</Typography>
            <Divider />
          </Box>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} lg={3}>
                  <FormGroup sx={{flexDirection:'row'}}>
                    <FormControlLabel
                      style={{marginTop:0}}
                      control={
                        <Switch disabled={loading!==null} checked={input?.table_number||false} color="primary" onChange={handleCheckedChange('table_number')} />
                      }
                      label={ucwords(tCom("table_number"))}
                    />
                    <Popover icon='clarity:help-outline-badged' >{t("tn_desc")}</Popover>
                  </FormGroup>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Box>
                    <FormGroup sx={{flexDirection:'row'}}>
                      <FormControlLabel
                        style={{marginTop:0}}
                        control={
                          <Switch disabled={loading!==null} checked={input?.self_order||false} color="primary" onChange={handleCheckedChange('self_order')} />
                        }
                        label={tMenu("self_order")}
                      />
                      <Popover icon='clarity:help-outline-badged'>{t("so_desc")}</Popover>
                    </FormGroup>
                  </Box>
                </Grid>
                {input.self_order && (
                  <>
                    <Grid item xs={12} sm={6} lg={3}>
                      <FormGroup sx={{flexDirection:'row'}}>
                        <FormControlLabel
                          style={{marginTop:0}}
                          control={
                            <Switch disabled={loading!==null} checked={input?.online_payment||false} color="primary" onChange={handleCheckedChange('online_payment')} />
                          }
                          label={t("online_payment")}
                        />
                        <Popover icon='clarity:help-outline-badged' >{t("op_desc")}</Popover>
                      </FormGroup>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <FormGroup sx={{flexDirection:'row'}}>
                        <FormControlLabel
                          style={{marginTop:0}}
                          control={
                            <Switch disabled={loading!==null} checked={input?.cod||false} color="primary" onChange={handleCheckedChange('cod')} />
                          }
                          label={t("cod")}
                        />
                        <Popover icon='clarity:help-outline-badged' >{t("cod_desc")}</Popover>
                      </FormGroup>
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <FormGroup sx={{flexDirection:'row'}}>
                    <FormControlLabel
                      style={{marginTop:0}}
                      control={
                        <Switch disabled={loading!==null} checked={input?.busy||false} color="primary" onChange={handleCheckedChange('busy')} />
                      }
                      label={t("busy")}
                    />
                    <Popover icon='clarity:help-outline-badged' >{t("busy_desc")}</Popover>
                  </FormGroup>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sx={{mb:2}}>
              <FormLabel>{t("operational_hour")}</FormLabel>
              <Box mt={2}>
                <Grid container spacing={3} justifyContent='space-between'>
                  {Object.keys(days).map((key)=>(
                    <Grid key={key} item xs>
                      <DayTime
                        value={input.business_hour}
                        open={busHour === (key as IDay)}
                        onClose={closeTimeBusinessHour}
                        k={key as IDay}
                        days={days}
                        tempHour={tempHour}
                        loading={loading}
                        onChecked={handleCheckedHourChange}
                        onTimeChange={handleTimeBusinessHourChange}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={tCom("name_ctx",{what:"Outlet"})}
                value={input.name||''}
                onChange={handleChange('name')}
                required
                fullWidth
                disabled={loading!==null}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t("address")}
                value={input.address||''}
                onChange={handleChange('address')}
                fullWidth
                disabled={loading!==null}
              />
            </Grid>
            <Grid item xs={12}>
              <SimpleMDE disabled={loading!==null} value={input.description||''} onChange={handleChange('description')} label={tCom("description")} />
            </Grid>
            <Grid item xs={12}>
              <Button disabled={loading!==null||!getOutletAccess(outlet,['outlet'])} loading={loading==='submit'} type='submit' icon='submit'>{tCom("save")}</Button>
            </Grid>
          </Grid>
        </form>
      )}
      <Dialog open={opDialog} handleClose={()=>setOpDialog(false)} fullScreen={false}>
        <DialogTitle>{tCom("access_denied")}</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>{t("team.online_payment")}</Typography>
          <Typography gutterBottom>{t("team.online_payment_owner")}</Typography>
          <Typography>{t("team.online_payment_team")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button text color='inherit' onClick={()=>setOpDialog(false)}>{tCom("close")}</Button>
          {outlet?.isOwner && <Button onClick={()=>router.push(`/apps/${toko_id}/wallet`)}>{tCom("create_ctx",{what:t("wallet")})}</Button>}
        </DialogActions>
      </Dialog>
      <Recaptcha ref={captchaRef} />
      <Backdrop open={!outlet && !errOutlet} />
    </LocalizationProvider>
  )
}

interface UserMenu {
  onEdit(): void,
  onDelete(): void,
  editDisabled?: boolean,
  allDisabled?:boolean
}

function UserMenu({onEdit,onDelete,editDisabled,allDisabled}: UserMenu) {
  const ref=React.useRef(null);
  const [open,setOpen] = React.useState(false);

  const handleClick=React.useCallback((type:'edit'|'delete')=>(_e: React.MouseEvent<HTMLLIElement>)=>{
    setOpen(false)
    if(type === 'edit') onEdit();
    if(type === 'delete') onDelete();
  },[onEdit,onDelete,])

  return (
    <>
      <IconButton ref={ref} onClick={() => setOpen(true)}>
        <Iconify icon="eva:more-vertical-fill" width={20} height={20} />
      </IconButton>

      <MenuPopover open={open} onClose={()=>setOpen(false)} anchorEl={ref.current} paperSx={{py:1}}>
        <MenuItem disabled={!!editDisabled||!!allDisabled} sx={{ color: 'text.secondary' }} onClick={handleClick('edit')}>
          <ListItemIcon>
            <Iconify icon="eva:edit-fill" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Edit" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
        <MenuItem disabled={!!allDisabled} sx={{ color: 'error.main' }} onClick={handleClick('delete')}>
          <ListItemIcon>
            <Iconify icon="eva:trash-2-outline" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </MenuPopover>
    </>
  )
}

const userOptions = (t: TFunction) => userAccess.map(u=>({
  name:u,
  help: t(`access_help.${u}`)
}))

export function TeamSetting() {
  const {t} = useTranslation('dash_setting');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const {post,del,put} = useAPI();
  const setNotif = useNotif();
  const {toko_id,outlet_id} = router.query;
  const {outlet} = useOutlet(toko_id,outlet_id);
  const {page,rowsPerPage,...pagination} = usePagination(true);
  const [iCreate,setICreate] = React.useState<{email: string,access: IUserAccess[]}>({email:'',access:[]})
  const [iEdit,setIEdit] = React.useState<IUserAccess[]>([])
  const [dCreate,setDCreate] = React.useState(false);
  const [dEdit,setDEdit] = React.useState<TokoUsers|null>(null);
  const [dDelete,setDDelete] = React.useState<TokoUsers|null>(null);
  const [loading,setLoading] = React.useState(false);
  const {data,error,mutate} = useSWR<ResponsePagination<TokoUsers>>(`/sansorder/toko/${toko_id}/${outlet_id}/users?page=${page}&per_page=${rowsPerPage}`);
  const captchaRef = React.useRef<Recaptcha>(null);

  const buttonCreate=React.useCallback(()=>{
    setICreate({email:'',access:[]});
    setDCreate(true)
  },[])

  const handleUserAccessEdit = React.useCallback((type: IUserAccess)=>(e: React.ChangeEvent<HTMLInputElement>)=>{
    const access = [...iEdit];
    if(access.includes(type)) {
      const index = access.findIndex(a=>a===type);
      access.splice(index,1);
    } else {
      access.push(type);
    }
    setIEdit(access)
  },[iEdit])

  const buttonEdit=React.useCallback((dt: TokoUsers)=>()=>{
    setIEdit(dt.access);
    setDEdit(dt);
  },[])

  const handleCreate=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const recaptcha = await captchaRef.current?.execute();
      await post(`/sansorder/toko/${toko_id}/${outlet_id}/users`,{...iCreate,recaptcha});
      mutate();
      setNotif(tCom("saved"),false)
      setDCreate(false)
    } catch(e: any) {
      setNotif(e?.message||tCom("error"),true);
    } finally {
      setLoading(false);
    }
  },[iCreate,setNotif,post,toko_id,outlet_id,mutate,tCom])

  const handleUserAccessCreate = React.useCallback((type: IUserAccess)=>(e: React.ChangeEvent<HTMLInputElement>)=>{
    const access = [...iCreate.access];
    if(access.includes(type)) {
      const index = access.findIndex(a=>a===type);
      access.splice(index,1);
    } else {
      access.push(type);
    }
    setICreate({...iCreate,access})
  },[iCreate])

  const handleEdit=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const recaptcha = await captchaRef.current?.execute();
      await put(`/sansorder/toko/${toko_id}/${outlet_id}/users/${dEdit?.id}`,{access:iEdit,recaptcha});
      mutate();
      setNotif(tCom("saved"),false)
      setDEdit(null)
    } catch(e: any) {
      setNotif(e?.message||tCom("error"),true);
    } finally {
      setLoading(false);
    }
  },[dEdit,iEdit,setNotif,put,toko_id,outlet_id,mutate,tCom])

  const handleDelete=React.useCallback(async()=>{
    setLoading(true);
    try {
      await del(`/sansorder/toko/${toko_id}/${outlet_id}/users/${dDelete?.id}`);
      mutate();
      setNotif(tCom("deleted"),false)
      setDDelete(null)
    } catch(e: any) {
      setNotif(e?.message||tCom("error"),true);
    } finally {
      setLoading(false);
    }
  },[dDelete,del,setNotif,toko_id,outlet_id,mutate,tCom])
  
  return (
    <Box>
      <Box pb={2} mb={5}>
        <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
          <Typography variant="h3" component='h3'>{tMenu("team")}</Typography>
          <Button disabled={!outlet || !getOutletAccess(outlet,'users')} onClick={buttonCreate}>{tCom("add_ctx",{what:tMenu("team")})}</Button>
        </Stack>
      </Box>
      <Card sx={{p:2}}>
        <Scrollbar>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left">Name</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!data && !error ? (
                <TableRow>
                  <TableCell align="center" colSpan={3} sx={{ py: 3 }}><CircularProgress size={30} /></TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell align="center" colSpan={3} sx={{ py: 3 }}><Typography>{error?.message}</Typography></TableCell>
                </TableRow>
              ) : data?.data && data?.data?.length === 0 ? (
                <TableRow>
                  <TableCell align="center" colSpan={3} sx={{ py: 3 }}><Typography>{tCom("no_what",{what:"Data"})}</Typography></TableCell>
                </TableRow>
              ) : data?.data?.map((d,i)=>(
                <TableRow>
                  <TableCell align="left">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar alt={d?.name}>
                        {d?.picture === null ? d?.name : <Image src={d?.picture} />}
                      </Avatar>
                      <Typography variant="subtitle2" noWrap>
                        {d?.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" alignItems="center" justifyContent='center' spacing={2}>
                      {d?.access?.length > 0 && d?.access?.map(a=><Label variant='filled' color='info'>{ucwords(a)}</Label>)}
                      <Label variant='filled' color={d?.pending ? 'error':'success'}>{d?.pending ? t("pending"):t("active")}</Label>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <UserMenu onEdit={buttonEdit(d)} onDelete={()=>setDDelete(d)} editDisabled={!!d?.pending} allDisabled={!getUserAccess(d?.access,'users')} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
        <TablePagination
          count={data?.total||0}
          rowsPerPage={rowsPerPage}
          page={page-1}
          {...pagination}
        />
      </Card>

      <Dialog loading={loading} open={dCreate} handleClose={()=>setDCreate(false)}>
        <form onSubmit={handleCreate}>
          <DialogTitle>{tCom("add_ctx",{what:tMenu("team")})}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TextField
                  value={iCreate.email}
                  type='email'
                  onChange={(e)=>setICreate({...iCreate,email:e.target.value})}
                  label="Email"
                  fullWidth
                  required
                  autoFocus
                  placeholder={t("email")}
                />
              </Grid>
              <Grid item xs={12}>
                <FormLabel>Access</FormLabel>
                <Grid container spacing={2}>
                  {userOptions(t).map((o,i)=>(
                    <Grid item xs={12} sm={6} key={`user-access-create-${i}`}>
                      <FormGroup sx={{flexDirection:'row'}}>
                        <FormControlLabel
                          control={
                            <Checkbox disabled={loading} checked={iCreate.access.includes(o.name)} color='primary' onChange={handleUserAccessCreate(o.name)} />
                          }
                          label={ucwords(o.name)}
                        />
                        <Popover icon='clarity:help-outline-badged' >{o.help}</Popover>
                      </FormGroup>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button disabled={loading} text color='inherit' onClick={()=>setDCreate(false)}>{tCom("cancel")}</Button>
            <Button disabled={loading} loading={loading} type='submit' icon='submit'>{tCom("save")}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog loading={loading} open={dEdit!==null} handleClose={()=>setDEdit(null)}>
        <form onSubmit={handleEdit}>
          <DialogTitle>{`Edit ${tMenu("team")}`}</DialogTitle>
          <DialogContent>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Typography gutterBottom>{dEdit?.name}</Typography>
                <Typography>{`@${dEdit?.username}`}</Typography>
              </Grid>
              <Grid item xs={12}>
                <FormLabel>Access</FormLabel>
                <Grid container spacing={2}>
                  {userOptions(t).map((o,i)=>(
                    <Grid item xs={12} sm={6} key={`user-access-create-${i}`}>
                      <FormGroup sx={{flexDirection:'row'}}>
                        <FormControlLabel
                          control={
                            <Checkbox disabled={loading} checked={iEdit.includes(o.name)} color='primary' onChange={handleUserAccessEdit(o.name)} />
                          }
                          label={ucwords(o.name)}
                        />
                        <Popover icon='clarity:help-outline-badged' >{o.help}</Popover>
                      </FormGroup>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button disabled={loading} text color='inherit' onClick={()=>setDEdit(null)}>{tCom("cancel")}</Button>
            <Button disabled={loading} loading={loading} type='submit' icon='submit'>{tCom("save")}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog maxWidth='xs' loading={loading} open={dDelete!==null} handleClose={()=>setDDelete(null)} fullScreen={false}>
        <DialogTitle>{t("are_you_sure")}</DialogTitle>
        <DialogActions>
          <Button disabled={loading} text color='inherit' onClick={()=>setDDelete(null)}>{tCom("cancel")}</Button>
          <Button disabled={loading} loading={loading} icon='delete' color='error' onClick={handleDelete}>{tCom("delete")}</Button>
        </DialogActions>
      </Dialog>
      <Recaptcha ref={captchaRef} />
    </Box>
  )
}

export default function OutletSetting({meta}: IPages) {
  const {t:tMenu} = useTranslation('menu');
  const router = useRouter();
  const {slug,toko_id,outlet_id} = router.query;

  React.useEffect(()=>{
    if(typeof slug?.[0] === 'undefined') {
      router.replace(`/apps/[toko_id]/[outlet_id]/setting/outlet`,`/apps/${toko_id}/${outlet_id}/setting/outlet`,{shallow:true})
    }
  },[slug,toko_id,outlet_id])

  return (
    <Header title={`${slug?.[0] === 'team' ? tMenu("team") : tMenu("setting")} - ${meta?.title}`} desc={meta?.description}>
      <Dashboard title={meta?.title} subtitle={meta?.toko_name} {...(typeof slug?.[0] === 'string' ? {view:`dashboard setting ${slug?.[0]}`} : {})}>
        <Container>          
          <Box>
            {slug?.[0] === 'outlet' && (
              <GeneralSetting />
            )}
            {slug?.[0] === 'team' && (
              <TeamSetting />
            )}
          </Box>
        </Container>
      </Dashboard>
      
    </Header>
  )
}