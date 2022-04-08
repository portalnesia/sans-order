// material
import { Box, Grid, Container, Typography,Tabs,Tab,Divider,IconButton,TextField, FormGroup, FormControlLabel, Switch,Table,TableHead,TableRow,TableBody,TableCell,TablePagination,CircularProgress,Stack,MenuItem,ListItemIcon,ListItemText } from '@mui/material';
// components
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
import {IOutlet,IPages,ResponsePagination,TokoUsers} from '@type/index'
import wrapper from '@redux/store'
import {useTranslations} from 'next-intl';
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
  return await checkOutlet({onlyAdmin:true});
})

export function GeneralSetting() {
  const t = useTranslations();
  const router = useRouter();
  const {put} = useAPI();
  const setNotif = useNotif();
  const {toko_id,outlet_id} = router.query;
  const [loading,setLoading] = React.useState<'submit'|null>(null)
  const [opDialog,setOpDialog] = React.useState(false)
  const [input,setInput] = React.useState<Pick<IOutlet,'name'|'description'|'address'|'cod'|'online_payment'|'self_order'|'table_number'>>({name:'',description:null,address:null,cod:false,online_payment:false,self_order:false,table_number:false});
  const {outlet,errOutlet,mutateOutlet} = useOutlet(toko_id,outlet_id);

  const captchaRef = React.useRef<Recaptcha>(null);

  const handleChange=React.useCallback((name: keyof typeof input)=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement> | string)=>{
    const inp = typeof e === 'string' ? e : e.target.value;
    setInput({...input,[name]:inp});
  },[input])

  const handleCheckedChange=React.useCallback((name: 'cod'|'online_payment'|'self_order'|'table_number')=>(e: React.ChangeEvent<HTMLInputElement>)=>{
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

  const handleSubmit = React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading('submit');
    try {
      const recaptcha = await captchaRef.current?.execute();
      await put(`/toko/${toko_id}/${outlet_id}`,{...input,recaptcha});
      setLoading(null);
      setNotif(t("General.success"),false);
      mutateOutlet();
    } catch(e: any) {
      setNotif(e?.message||t("General.error"),true);
    } finally {
      setLoading(null)
    }
  },[put,setNotif,input,t])

  React.useEffect(()=>{
    if(input.name.length === 0 && outlet) {
      const {owner:_,toko:_1,id:_2,isAdmin:_3,isOwner:_4,isMyToko:_5,token_download_qr:_6,...rest} = outlet;
      setInput(rest);
    }
  },[outlet])

  return (
    <form onSubmit={handleSubmit}>
      <Box pb={2} mb={5}>
        <Typography variant="h3" component='h3'>{t("Menu.setting")}</Typography>
        <Divider />
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={3}>
              <Box>
                <FormGroup sx={{flexDirection:'row'}}>
                  <FormControlLabel
                    style={{marginTop:0}}
                    control={
                      <Switch disabled={loading!==null} checked={input?.self_order||false} color="primary" onChange={handleCheckedChange('self_order')} />
                    }
                    label={t("Outlet.self_order")}
                  />
                  <Popover icon='clarity:help-outline-badged'>{t("Outlet.so_desc")}</Popover>
                </FormGroup>
              </Box>
            </Grid>
            {input.self_order && (
              <>
                <Grid item xs={12} md={6} lg={3}>
                  <FormGroup sx={{flexDirection:'row'}}>
                    <FormControlLabel
                      style={{marginTop:0}}
                      control={
                        <Switch disabled={loading!==null} checked={input?.online_payment||false} color="primary" onChange={handleCheckedChange('online_payment')} />
                      }
                      label={t("Outlet.online_payment")}
                    />
                    <Popover icon='clarity:help-outline-badged' >{t("Outlet.op_desc")}</Popover>
                  </FormGroup>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <FormGroup sx={{flexDirection:'row'}}>
                    <FormControlLabel
                      style={{marginTop:0}}
                      control={
                        <Switch disabled={loading!==null} checked={input?.cod||false} color="primary" onChange={handleCheckedChange('cod')} />
                      }
                      label={t("Outlet.cod")}
                    />
                    <Popover icon='clarity:help-outline-badged' >{t("Outlet.cod_desc")}</Popover>
                  </FormGroup>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <FormGroup sx={{flexDirection:'row'}}>
                    <FormControlLabel
                      style={{marginTop:0}}
                      control={
                        <Switch disabled={loading!==null} checked={input?.table_number||false} color="primary" onChange={handleCheckedChange('table_number')} />
                      }
                      label={t("Outlet.table_number")}
                    />
                    <Popover icon='clarity:help-outline-badged' >{t("Outlet.tn_desc")}</Popover>
                  </FormGroup>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t("General.name",{what:"Outlet"})}
            value={input.name}
            onChange={handleChange('name')}
            required
            fullWidth
            disabled={loading!==null}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t("Toko.address")}
            value={input.address}
            onChange={handleChange('address')}
            fullWidth
            disabled={loading!==null}
          />
        </Grid>
        <Grid item xs={12}>
          <SimpleMDE disabled={loading!==null} value={input.description||''} onChange={handleChange('description')} label={t("General.description")} />
        </Grid>
        <Grid item xs={12}>
          <Button disabled={loading!==null||!outlet?.isAdmin} loading={loading==='submit'} type='submit' icon='submit'>{t("General.save")}</Button>
        </Grid>
      </Grid>
      <Backdrop open={!outlet && !errOutlet} />
      <Recaptcha ref={captchaRef} />
      <Dialog open={opDialog} handleClose={()=>setOpDialog(false)}>
        <DialogTitle>{t("General.access_denied")}</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>{t("Wallet.online_payment")}</Typography>
          <Typography gutterBottom>{t("Wallet.online_payment_owner")}</Typography>
          <Typography>{t("Wallet.online_payment_team")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button text color='inherit' onClick={()=>setOpDialog(false)}>{t("General.close")}</Button>
          {outlet?.isOwner && <Button onClick={()=>router.push(`/apps/${toko_id}/wallet`)}>{t("General.create",{what:t("General.wallet")})}</Button>}
        </DialogActions>
      </Dialog>
    </form>
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

export function TeamSetting() {
  const t = useTranslations();
  const router = useRouter();
  const {post,del,put} = useAPI();
  const setNotif = useNotif();
  const {toko_id,outlet_id} = router.query;
  const {outlet} = useOutlet(toko_id,outlet_id);
  const {page,rowsPerPage,...pagination} = usePagination();
  const [iCreate,setICreate] = React.useState<{email: string,admin: boolean}>({email:'',admin:false})
  const [iEdit,setIEdit] = React.useState<boolean>(false)
  const [dCreate,setDCreate] = React.useState(false);
  const [dEdit,setDEdit] = React.useState<TokoUsers|null>(null);
  const [dDelete,setDDelete] = React.useState<TokoUsers|null>(null);
  const [loading,setLoading] = React.useState(false);
  const {data,error,mutate} = useSWR<ResponsePagination<TokoUsers>>(`/toko/${toko_id}/${outlet_id}/users?page=${page}&per_page=${rowsPerPage}`);
  const captchaRef = React.useRef<Recaptcha>(null);

  const buttonCreate=React.useCallback(()=>{
    setICreate({email:'',admin:false});
    setDCreate(true)
  },[])

  const buttonEdit=React.useCallback((dt: TokoUsers)=>()=>{
    setIEdit(dt.admin);
    setDEdit(dt);
  },[])

  const handleCreate=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const recaptcha = await captchaRef.current?.execute();
      await post(`/toko/${toko_id}/${outlet_id}/users`,{...iCreate,recaptcha});
      mutate();
      setNotif(t("General.saved"),false)
      setDCreate(false)
    } catch(e: any) {
      setNotif(e?.message||t("General.error"),true);
    } finally {
      setLoading(false);
    }
  },[iCreate,setNotif,post,toko_id,outlet_id,mutate])

  const handleEdit=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const recaptcha = await captchaRef.current?.execute();
      await put(`/toko/${toko_id}/${outlet_id}/users/${dEdit?.id}`,{admin:iEdit,recaptcha});
      mutate();
      setNotif(t("General.saved"),false)
      setDEdit(null)
    } catch(e: any) {
      setNotif(e?.message||t("General.error"),true);
    } finally {
      setLoading(false);
    }
  },[dEdit,iEdit,setNotif,put,toko_id,outlet_id,mutate])

  const handleDelete=React.useCallback(async()=>{
    setLoading(true);
    try {
      await del(`/toko/${toko_id}/${outlet_id}/users/${dDelete?.id}`);
      mutate();
      setNotif(t("General.deleted"),false)
      setDDelete(null)
    } catch(e: any) {
      setNotif(e?.message||t("General.error"),true);
    } finally {
      setLoading(false);
    }
  },[dDelete,del,setNotif,toko_id,outlet_id,mutate])
  
  return (
    <Box>
      <Box pb={2} mb={5}>
        <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
          <Typography variant="h3" component='h3'>{t("Menu.team")}</Typography>
          <Button disabled={!outlet?.isAdmin} onClick={buttonCreate}>{t("General.add",{what:t("Menu.team")})}</Button>
        </Stack>
      </Box>
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
                <TableCell align="center" colSpan={3} sx={{ py: 3 }}><Typography>{t("General.no",{what:"Data"})}</Typography></TableCell>
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
                    {d?.admin && <Label variant='filled' color='info'>Admin</Label>}
                    <Label variant='filled' color={d?.pending ? 'error':'success'}>{d?.pending ? t("General.pending"):t("General.active")}</Label>
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <UserMenu onEdit={buttonEdit(d)} onDelete={()=>setDDelete(d)} editDisabled={!!d?.pending} allDisabled={!outlet?.isAdmin} />
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

      <Dialog loading={loading} open={dCreate} handleClose={()=>setDCreate(false)}>
        <form onSubmit={handleCreate}>
          <DialogTitle>{t("General.add",{what:t("Menu.team")})}</DialogTitle>
          <DialogContent>
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
                  placeholder={t("Outlet.email")}
                />
              </Grid>
              <Grid item xs={12}>
                <FormGroup sx={{flexDirection:'row'}}>
                  <FormControlLabel
                    control={
                      <Switch disabled={loading} checked={iCreate.admin||false} color="primary" onChange={(e)=>setICreate({...iCreate,admin:e.target.checked})} />
                    }
                    label={"Admin"}
                  />
                  <Popover icon='clarity:help-outline-badged' >{t("Outlet.admin_help")}</Popover>
                </FormGroup>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button disabled={loading} text color='inherit' onClick={()=>setDCreate(false)}>{t("General.cancel")}</Button>
            <Button disabled={loading} loading={loading} type='submit' icon='submit'>{t("General.save")}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog loading={loading} open={dEdit!==null} handleClose={()=>setDEdit(null)}>
        <form onSubmit={handleEdit}>
          <DialogTitle>{`Edit ${t("Menu.team")}`}</DialogTitle>
          <DialogContent>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Typography gutterBottom>{dEdit?.name}</Typography>
                <Typography>{`@${dEdit?.username}`}</Typography>
              </Grid>
              <Grid item xs={12}>
                <FormGroup sx={{flexDirection:'row'}}>
                  <FormControlLabel
                    control={
                      <Switch disabled={loading} checked={iEdit} color="primary" onChange={(e)=>setIEdit(e.target.checked)} />
                    }
                    label={"Admin"}
                  />
                  <Popover icon='clarity:help-outline-badged' >{t("Outlet.admin_help")}</Popover>
                </FormGroup>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button disabled={loading} text color='inherit' onClick={()=>setDEdit(null)}>{t("General.cancel")}</Button>
            <Button disabled={loading} loading={loading} type='submit' icon='submit'>{t("General.save")}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog maxWidth='xs' loading={loading} open={dDelete!==null} handleClose={()=>setDDelete(null)}>
        <DialogTitle>Are You Sure ?</DialogTitle>
        <DialogActions>
          <Button disabled={loading} text color='inherit' onClick={()=>setDDelete(null)}>{t("General.cancel")}</Button>
          <Button disabled={loading} loading={loading} icon='delete' color='error' onClick={handleDelete}>{t("General._delete")}</Button>
        </DialogActions>
      </Dialog>
      <Recaptcha ref={captchaRef} />
    </Box>
  )
}

export default function OutletSetting({meta}: IPages) {
  const t = useTranslations();
  const router = useRouter();
  const {slug,toko_id,outlet_id} = router.query;

  React.useEffect(()=>{
    if(typeof slug?.[0] === 'undefined') {
      router.replace(`/apps/[toko_id]/[outlet_id]/setting/outlet`,`/apps/${toko_id}/${outlet_id}/setting/outlet`,{shallow:true})
    }
  },[slug,toko_id,outlet_id])

  return (
    <Header title={`${slug?.[0] === 'team' ? t("Menu.team") : t("Menu.setting")} - ${meta?.title}`} desc={meta?.description}>
      <Dashboard title={meta?.title} subtitle={meta?.toko_name}>
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