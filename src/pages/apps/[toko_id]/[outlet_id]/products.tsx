// material
import { Box, Grid, Container, Typography,Tooltip,IconButton,TextField, Card, FormControlLabel, Switch,Checkbox,Table,TableHead,TableRow,TableBody,TableCell,TablePagination,CircularProgress,Stack,MenuItem,ListItemIcon,ListItemText } from '@mui/material';
import {AddAPhoto,Delete} from '@mui/icons-material'
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
import {IOutlet,IPages,ResponsePagination,IProduct, Without} from '@type/index'
import wrapper from '@redux/store'
<<<<<<< HEAD
import {useTranslation} from 'next-i18next';
=======
import {useTranslations} from 'next-intl';
>>>>>>> main
import useSWR from '@utils/swr';
import { useRouter } from 'next/router';
import Iconify from '@comp/Iconify';
import MenuPopover from '@comp/MenuPopover'
import useOutlet from '@utils/useOutlet'
import Scrollbar from '@comp/Scrollbar'
import Avatar from '@comp/Avatar'
import Label from '@comp/Label'
import {useMousetrap} from '@utils/useKeys'
import usePagination from '@comp/TablePagination'
import dynamic from 'next/dynamic'
import { numberFormat } from '@portalnesia/utils';

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const SimpleMDE = dynamic(()=>import('@comp/SimpleMDE'))
const Browser = dynamic(()=>import('@comp/Browser'),{ssr:false})

<<<<<<< HEAD
export const getServerSideProps = wrapper({name:'check_outlet',outlet:{onlyMyToko:true},translation:'dash_product'})
=======
export const getServerSideProps = wrapper({name:'check_outlet',outlet:{onlyMyToko:true}})
>>>>>>> main

type IInputProduct = Without<IProduct,'id'|'outlet_id'|'toko_id'|'metadata'>

interface FormProps {
  input: IInputProduct,
  setInput(item: IInputProduct): void
  loading?: boolean
  openBrowser(): void
  autoFocus?:boolean
}

function Form({input,setInput,loading,openBrowser,autoFocus}: FormProps) {
<<<<<<< HEAD
  const {t} = useTranslation('dash_product');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
=======
  const t = useTranslations();
>>>>>>> main

  const handleChange=React.useCallback((name: keyof IInputProduct)=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement> | string)=>{
    const val = typeof e === 'string' ? e : e?.target?.value;
    const isNum = ['price','disscount','stock','stock_per_items','hpp'].includes(name);
    const isNull = ['description','category','unit'].includes(name)
    if(isNum||isNull) {
      const value = val?.length > 0 ? (isNum ? Number(val) : val) : null;
      setInput({...input,[name]:value});
      return;
    }
    setInput({...input,[name]:val||null})
  },[input])

  const handleChecked = React.useCallback((name: keyof IInputProduct)=>(e?: React.ChangeEvent<HTMLInputElement>)=>{
    setInput({...input,[name]:e?.target?.checked||false})
  },[input])

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Switch disabled={loading} checked={input.active} color="primary" onChange={handleChecked('active')} />
          }
<<<<<<< HEAD
          label={t("active")}
=======
          label={t("General.active")}
>>>>>>> main
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Switch disabled={loading} checked={input.show_in_menu} color="primary" onChange={handleChecked('show_in_menu')} />
          }
<<<<<<< HEAD
          label={t("show_in_menu")}
=======
          label={t("Product.show_in_menu")}
>>>>>>> main
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
<<<<<<< HEAD
          label={tCom("name_ctx",{what:tMenu("products")})}
=======
          label={t("General.name",{what:t("Menu.products")})}
>>>>>>> main
          value={input.name}
          onChange={handleChange('name')}
          required
          fullWidth
          autoFocus={autoFocus}
          placeholder='Cappucino'
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
<<<<<<< HEAD
          label={t("category")}
=======
          label={t("Product.category")}
>>>>>>> main
          value={input.category}
          onChange={handleChange('category')}
          fullWidth
          placeholder='Coffee'
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <TextField
<<<<<<< HEAD
          label={t("price")}
=======
          label={t("Product.price")}
>>>>>>> main
          value={input.price||0}
          onChange={handleChange('price')}
          required
          fullWidth
          helperText={`IDR ${numberFormat(`${input.price||0}`)}`}
          type='number'
          inputProps={{min:0}}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
<<<<<<< HEAD
          label={t("disscount")}
=======
          label={t("Product.disscount")}
>>>>>>> main
          value={input.disscount||0}
          onChange={handleChange('disscount')}
          required
          fullWidth
          helperText={`IDR ${numberFormat(`${input.disscount||0}`)}`}
          type='number'
          inputProps={{min:0}}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          label="HPP"
          value={input.hpp||0}
          onChange={handleChange('hpp')}
          fullWidth
          helperText={`IDR ${numberFormat(`${input.hpp||0}`)}`}
          type='number'
          inputProps={{min:0}}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <TextField
<<<<<<< HEAD
          label={t("stock")}
=======
          label={t("Product.stock")}
>>>>>>> main
          value={input.stock||0}
          onChange={handleChange('stock')}
          fullWidth
          helperText={"Sisa stock"}
          inputProps={{min:0}}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
<<<<<<< HEAD
          label={`${t("stock")} per Item`}
=======
          label={`${t("Product.stock")} per Item`}
>>>>>>> main
          value={input.stock_per_items||0}
          onChange={handleChange('stock_per_items')}
          fullWidth
          helperText={"Stok terkonsumsi dalam 1 pembelian"}
          type='number'
          inputProps={{min:0}}
          required={Boolean(input.stock && input.stock > 0)}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          label={'Unit'}
          value={input.unit||''}
          onChange={handleChange('unit')}
          fullWidth
          placeholder='KG, Liter, Pcs'
          required={Boolean(input.stock && input.stock > 0)}
        />
      </Grid>
      <Grid item xs={12}>
<<<<<<< HEAD
        <SimpleMDE disabled={loading} value={input.description||''} image onChange={handleChange('description')} label={tCom("description")} />
=======
        <SimpleMDE disabled={loading} value={input.description||''} image onChange={handleChange('description')} label={t("General.description")} />
>>>>>>> main
      </Grid>
      <Grid item xs={12}>
        {input.image ? (
          <Box padding={{sm:2,md:3,lg:5}} display='flex' alignItems='center' justifyContent='center'>
<<<<<<< HEAD
            <Image alt={tCom("image")} src={input.image} style={{maxWidth:300}} />
          </Box>
        ) : (
          <Box textAlign='center' padding={{sm:2,md:3,lg:5}}>
            <Typography>{tCom("no_what",{what:tCom("image")})}</Typography>
          </Box>
        )}
        <Box className='flex-header' pl={{sm:2,md:3,lg:5}} pr={{sm:2,md:3,lg:5}}>
          <Tooltip title={tCom("remove_ctx",{what:tCom("Geral.image")})}><IconButton disabled={(!(!!input.image))} sx={{color:'error.main'}} onClick={()=>setInput({...input,image:null})}><Delete /></IconButton></Tooltip>
          <Tooltip title={input.image ? tCom("change_ctx",{what:tCom("image")}) : tCom("add_ctx",{what:tCom("image")})}><IconButton disabled={loading} sx={{color:'primary.main'}} onClick={openBrowser}><AddAPhoto /></IconButton></Tooltip>
=======
            <Image alt={t("General.image")} src={input.image} style={{maxWidth:300}} />
          </Box>
        ) : (
          <Box textAlign='center' padding={{sm:2,md:3,lg:5}}>
            <Typography>{t("General.no",{what:t("General.image")})}</Typography>
          </Box>
        )}
        <Box className='flex-header' pl={{sm:2,md:3,lg:5}} pr={{sm:2,md:3,lg:5}}>
          <Tooltip title={t("General.remove",{what:t("General.image")})}><IconButton disabled={(!(!!input.image))} sx={{color:'error.main'}} onClick={()=>setInput({...input,image:null})}><Delete /></IconButton></Tooltip>
          <Tooltip title={input.image ? t("General.change",{what:t("General.image")}) : t("General.add",{what:t("General.image")})}><IconButton disabled={loading} sx={{color:'primary.main'}} onClick={openBrowser}><AddAPhoto /></IconButton></Tooltip>
>>>>>>> main
        </Box>
      </Grid>
    </Grid>
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
        <MenuItem disabled={!!editDisabled||!!allDisabled} sx={{ color: 'text.secondary',py:1 }} onClick={handleClick('edit')}>
          <ListItemIcon>
            <Iconify icon="eva:edit-fill" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Edit" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
        <MenuItem disabled={!!allDisabled} sx={{ color: 'error.main',py:1 }} onClick={handleClick('delete')}>
          <ListItemIcon>
            <Iconify icon="eva:trash-2-outline" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </MenuPopover>
    </>
  )
}

const DEFAULT_INPUT: IInputProduct = {
  name:"",
  description:null,
  active:false,
  show_in_menu:false,
  price:0,
  disscount:0,
  image: null,
  category:null,
  hpp:null,
  stock:null,
  stock_per_items:null,
  unit:null
}

export default function OutletProducts({meta}: IPages) {
<<<<<<< HEAD
  const {t} = useTranslation('dash_product');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
=======
  const t = useTranslations();
>>>>>>> main
  const router = useRouter();
  const {post,del,put} = useAPI();
  const setNotif = useNotif();
  const {toko_id,outlet_id} = router.query;
  const {outlet} = useOutlet(toko_id,outlet_id);
  const {page,rowsPerPage,...pagination} = usePagination(true);
  const [input,setInput] = React.useState<IInputProduct>(DEFAULT_INPUT);
  const [dCreate,setDCreate] = React.useState(false);
  const [dEdit,setDEdit] = React.useState<IProduct|null>(null);
  const [dDelete,setDDelete] = React.useState<IProduct|null|boolean>(null);
  const [loading,setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<IProduct[]>([]);
  const {data,error,mutate} = useSWR<ResponsePagination<IProduct>>(`/toko/${toko_id}/${outlet_id}/items?page=${page}&per_page=${rowsPerPage}`);
  const [browser,setBrowser] = React.useState(false);
  const captchaRef = React.useRef<Recaptcha>(null);

  const handleSelectAllClick = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = data?.data||[]
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  },[data]);

  const handleSelect = React.useCallback((item: IProduct) => () => {
    const items = [...selected];
    const selectedIndex = items.findIndex(i=>i.id === item.id)
    let newSelected: IProduct[] = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(items, item);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(items.slice(1));
    } else if (selectedIndex === items.length - 1) {
      newSelected = newSelected.concat(items.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        items.slice(0, selectedIndex),
        items.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  },[selected]);

  const handleSelectedImage=React.useCallback((image: string|null)=>{
    setInput(p=>({...p,image}))
  },[setInput])

  const buttonCreate=React.useCallback(()=>{
    setInput(DEFAULT_INPUT);
    setDCreate(true)
  },[])

  const buttonEdit=React.useCallback((d: IProduct)=>()=>{
    const {id:_,outlet_id:__,toko_id:_d,metadata:_m,stock_per_items,...rest} = d;
    setInput({...rest,stock_per_items:stock_per_items||null});
    setDEdit(d);
  },[])

  const handleCreate=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const recaptcha = await captchaRef.current?.execute();
      await post(`/toko/${toko_id}/${outlet_id}/items`,{...input,recaptcha});
      mutate();
<<<<<<< HEAD
      setNotif(tCom("saved"),false)
      setDCreate(false)
    } catch(e: any) {
      setNotif(e?.message||tCom("error_500"),true);
    } finally {
      setLoading(false);
    }
  },[input,setNotif,post,toko_id,outlet_id,mutate,tCom])
=======
      setNotif(t("General.saved"),false)
      setDCreate(false)
    } catch(e: any) {
      setNotif(e?.message||t("General.error"),true);
    } finally {
      setLoading(false);
    }
  },[input,setNotif,post,toko_id,outlet_id,mutate])
>>>>>>> main

  const handleEdit=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const recaptcha = await captchaRef.current?.execute();
      await put(`/toko/${toko_id}/${outlet_id}/items/${dEdit?.id}`,{...input,recaptcha});
      mutate();
<<<<<<< HEAD
      setNotif(tCom("saved"),false)
      setDEdit(null)
    } catch(e: any) {
      setNotif(e?.message||tCom("error_500"),true);
=======
      setNotif(t("General.saved"),false)
      setDEdit(null)
    } catch(e: any) {
      setNotif(e?.message||t("General.error"),true);
>>>>>>> main
    } finally {
      setLoading(false);
    }
  },[dEdit,input,setNotif,put,toko_id,outlet_id,mutate])

  const handleDelete=React.useCallback(async()=>{
    if(typeof dDelete !== 'boolean' && dDelete && 'id' in dDelete) {
      setLoading(true);
      try {
        await del(`/toko/${toko_id}/${outlet_id}/items/${dDelete?.id}`);
        mutate();
<<<<<<< HEAD
        setNotif(tCom("deleted"),false)
        setDDelete(null)
      } catch(e: any) {
        setNotif(e?.message||tCom("error_500"),true);
=======
        setNotif(t("General.deleted"),false)
        setDDelete(null)
      } catch(e: any) {
        setNotif(e?.message||t("General.error"),true);
>>>>>>> main
      } finally {
        setLoading(false);
      }
    }
<<<<<<< HEAD
  },[dDelete,del,setNotif,toko_id,outlet_id,mutate,tCom])
=======
  },[dDelete,del,setNotif,toko_id,outlet_id,mutate])
>>>>>>> main

  const handleDeleteAll=React.useCallback(async()=>{
    if(typeof dDelete === 'boolean') {
      setLoading(true);
      try {
        const ids = selected.map(s=>s.id);
        await post(`/toko/${toko_id}/${outlet_id}/bulk/delete`,{type:'item',ids});
        mutate();
<<<<<<< HEAD
        setNotif(tCom("General.deleted"),false)
        setDDelete(null)
      } catch(e: any) {
        setNotif(e?.message||tCom("error_500"),true);
=======
        setNotif(t("General.deleted"),false)
        setDDelete(null)
      } catch(e: any) {
        setNotif(e?.message||t("General.error"),true);
>>>>>>> main
      } finally {
        setLoading(false);
      }
    }
<<<<<<< HEAD
  },[selected,post,setNotif,toko_id,outlet_id,mutate,tCom])
=======
  },[selected,post,setNotif,toko_id,outlet_id,mutate])
>>>>>>> main

  useMousetrap(['+','shift+='],buttonCreate);

  return (
<<<<<<< HEAD
    <Header title={`${tMenu("products")} - ${meta?.title}`} desc={meta?.description}>
=======
    <Header title={`${t("Menu.products")} - ${meta?.title}`} desc={meta?.description}>
>>>>>>> main
      <Dashboard title={meta?.title} subtitle={meta?.toko_name}>
        <Container>
          <Box pb={2} mb={5}>
            <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
<<<<<<< HEAD
              <Typography variant="h3" component='h3'>{tMenu("products")}</Typography>
              <Button icon='add' tooltip='+' disabled={!outlet?.isAdmin} onClick={buttonCreate}>{tCom("add_ctx",{what:tMenu("products")})}</Button>
=======
              <Typography variant="h3" component='h3'>{t("Menu.products")}</Typography>
              <Button icon='add' tooltip='+' disabled={!outlet?.isAdmin} onClick={buttonCreate}>{t("General.add",{what:t("Menu.products")})}</Button>
>>>>>>> main
            </Stack>
          </Box>
          <Card>
            {selected.length > 0 && (
              <Box p={2} sx={{backgroundColor:'primary.lighter'}} className='flex-header'>
<<<<<<< HEAD
                <Typography sx={{color:'primary.main'}} variant='h6' component='h6'>{t("selected",{count:selected.length})}</Typography>
=======
                <Typography sx={{color:'primary.main'}} variant='h6' component='h6'>{t("General.selected",{what:selected.length})}</Typography>
>>>>>>> main
                <IconButton sx={{color:'error.main'}} onClick={()=>setDDelete(true)}><Delete /></IconButton>
              </Box>
            )}
            <Scrollbar>
              <Table>
                <TableHead>
                  <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={Boolean(selected?.length > 0 && (data && selected?.length < (data?.data?.length||0)))}
                      checked={Boolean(data && data?.data?.length > 0 && selected.length === data?.data?.length)}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
<<<<<<< HEAD
                    <TableCell align="left">{tCom("name_ctx",{what:tMenu("products")})}</TableCell>
                    <TableCell>HPP</TableCell>
                    <TableCell>{t("price")}</TableCell>
                    <TableCell>{t("disscount")}</TableCell>
                    <TableCell align="left">{t("stock")}</TableCell>
=======
                    <TableCell align="left">{t("General.name",{what:t("Menu.products")})}</TableCell>
                    <TableCell>HPP</TableCell>
                    <TableCell>{t("Product.price")}</TableCell>
                    <TableCell>{t("Product.disscount")}</TableCell>
                    <TableCell align="left">{t("Product.stock")}</TableCell>
>>>>>>> main
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center" width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {!data && !error ? (
                    <TableRow>
                      <TableCell align="center" colSpan={7} sx={{ py: 3 }}><CircularProgress size={30} /></TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell align="center" colSpan={7} sx={{ py: 3 }}><Typography>{error?.message}</Typography></TableCell>
                    </TableRow>
                  ) : data?.data && data?.data?.length === 0 ? (
                    <TableRow>
<<<<<<< HEAD
                      <TableCell align="center" colSpan={7} sx={{ py: 3 }}><Typography>{tCom("no_what",{what:tMenu("products")})}</Typography></TableCell>
=======
                      <TableCell align="center" colSpan={7} sx={{ py: 3 }}><Typography>{t("General.no",{what:t("Menu.products")})}</Typography></TableCell>
>>>>>>> main
                    </TableRow>
                  ) : data?.data?.map((d)=>{
                    const isSelected = selected.findIndex(it=>it.id === d.id) !== -1;
                    return (
                      <TableRow
                        hover
                        key={`product-${d.id}`}
                        tabIndex={-1}
                        role="checkbox"
                        selected={isSelected}
                        aria-checked={isSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={handleSelect(d)}
                          />
                        </TableCell>
                        <TableCell>{d?.name}</TableCell>
                        <TableCell sx={{whiteSpace:'nowrap'}}>{`IDR ${numberFormat(`${d?.hpp||0}`)}`}</TableCell>
                        <TableCell sx={{whiteSpace:'nowrap'}}>{`IDR ${numberFormat(`${d.price}`)}`}</TableCell>
                        <TableCell sx={{whiteSpace:'nowrap'}}>{`IDR ${numberFormat(`${d.disscount}`)}`}</TableCell>
                        <TableCell>
                          <div className='flex-header'>
                            <Typography>{d?.stock||"-"}</Typography>
                            <Typography>{d?.unit||''}</Typography>
                          </div>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" alignItems="center" justifyContent='center' spacing={2}>
<<<<<<< HEAD
                            <Label variant='filled' color={d.active ? 'success':'error'}>{d?.active ? t("active") : t("active",{context:'not'})}</Label>
                            {d?.show_in_menu && <Label variant='filled' color='info'>{t("show_in_menu")}</Label>}
=======
                            <Label variant='filled' color={d.active ? 'success':'error'}>{d?.active ? t("General.active") : t("General.not",{what:t("General.active")})}</Label>
                            {d?.show_in_menu && <Label variant='filled' color='info'>{t("Product.show_in_menu")}</Label>}
>>>>>>> main
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <UserMenu onEdit={buttonEdit(d)} onDelete={()=>setDDelete(d)} allDisabled={!outlet?.isAdmin} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
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
        </Container>
      </Dashboard>
      <Dialog loading={loading} maxWidth='md' open={dCreate} handleClose={()=>setDCreate(false)}>
        <form onSubmit={handleCreate}>
<<<<<<< HEAD
          <DialogTitle>{tCom("add_ctx",{what:tMenu("products")})}</DialogTitle>
=======
          <DialogTitle>{t("General.add",{what:t("Menu.products")})}</DialogTitle>
>>>>>>> main
          <DialogContent dividers>
            <Form input={input} setInput={setInput} loading={loading} openBrowser={()=>setBrowser(true)} />
          </DialogContent>
          <DialogActions>
<<<<<<< HEAD
            <Button text color='inherit' disabled={loading} onClick={()=>setDCreate(false)}>{tCom("cancel")}</Button>
            <Button disabled={loading} loading={loading} icon='submit' type='submit'>{tCom("save")}</Button>
=======
            <Button text color='inherit' disabled={loading} onClick={()=>setDCreate(false)}>{t("General.cancel")}</Button>
            <Button disabled={loading} loading={loading} icon='submit' type='submit'>{t("General.save")}</Button>
>>>>>>> main
          </DialogActions>
        </form>
      </Dialog>

      <Dialog loading={loading} maxWidth='md' open={dEdit!==null} handleClose={()=>setDEdit(null)}>
        <form onSubmit={handleEdit}>
<<<<<<< HEAD
          <DialogTitle>{`Edit ${tMenu("products")}`}</DialogTitle>
=======
          <DialogTitle>{`Edit ${t("Menu.products")}`}</DialogTitle>
>>>>>>> main
          <DialogContent dividers>
            <Form autoFocus input={input} setInput={setInput} loading={loading} openBrowser={()=>setBrowser(true)} />
          </DialogContent>
          <DialogActions>
<<<<<<< HEAD
            <Button text color='inherit' disabled={loading} onClick={()=>setDEdit(null)}>{tCom("cancel")}</Button>
            <Button disabled={loading} loading={loading} icon='submit' type='submit'>{tCom("save")}</Button>
=======
            <Button text color='inherit' disabled={loading} onClick={()=>setDEdit(null)}>{t("General.cancel")}</Button>
            <Button disabled={loading} loading={loading} icon='submit' type='submit'>{t("General.save")}</Button>
>>>>>>> main
          </DialogActions>
        </form>
      </Dialog>

      <Dialog maxWidth='xs' loading={loading} open={dDelete!==null} handleClose={()=>setDDelete(null)} fullScreen={false}>
<<<<<<< HEAD
        <DialogTitle>{tCom("are_you_sure")}</DialogTitle>
        <DialogActions>
          <Button disabled={loading} text color='inherit' onClick={()=>setDDelete(null)}>{tCom("cancel")}</Button>
          {typeof dDelete === 'boolean' ? (
            <Button disabled={loading} loading={loading} icon='delete' color='error' onClick={handleDeleteAll}>{tCom("delete")}</Button>
          ) : (
            <Button disabled={loading} loading={loading} icon='delete' color='error' onClick={handleDelete}>{tCom("delete")}</Button>
=======
        <DialogTitle>{t("General.are_you_sure")}</DialogTitle>
        <DialogActions>
          <Button disabled={loading} text color='inherit' onClick={()=>setDDelete(null)}>{t("General.cancel")}</Button>
          {typeof dDelete === 'boolean' ? (
            <Button disabled={loading} loading={loading} icon='delete' color='error' onClick={handleDeleteAll}>{t("General._delete")}</Button>
          ) : (
            <Button disabled={loading} loading={loading} icon='delete' color='error' onClick={handleDelete}>{t("General._delete")}</Button>
>>>>>>> main
          )}
        </DialogActions>
      </Dialog>

      <Recaptcha ref={captchaRef} />
      <Browser open={browser} onClose={()=>setBrowser(false)} onSelected={handleSelectedImage} />
    </Header>
  )
}