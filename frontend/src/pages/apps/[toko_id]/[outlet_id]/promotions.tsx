// material
import { Box, Grid, Container, Typography,Tooltip,IconButton,TextField, Card, FormControlLabel, Switch,Checkbox,Table,TableHead,TableRow,TableBody,TableCell,TablePagination,CircularProgress,Stack,MenuItem,ListItemIcon,ListItemText, Autocomplete, AutocompleteChangeReason, AutocompleteInputChangeReason, FormControl, InputLabel, OutlinedInput, InputAdornment, FormLabel, Portal } from '@mui/material';
import {AddAPhoto,Create,Delete} from '@mui/icons-material'
import {LocalizationProvider, DateTimePicker} from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// components
import Header from '@comp/Header';
import Dashboard from '@layout/dashboard/index'
import React from 'react'
import useNotif from '@utils/notification'
import {useAPI} from '@utils/api'
import Button from '@comp/Button'
import Backdrop from '@comp/Backdrop'
import Image from '@comp/Image'
import Popover from '@comp/Popover'
import {Outlet,IPages,Product, Without, Promo, Nullable,File, CopyRequired} from '@type/index'
import wrapper from '@redux/store'
import {useTranslation} from 'next-i18next';
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
import { getDayJs, getOutletAccess, toFixed } from '@utils/Main';
import { Dayjs } from 'dayjs';
import { State,useSelector } from '@redux/index';
import Select,{SelectItem} from '@comp/Select';

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const SimpleMDE = dynamic(()=>import('@comp/SimpleMDE'))
const Browser = dynamic(()=>import('@comp/Browser'),{ssr:false})

export const getServerSideProps = wrapper({name:'check_outlet',outlet:{onlyMyToko:true,onlyAccess:['Promo']},translation:'dash_promo'})

type IInput = Nullable<Without<Promo,'outlet'|'id'>> 

interface FormProps {
  input: IInput,
  setInput(item: IInput): void
  loading: boolean
  openBrowser(): void
  autoFocus?:boolean,
  pOptions: Product[],
  pLoading: boolean,
  handleAutocompleteInputChange(e: React.SyntheticEvent<Element, Event>, value: string,reason: AutocompleteInputChangeReason): void
}
function Form({input,setInput,loading,openBrowser,autoFocus,pOptions,pLoading,handleAutocompleteInputChange}: FormProps) {
  const {t} = useTranslation('dash_promo');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const [edit,setEdit] = React.useState<Product | null>(null);
  const [dEdit,setDEdit] = React.useState(false)
  const [openAutocomplete,setOpenAutocomplete] = React.useState(false)
  const setNotif = useNotif();

  const [from_dayjs,to_dayjs] = React.useMemo(()=>{
    return [input.from ? getDayJs(input.from) : null,input.to ? getDayJs(input.to) : null]
  },[input.from,input.to])

  const handleChange=React.useCallback((name: keyof IInput)=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement> | string)=>{
    const val = typeof e === 'string' ? e : e?.target?.value;
    const isNum = ['amount'].includes(name);
    const isNull = ['description'].includes(name)
    if(isNum||isNull) {
      const value = val?.length > 0 ? (isNum ? Number.parseFloat(val) : val) : null;
      setInput({...input,[name]:value});
      return;
    }
    setInput({...input,[name]:val||null})
  },[input,setInput])

  const handleInputChange=React.useCallback((e: React.SyntheticEvent<Element, Event>, value: string,reason: AutocompleteInputChangeReason)=>{
    if(reason==='input') return handleAutocompleteInputChange(e,value,reason);
    else if(reason==='clear') {
      if(edit) {
        setEdit(null)
      }
    }
  },[handleAutocompleteInputChange,edit])

  const handleChecked = React.useCallback((name: keyof IInput)=>(e?: React.ChangeEvent<HTMLInputElement>)=>{
    setInput({...input,[name]:e?.target?.checked||false})
  },[input,setInput])

  const handleAutocomplete=React.useCallback((e: React.SyntheticEvent<Element, Event>, value: Product | null,reason: AutocompleteChangeReason)=>{
    if(value) {
      setEdit(value);
    }
  },[])

  const handleDateChange=React.useCallback((name:'from'|'to')=>(date: Dayjs|null)=>{
    if(date) {
      setInput({...input,[name]: date.toDate()})
    }
  },[input,setInput])

  const handleAddProducts = React.useCallback((e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    if(e?.stopPropagation) e?.stopPropagation();
    if(edit === null) return setNotif("Invalid products",true);

    const products = input.products||[];
    const i = products.findIndex(s=>s.id === edit.id);
    if(i >= 0) {
      products[i] = edit;
    } else {
      products.push(edit)
    }
    setInput({...input,products})
    setEdit(null);
    setDEdit(false)
  },[edit,input,setInput,setNotif])

  const handleDeleteProducts = React.useCallback((item: Product)=>()=>{
    const products = input.products||[];
    const i = products.findIndex(s=>s.id === item.id);
    if(i >= 0) {
      products.splice(i,1);
      setInput({...input,products})
    }
  },[input,setInput])

  const handleEditProducts = React.useCallback((item: Product)=>()=>{
    setEdit(item)
  },[])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch disabled={loading} checked={input.active||false} color="primary" onChange={handleChecked('active')} />
            }
            label={t("active")}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label={tCom("name_ctx",{what:tMenu("promo")})}
            value={input.name}
            onChange={handleChange('name')}
            required
            fullWidth
            autoFocus={autoFocus}
            placeholder='Spesial Hari Ulang Tahun...'
            disabled={loading}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Select
            label={t("type")}
            value={input.type}
            onChange={handleChange('type')}
            required
            fullWidth
            disabled={loading}
          >
            <SelectItem key={'fixed'} value={'fixed'}>{`Fixed`}</SelectItem>
            <SelectItem key={'percentage'} value={'percentage'}>{`Percentage`}</SelectItem>
          </Select>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label={t("amount")}
            value={input.amount||0}
            onChange={handleChange('amount')}
            required
            fullWidth
            helperText={input?.type === 'fixed' ? `Rp${numberFormat(`${input.amount||0}`)}` : `${input.amount}%`}
            type='number'
            inputProps={{min:0,step:'any'}}
            disabled={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DateTimePicker
            label={t('from')}
            ampm={false}
            inputFormat='DD MMM YYYY, HH:mm'
            value={from_dayjs}
            onChange={handleDateChange('from')}
            disablePast
            disabled={loading}
            renderInput={params=><TextField fullWidth required {...params} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DateTimePicker
            label={t('to')}
            ampm={false}
            inputFormat='DD MMM YYYY, HH:mm'
            value={to_dayjs}
            onChange={handleDateChange('to')}
            disablePast
            disabled={loading}
            renderInput={params=><TextField fullWidth required {...params} />}
            {...(from_dayjs ? {minDate:from_dayjs} : {})}
          />
        </Grid>
        
        <Grid item xs={12}>
          <div className='flex-header'>
            <FormLabel>{tMenu('product')}</FormLabel>
            <Button disabled={loading} size='small' color='inherit' onClick={()=>setDEdit(true)}>{tCom("add_ctx",{what:tMenu("product")})}</Button>
          </div>
          
          <Scrollbar>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="left">{tCom("name_ctx",{what:tMenu("product")})}</TableCell>
                  <TableCell align="right">{t("amount")}</TableCell>
                  <TableCell width='20%'></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(input?.products && input?.products?.length > 0) ? input?.products?.map(p=>{
                  const disc = input?.type === 'fixed' ? (input.amount||0) : toFixed((input.amount||0) / 100 * p.price);
                  const disc_str = `Rp${numberFormat(`${disc}`)}`

                  return (
                    <TableRow key={`table-product-${p.id}`}>
                      <TableCell align="left">{p.name}</TableCell>
                      <TableCell align="right">{disc_str}</TableCell>
                      <TableCell align='right'>
                        <Stack direction='row' spacing={2}>
                          <IconButton sx={{mr:1}} onClick={handleEditProducts(p)}>
                            <Create />
                          </IconButton>
                          <IconButton onClick={handleDeleteProducts(p)}>
                            <Delete />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                }) : (
                  <TableRow>
                    <TableCell colSpan={3} align='center'>No data</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Grid>

        <Grid item xs={12}>
          <SimpleMDE disabled={loading} value={input.description||''} image onChange={handleChange('description')} label={tCom("description")} />
        </Grid>
        
        <Grid item xs={12}>
          {input.image && input.image?.url ? (
            <Box padding={{sm:2,md:3,lg:5}} display='flex' alignItems='center' justifyContent='center'>
              <Image alt={tCom("image")} src={input.image.url} style={{maxWidth:300}} />
            </Box>
          ) : (
            <Box textAlign='center' padding={{sm:2,md:3,lg:5}}>
              <Typography>{tCom("no_what",{what:tCom("image")})}</Typography>
            </Box>
          )}
          <Box className='flex-header' pl={{sm:2,md:3,lg:5}} pr={{sm:2,md:3,lg:5}}>
            <Tooltip title={tCom("remove_ctx",{what:tCom("Geral.image")})}><IconButton disabled={(!(!!input.image) || loading)} sx={{color:'error.main'}} onClick={()=>setInput({...input,image:null})}><Delete /></IconButton></Tooltip>
            <Tooltip title={input.image ? tCom("change_ctx",{what:tCom("image")}) : tCom("add_ctx",{what:tCom("image")})}><IconButton disabled={loading} sx={{color:'primary.main'}} onClick={openBrowser}><AddAPhoto /></IconButton></Tooltip>
          </Box>
        </Grid>
      </Grid>

      <Portal>
        <Dialog maxWidth='sm' open={dEdit} handleClose={()=>{setDEdit(false),setEdit(null)}}>
          <form onSubmit={handleAddProducts}>
            <DialogTitle>{tMenu("product")}</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    value={edit}
                    clearOnBlur
                    clearOnEscape
                    onChange={handleAutocomplete}
                    onInputChange={handleInputChange}
                    options={pOptions}
                    getOptionLabel={o=>o.name}
                    loading={pLoading}
                    open={openAutocomplete}
                    onOpen={()=>setOpenAutocomplete(true)}
                    onClose={()=>setOpenAutocomplete(false)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={tMenu('product')}
                        variant="outlined"
                        fullWidth
                        required
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button text color='inherit' disabled={loading} onClick={()=>{setDEdit(false),setEdit(null)}}>{tCom("cancel")}</Button>
              <Button icon='add' type='submit'>{tCom("add")}</Button>
            </DialogActions>
          </form>
        </Dialog>
      </Portal>
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
          <ListItemText primary={tCom("del")} primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </MenuPopover>
    </>
  )
}

const DEFAULT_INPUT_IN: IInput = {
  name:'',
  amount:0,
  description:null,
  products: [],
  image:null,
  from: null,
  to:null,
  type:'fixed',
  active:false,
}
export default function OutletPromo({meta}: IPages<Outlet>) {
  const {t} = useTranslation('dash_promo');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const {post,del,put,get} = useAPI();
  const setNotif = useNotif();
  const {toko_id,outlet_id} = router.query;
  const locale = router.locale||'en';
  const {outlet} = useOutlet(outlet_id,{fallback:meta});
  const {page,rowsPerPage,...pagination} = usePagination(true);
  const [input,setInput] = React.useState<IInput>(DEFAULT_INPUT_IN);
  const [dCreate,setDCreate] = React.useState(false);
  const [dEdit,setDEdit] = React.useState<Promo|null>(null);
  const [dDelete,setDDelete] = React.useState<Promo|null|boolean>(null);
  const [loading,setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<Promo[]>([]);
  const {data,error,mutate} = useSWR<Promo,true>(`/promos/${outlet_id}?page=${page}&pageSize=${rowsPerPage}`);
  const [browser,setBrowser] = React.useState(false);
  const [pOptions,setPOption]=React.useState<Product[]>([]);
  const [pLoading,setPLoading] = React.useState(false);

  const handleSelectedImage=React.useCallback((image: File|null)=>{
    setInput(p=>({...p,image}))
  },[setInput])

  const handleDeletedImages = React.useCallback((dt: File)=>{
    if(input.image?.id == dt.id) setInput({...input,image:null})
  },[input])
  
  const handleSelectAllClick = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = data?.data||[]
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  },[data]);

  const handleSelect = React.useCallback((item: Promo) => () => {
    const items = [...selected];
    const selectedIndex = items.findIndex(i=>i.id === item.id)
    let newSelected: Promo[] = [];
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

  const buttonCreate=React.useCallback(()=>{
    setInput(DEFAULT_INPUT_IN);
    setDCreate(true)
  },[])

  const buttonEdit=React.useCallback((d: Promo)=>()=>{
    const {id:_,outlet:_a,...rest} = d;
    setInput({...rest});
    setDEdit(d);
  },[])

  const handleCreate=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...input,
        products:input?.products ? input?.products?.map(p=>p.id) : [],
        image: input?.image ? input?.image?.id : null
      }
      await post(`/promos/${outlet_id}`,data);
      mutate();
      setNotif(tCom("saved"),false)
      setDCreate(false)
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error_500"),true);
    } finally {
      setLoading(false);
    }
  },[input,setNotif,post,outlet_id,mutate,tCom])

  const handleEdit=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...input,
        products:input?.products ? input?.products?.map(p=>p.id) : [],
        image: input?.image ? input?.image?.id : null
      }
      await put(`/promos/${outlet_id}/${dEdit?.id}`,data);
      mutate();
      setNotif(tCom("saved"),false)
      setDEdit(null)
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error_500"),true);
    } finally {
      setLoading(false);
    }
  },[dEdit,input,setNotif,put,outlet_id,mutate,tCom])

  const handleDelete=React.useCallback(async()=>{
    if(typeof dDelete !== 'boolean' && dDelete && 'id' in dDelete) {
      setLoading(true);
      try {
        await del(`/promos/${outlet_id}/${dDelete?.id}`);
        mutate();
        setNotif(tCom("deleted"),false)
        setDDelete(null)
      } catch(e: any) {
        setNotif(e?.error?.message||tCom("error_500"),true);
      } finally {
        setLoading(false);
      }
    }
  },[dDelete,del,setNotif,outlet_id,mutate,tCom])

  const handleDeleteAll=React.useCallback(async()=>{
    if(typeof dDelete === 'boolean') {
      setLoading(true);
      try {
        const filters = selected.map(s=>s.id);
        await post(`/promos/${outlet_id}/bulk-delete`,{filters});
        mutate();
        setNotif(tCom("deleted"),false)
        setDDelete(null)
        setSelected([]);
      } catch(e: any) {
        setNotif(e?.error?.message||tCom("error_500"),true);
      } finally {
        setLoading(false);
      }
    }
  },[selected,post,setNotif,outlet_id,mutate,tCom,dDelete])

  const handleAutocompleteInputChange=React.useCallback((e: React.SyntheticEvent<Element, Event>, value: string,reason: AutocompleteInputChangeReason)=>{
    if(reason==='input') {
      const filter=pOptions.filter(item=>`${item.name}`.toLowerCase().indexOf(`${value}`.toLowerCase()) > -1);
      if(filter?.length === 0){
        setPLoading(true)
        get<Product,true>(`/products/${outlet_id}/cashier`,{
          params:{
            pageSize:15,
            filters:{
              name:{
                $contains: value
              },
            }
          }
        })
        .then((res)=>{
          let b=pOptions;
          const prevOption = Object.values(pOptions).map(o=>o.id);
          res?.data?.forEach((rs)=>{
            if(prevOption.indexOf(rs.id)===-1) b=b.concat(rs)
          })
          setPOption(res.data);
        }).catch((err)=>{
            
        }).finally(()=>setPLoading(false))
      }
    }
  },[pOptions,get,outlet_id])

  React.useEffect(()=>{
    if(pOptions.length === 0) {
      setPLoading(true)
      get<Product,true>(`/products/${outlet_id}/cashier`,{
        params:{
          pageSize:100,
        }
      })
      .then((res)=>{
        setPOption(res.data);
      }).catch((err)=>{
          
      }).finally(()=>setPLoading(false))
    }
  },[outlet_id,get,pOptions])

  useMousetrap(['+','shift+='],buttonCreate);

  return (
    <Header title={`${tMenu("promo")} - ${outlet?.data?.name}`} desc={outlet?.data?.description}>
      <Dashboard title={outlet?.data?.name} subtitle={outlet?.data?.toko?.name} view='dashboard promos'>
        <Container>
          <Box pb={2} mb={5}>
            <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
              <Typography variant="h3" component='h3'>{tMenu("promo")}</Typography>
              <Button icon='add' tooltip='+' disabled={!getOutletAccess(outlet?.data,'Promo')} onClick={buttonCreate}>{tCom("add_ctx",{what:tMenu("promo")})}</Button>
            </Stack>
          </Box>

          <Card>
            {selected.length > 0 && (
              <Box p={2} sx={{backgroundColor:'primary.lighter'}} className='flex-header'>
                <Typography sx={{color:'primary.main'}} variant='h6' component='h6'>{t("selected",{count:selected.length})}</Typography>
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
                    <TableCell align="left">{tCom("name_ctx",{what:tMenu("promo")})}</TableCell>
                    <TableCell>{t("amount")}</TableCell>
                    <TableCell>{t("from")}</TableCell>
                    <TableCell>{t("to")}</TableCell>
                    <TableCell>Status</TableCell>
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
                    <TableCell align="center" colSpan={7} sx={{ py: 3 }}><Typography>{error?.error.message}</Typography></TableCell>
                  </TableRow>
                ) : data?.data && data?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell align="center" colSpan={7} sx={{ py: 3 }}><Typography>{tCom("no_what",{what:tMenu("promo")})}</Typography></TableCell>
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
                      <TableCell>{`${d?.type} ${d?.type === 'percentage' ? `${d?.amount}%` : `Rp${numberFormat(`${d?.amount}`)}`}`}</TableCell>
                      <TableCell>{getDayJs(d?.from).locale(locale).pn_format('full')}</TableCell>
                      <TableCell>{getDayJs(d?.to).locale(locale).pn_format('full')}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" alignItems="center" justifyContent='center' spacing={2}>
                          <Label variant='filled' color={d.active ? 'success':'error'}>{d?.active ? t("active") : t("active",{context:'not'})}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <UserMenu onEdit={buttonEdit(d)} onDelete={()=>setDDelete(d)} allDisabled={!getOutletAccess(outlet?.data,'Promo')} />
                      </TableCell>
                    </TableRow>
                  )
                })}
                </TableBody>
              </Table>
            </Scrollbar>
            <TablePagination
              count={data?.meta?.pagination.pageCount||0}
              rowsPerPage={rowsPerPage}
              page={page-1}
              {...pagination}
            />
          </Card>
        </Container>
      </Dashboard>

      <Dialog loading={loading} maxWidth='md' open={dCreate} handleClose={()=>setDCreate(false)}>
        <form onSubmit={handleCreate}>
          <DialogTitle>{tCom("add_ctx",{what:tMenu("products")})}</DialogTitle>
          <DialogContent dividers>
            <Form input={input} setInput={setInput} loading={loading} openBrowser={()=>setBrowser(true)} pOptions={pOptions} pLoading={pLoading} handleAutocompleteInputChange={handleAutocompleteInputChange} />
          </DialogContent>
          <DialogActions>
            <Button text color='inherit' disabled={loading} onClick={()=>setDCreate(false)}>{tCom("cancel")}</Button>
            <Button disabled={loading} loading={loading} icon='submit' type='submit'>{tCom("save")}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog loading={loading} maxWidth='md' open={dEdit!==null} handleClose={()=>setDEdit(null)}>
        <form onSubmit={handleEdit}>
          <DialogTitle>{`Edit ${tMenu("products")}`}</DialogTitle>
          <DialogContent dividers>
            <Form autoFocus input={input} setInput={setInput} loading={loading} openBrowser={()=>setBrowser(true)} pOptions={pOptions} pLoading={pLoading} handleAutocompleteInputChange={handleAutocompleteInputChange} />
          </DialogContent>
          <DialogActions>
            <Button text color='inherit' disabled={loading} onClick={()=>setDEdit(null)}>{tCom("cancel")}</Button>
            <Button disabled={loading} loading={loading} icon='submit' type='submit'>{tCom("save")}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog maxWidth='xs' loading={loading} open={dDelete!==null} handleClose={()=>setDDelete(null)} fullScreen={false}>
        <DialogTitle>{tCom("are_you_sure")}</DialogTitle>
        <DialogActions>
          <Button disabled={loading} text color='inherit' onClick={()=>setDDelete(null)}>{tCom("cancel")}</Button>
          {typeof dDelete === 'boolean' ? (
            <Button disabled={loading} loading={loading} icon='delete' color='error' onClick={handleDeleteAll}>{tCom("del")}</Button>
          ) : (
            <Button disabled={loading} loading={loading} icon='delete' color='error' onClick={handleDelete}>{tCom("del")}</Button>
          )}
        </DialogActions>
      </Dialog>

      <Browser open={browser} onClose={()=>setBrowser(false)} onSelected={handleSelectedImage} onDeleted={handleDeletedImages} />
    </Header>
  )
}