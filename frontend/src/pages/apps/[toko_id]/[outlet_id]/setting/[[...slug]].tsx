// material
import { Box, Grid, Container, Typography,Checkbox,Divider,IconButton,TextField, FormGroup,FormLabel, FormControlLabel, Switch,Table,TableHead,TableRow,TableBody,TableCell,TablePagination,CircularProgress,Stack,MenuItem,ListItemIcon,ListItemText, Card } from '@mui/material';
// components
import {LocalizationProvider, TimePicker} from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Header from '@comp/Header';
import Dashboard from '@layout/dashboard/index'
import React from 'react'
import useNotif from '@utils/notification'
import {useAPI} from '@utils/api'
import Recaptcha from '@comp/Recaptcha'
import Button from '@comp/Button'
import Backdrop from '@comp/Backdrop'
import Image from '@comp/Image'
import Popover from '@comp/Popover'
import {IDays as IDay, Outlet,IPages,IUserAccess,OutletUsers,userAccess, Nullable, OutletUsersCreate, Config} from '@type/index'
import wrapper, { useSelector } from '@redux/store'
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
import { BusinessHour, BusinessHourCreate } from '@type/components';
import { State } from '@redux/types';
import { OutletUserRole } from '@type/OutletUserRole';
import useConfig from '@utils/useConfig';

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
    return await checkOutlet({onlyAccess:['Outlet']},'dash_setting');
  } else {
    return await checkOutlet({onlyAccess:['Outlet','User']},'dash_setting');
  }
})

type DayTimeProps = {
  open: boolean,
  onClose:(name:IDay,save?: boolean)=>()=>void,
  day: IDay,
  onChecked: (name: IDay)=>(e: React.ChangeEvent<HTMLInputElement>)=>void,
  loading: string|null
  tempHour: Pick<BusinessHourCreate,'from'|'to'>,
  value?: BusinessHourCreate
  days: Record<IDay,string>,
  onTimeChange:(name:IDay,type:'from'|'to')=>(value: any)=>void;
}

function DayTime({open,onClose,onChecked,day,days,loading,tempHour,value,onTimeChange}: DayTimeProps) {
  const {t:tCom} = useTranslation('common')
  const ref = React.useRef(null)
  
  return (
    <>
      <FormControlLabel
        ref={ref}
        label={
          <>
            <Typography noWrap>{days[day]}</Typography>
            {value ? (
              <Typography noWrap variant='caption'>{`${value.from.pn_format('time')} - ${getDayJs(value.to).pn_format('time')}`}</Typography>
            ) : null}
          </>
        }
        control={<Checkbox disabled={loading!==null} checked={(!!value)} color="primary" onChange={onChecked(day)} />}
      />
      <MenuPopover open={open} onClose={onClose(day)} paperSx={{width:350}} anchorEl={ref.current}>
        <Box p={2}>
          <Stack direction='row' alignItems='center' justifyContent={'space-evenly'} spacing={4} width='100%' mb={4}>
            <TimePicker
              ampm={false}
              inputFormat='HH:mm'
              value={tempHour.from}
              onChange={onTimeChange(day,'from')}
              renderInput={params=><TextField {...params} />}
            />
            <Typography>-</Typography>
            <TimePicker
              ampm={false}
              inputFormat='HH:mm'
              value={tempHour.to}
              onChange={onTimeChange(day,'to')}
              renderInput={params=><TextField {...params} />}
            />
          </Stack>
          <Button size='small' onClick={onClose(day,true)}>{tCom('save')}</Button>
        </Box>
      </MenuPopover>
    </>
  )
}


export function GeneralSetting({meta,config}: {meta: IPages<Outlet>['meta'],config?:Config}) {
  const {t} = useTranslation('dash_setting');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const {put} = useAPI();
  const setNotif = useNotif();
  const {toko_id,outlet_id} = router.query;
  const user = useSelector<State['user']>(s=>s.user);
  const [loading,setLoading] = React.useState<'submit'|null>(null)
  const [opDialog,setOpDialog] = React.useState(false)
  const [input,setInput] = React.useState<Nullable<Pick<Outlet,'name'|'description'|'address'|'cod'|'online_payment'|'self_order'|'table_number'|'busy'> & {business_hour: BusinessHourCreate[]}>>({name:'',description:null,address:null,cod:false,online_payment:false,self_order:false,table_number:false,busy:false,business_hour:null});
  const {outlet,errOutlet,mutateOutlet} = useOutlet(outlet_id,{fallback:meta},{withWallet:true});
  const [busHour,setBusHour] = React.useState<IDay|null>(null)
  const [tempHour,setTempHour] = React.useState<Pick<BusinessHourCreate,'from'|'to'>>({from:getDayJs(),to:getDayJs()})

  const haveWallet = React.useMemo(()=>{
    return Boolean(outlet && outlet.data.toko?.wallet)
  },[outlet])

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
    if(name === 'online_payment' && e.target?.checked===true && !haveWallet) {
      setOpDialog(true)
      return;
    }
    setInput({...input,[name]:e.target.checked});
  },[input,haveWallet])

  const handleCheckedHourChange=React.useCallback((name: IDay)=>(e: React.ChangeEvent<HTMLInputElement>)=>{
    if(e.target.checked===false) {
      const bussHour = [...(input.business_hour||[])];
      const index = bussHour?.findIndex(d=>d.day == name);
      
      if(index > -1) {
        bussHour.splice(index,1);
      }

      if(bussHour.length > 0) setInput({...input,business_hour:bussHour});
      else setInput({...input,business_hour:null});
    } else {
      setBusHour(name);
      setTempHour({from:getDayJs(),to:getDayJs()})
    }
  },[input])

  const handleTimeBusinessHourChange = React.useCallback((name: IDay,type:'from'|'to')=>(value: any)=>{
    const bh = {...tempHour};
    if(type === 'from') bh.from = value;
    else bh.to = value;
    setTempHour(bh);
  },[tempHour])

  const closeTimeBusinessHour = React.useCallback((name:IDay,save?: boolean)=>()=>{
    if(save && tempHour) {
      let bh = [...(input.business_hour||[])];

      const index = bh?.findIndex(d=>d.day===name);
      if(index > -1) {
        bh[index] = {
          day:name,
          from:tempHour?.from,
          to:tempHour.to
        }
      } else {
        bh.push({
          day:name,
          from:tempHour?.from,
          to:tempHour.to
        })
      }
      setInput({...input,business_hour:bh})
    }
    setBusHour(null);
  },[tempHour,input])

  const handleSubmit = React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading('submit');
    try {
      const business_hour = !input.business_hour ? null : input.business_hour.map(d=>({...d,from:d.from.format("HH:mm:ss.SSS"),to:d.to.format("HH:mm:ss.SSS")}))
      await put(`/outlets/${outlet_id}`,{...input,business_hour});
      setLoading(null);
      setNotif(tCom("saved"),false);
      mutateOutlet();
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error"),true);
    } finally {
      setLoading(null)
    }
  },[put,setNotif,input,tCom,mutateOutlet,outlet_id])

  React.useEffect(()=>{
    if(outlet) {
      const {name,description,address,cod,online_payment,self_order,table_number,busy,business_hour:bh} =  outlet.data;
      const business_hour = !bh ? null : bh.map(d=>({...d,from:getDayJs(`1997-01-01 ${d.from}`),to:getDayJs(`1997-01-01 ${d.to}`)}))
      setInput({name,description,address,cod,online_payment,self_order,table_number,busy,business_hour});
    }
  },[outlet])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {errOutlet ? (
        <Box display='flex' alignItems='center' flexGrow='1' justifyContent='center'>
          <Typography variant='h3' component='h3'>{errOutlet?.error.message}</Typography>
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Box pb={2} mb={5}>
            <Typography variant="h3" component='h3'>{tMenu("setting")}</Typography>
            <Divider />
          </Box>
          <Grid container spacing={6}>
            <Grid item xs={12} sx={{mb:2}}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <FormGroup sx={{flexDirection:'row'}}>
                    <FormControlLabel
                      sx={{mt:0,mr:1}}
                      control={
                        <Switch disabled={loading!==null} checked={input?.table_number||false} color="primary" onChange={handleCheckedChange('table_number')} />
                      }
                      label={ucwords(tCom("table_number"))}
                    />
                    <Popover icon='clarity:help-outline-badged' >{t("tn_desc")}</Popover>
                  </FormGroup>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Box>
                    <FormGroup sx={{flexDirection:'row'}}>
                      <FormControlLabel
                        sx={{mt:0,mr:1}}
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
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <FormGroup sx={{flexDirection:'row'}}>
                        <FormControlLabel
                          sx={{mt:0,mr:1}}
                          control={
                            <Switch disabled={loading!==null||!config?.online_payment} checked={input?.online_payment||false} color="primary" onChange={handleCheckedChange('online_payment')} />
                          }
                          label={t("online_payment")}
                        />
                        <Popover icon='clarity:help-outline-badged' >{t("op_desc")}</Popover>
                      </FormGroup>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <FormGroup sx={{flexDirection:'row'}}>
                        <FormControlLabel
                          sx={{mt:0,mr:1}}
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
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <FormGroup sx={{flexDirection:'row'}}>
                    <FormControlLabel
                      sx={{mt:0,mr:1}}
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
                  {Object.keys(days).map((key)=>{
                    const find = input?.business_hour?.find(d=>d.day === (key as IDay))
                    return (
                      <Grid key={key} item xs>
                        <DayTime
                          value={find}
                          open={busHour === (key as IDay)}
                          onClose={closeTimeBusinessHour}
                          day={key as IDay}
                          days={days}
                          tempHour={tempHour}
                          loading={loading}
                          onChecked={handleCheckedHourChange}
                          onTimeChange={handleTimeBusinessHourChange}
                        />
                      </Grid>
                    )
                  })}
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
              <Button disabled={loading!==null||!getOutletAccess(outlet?.data,['Outlet'])} loading={loading==='submit'} type='submit' icon='submit'>{tCom("save")}</Button>
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
          {user && outlet?.data?.toko?.user?.id == user.id && <Button onClick={()=>router.push(`/apps/${toko_id}/wallet`)}>{tCom("create_ctx",{what:t("wallet")})}</Button>}
        </DialogActions>
      </Dialog>
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
  const {t:tCom} = useTranslation('common');
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
          <ListItemText primary={tCom("del")} primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </MenuPopover>
    </>
  )
}

const userOptions = (t: TFunction) => userAccess.map(u=>({
  name:u,
  help: t(`access_help.${u}`)
}))

export function TeamSetting({meta}: {meta: IPages<Outlet>['meta']}) {
  const {t} = useTranslation('dash_setting');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const {post,del,put} = useAPI();
  const setNotif = useNotif();
  const {toko_id,outlet_id} = router.query;
  const {outlet} = useOutlet(outlet_id,{fallback:meta});
  const {page,rowsPerPage,...pagination} = usePagination(true);
  const [iCreate,setICreate] = React.useState<{email: string,roles: Pick<OutletUserRole,'id'|'name'>[]|null}>({email:'',roles:null})
  const [iEdit,setIEdit] = React.useState<Pick<OutletUserRole,'id'|'name'>[]>([])
  const [dCreate,setDCreate] = React.useState(false);
  const [dEdit,setDEdit] = React.useState<OutletUsersCreate|null>(null);
  const [dDelete,setDDelete] = React.useState<OutletUsersCreate|null>(null);
  const [loading,setLoading] = React.useState(false);
  const {data,error,mutate} = useSWR<OutletUsers,true>(`/outlets/${outlet_id}/users?page=${page}&pageSize=${rowsPerPage}`);
  const {data:uRoles} = useSWR<OutletUserRole,true>(`/outlet-user-roles`);

  const buttonCreate=React.useCallback(()=>{
    setICreate({email:'',roles:null});
    setDCreate(true)
  },[])

  const handleUserAccessEdit = React.useCallback((type: IUserAccess)=>(e: React.ChangeEvent<HTMLInputElement>)=>{
    const access = [...iEdit];
    const i = access.findIndex(d=>d.name === type)
    if(i > -1) {
      access.splice(i,1);
    } else {
      const find = uRoles?.data?.find(d=>d.name === type);
      if(find) {
        access.push({id:find.id,name:find.name})
      }
    }
    setIEdit(access)
  },[iEdit,uRoles])

  const buttonEdit=React.useCallback((dt: OutletUsers)=>()=>{
    setIEdit(dt.roles||[]);
    setDEdit(dt);
  },[])

  const handleCreate=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      await post(`/outlets/${outlet_id}/users`,iCreate);
      mutate();
      setNotif(tCom("saved"),false)
      setDCreate(false)
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error"),true);
    } finally {
      setLoading(false);
    }
  },[iCreate,setNotif,post,outlet_id,mutate,tCom])

  const handleUserAccessCreate = React.useCallback((type: IUserAccess)=>(e: React.ChangeEvent<HTMLInputElement>)=>{
    const roles = iCreate.roles||[];
    const i = roles.findIndex(d=>d.name === type)
    if(i > -1) {
      roles.splice(i,1);
    } else {
      const find = uRoles?.data?.find(d=>d.name === type);
      if(find) {
        roles.push({id:find.id,name:find.name})
      }
    }
    setICreate({...iCreate,roles})
  },[iCreate,uRoles?.data])

  const handleEdit=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      await put(`/outlets/${outlet_id}/users/${dEdit?.id}`,{roles:iEdit});
      mutate();
      setNotif(tCom("saved"),false)
      setDEdit(null)
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error"),true);
    } finally {
      setLoading(false);
    }
  },[dEdit,iEdit,setNotif,put,outlet_id,mutate,tCom])

  const handleDelete=React.useCallback(async()=>{
    setLoading(true);
    try {
      await del(`/outlets/${outlet_id}/users/${dDelete?.id}`);
      mutate();
      setNotif(tCom("deleted"),false)
      setDDelete(null)
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error"),true);
    } finally {
      setLoading(false);
    }
  },[dDelete,del,setNotif,outlet_id,mutate,tCom])
  
  return (
    <Box>
      <Box pb={2} mb={5}>
        <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
          <Typography variant="h3" component='h3'>{tMenu("team")}</Typography>
          <Button disabled={!outlet || !getOutletAccess(outlet?.data,'User')} onClick={buttonCreate}>{tCom("add_ctx",{what:tMenu("team")})}</Button>
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
                  <TableCell align="center" colSpan={3} sx={{ py: 3 }}><Typography>{error?.error?.message}</Typography></TableCell>
                </TableRow>
              ) : data?.data && data?.data?.length === 0 ? (
                <TableRow>
                  <TableCell align="center" colSpan={3} sx={{ py: 3 }}><Typography>{tCom("no_what",{what:"Data"})}</Typography></TableCell>
                </TableRow>
              ) : data?.data?.map((d,i)=>(
                <TableRow key={`setting-${d.id}`}>
                  <TableCell align="left">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar alt={d?.user?.name}>
                        {d?.user?.picture === null ? d?.user?.name : <Image alt={d?.user?.name} src={d?.user?.picture} />}
                      </Avatar>
                      <Typography variant="subtitle2" noWrap>
                        {d?.user?.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" alignItems="center" justifyContent='center' spacing={2}>
                      {d?.roles?.length > 0 && d?.roles?.map(a=><Label key={`roles-${a.id}`} variant='filled' color='info'>{ucwords(a?.name)}</Label>)}
                      <Label variant='filled' color={d?.pending ? 'error':'success'}>{d?.pending ? t("pending"):t("active")}</Label>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <UserMenu onEdit={buttonEdit(d)} onDelete={()=>setDDelete(d)} editDisabled={!!d?.pending} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
        <TablePagination
          count={data?.meta?.pagination?.pageCount||0}
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
                            <Checkbox disabled={loading} checked={!!(iCreate?.roles?.find(a=>a.name === o.name))} color='primary' onChange={handleUserAccessCreate(o.name)} />
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
                <Typography gutterBottom>{dEdit?.user?.name}</Typography>
                <Typography>{`@${dEdit?.user?.username}`}</Typography>
              </Grid>
              <Grid item xs={12}>
                <FormLabel>Access</FormLabel>
                <Grid container spacing={2}>
                  {userOptions(t).map((o,i)=>(
                    <Grid item xs={12} sm={6} key={`user-access-create-${i}`}>
                      <FormGroup sx={{flexDirection:'row'}}>
                        <FormControlLabel
                          control={
                            <Checkbox disabled={loading} checked={!!(iEdit?.find(a=>a.name === o.name))} color='primary' onChange={handleUserAccessEdit(o.name)} />
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
          <Button disabled={loading} loading={loading} icon='delete' color='error' onClick={handleDelete}>{tCom("del")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default function OutletSetting({meta}: IPages<Outlet>) {
  const {t:tMenu} = useTranslation('menu');
  const router = useRouter();
  const {slug,toko_id,outlet_id} = router.query;
  const {config} = useConfig();

  React.useEffect(()=>{
    if(typeof slug?.[0] === 'undefined') {
      router.replace(`/apps/[toko_id]/[outlet_id]/setting/outlet`,`/apps/${toko_id}/${outlet_id}/setting/outlet`,{shallow:true})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[slug,toko_id,outlet_id])

  return (
    <Header title={`${slug?.[0] === 'team' ? tMenu("team") : tMenu("setting")} - ${meta?.data?.name}`} desc={meta?.data?.description}>
      <Dashboard title={meta?.data?.name} subtitle={meta?.data?.toko?.name} {...(typeof slug?.[0] === 'string' ? {view:`dashboard setting ${slug?.[0]}`} : {})}>
        <Container>          
          <Box>
            {slug?.[0] === 'outlet' && (
              <GeneralSetting meta={meta} config={config?.data} />
            )}
            {slug?.[0] === 'team' && (
              <TeamSetting meta={meta} />
            )}
          </Box>
        </Container>
      </Dashboard>
      
    </Header>
  )
}