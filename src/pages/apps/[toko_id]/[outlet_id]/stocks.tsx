// material
import { Box, Grid, Container, Typography,Tooltip,IconButton,TextField, Card, FormControlLabel, Switch,Checkbox,Table,TableHead,TableRow,TableBody,TableCell,TablePagination,CircularProgress,Stack,MenuItem,ListItemIcon,ListItemText, Autocomplete, AutocompleteChangeReason, AutocompleteInputChangeReason, FormControl, InputLabel, OutlinedInput, InputAdornment } from '@mui/material';
import {AddAPhoto,Delete} from '@mui/icons-material'
import {LocalizationProvider, DateTimePicker} from '@mui/lab'
import AdapterDayjs from '@mui/lab/AdapterDayjs'
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
import {IOutlet,IPages,ResponsePagination,IProduct, Without, IStocks, IIngredients} from '@type/index'
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
import { getDayJs, getOutletAccess } from '@utils/Main';
import { Dayjs } from 'dayjs';

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const SimpleMDE = dynamic(()=>import('@comp/SimpleMDE'))
const Browser = dynamic(()=>import('@comp/Browser'),{ssr:false})

export const getServerSideProps = wrapper({name:'check_outlet',outlet:{onlyMyToko:true,onlyAccess:['stocks']},translation:'dash_product'})

type IInputStocks = Without<IStocks,'items'|'id'|'timestamp'> & ({item_id: string|number,timestamp?:number})

interface FormProps {
  input: IInputStocks,
  setInput(item: IInputStocks): void
  loading?: boolean
  autoFocus?:boolean
  ingOptions: IIngredients[],
  ingLoading: boolean,
  handleAutocompleteInputChange(e: React.SyntheticEvent<Element, Event>, value: string,reason: AutocompleteInputChangeReason): void
}

function Form({input,setInput,loading,autoFocus,ingOptions,ingLoading,handleAutocompleteInputChange}: FormProps) {
  const {t} = useTranslation('dash_product');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const [edit,setEdit] = React.useState<number | null>(null);
  const [openAutocomplete,setOpenAutocomplete] = React.useState(false)

  const timestamp = React.useMemo(()=>{
    if(input.timestamp) return getDayJs(input.timestamp);
    return null;
  },[input])

  const handleChange=React.useCallback((name: keyof IInputStocks)=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement> | string)=>{
    const val = typeof e === 'string' ? e : e?.target?.value;
    const isNum = ['price','stock'].includes(name);
    const isNull = ['description'].includes(name);
    if(isNum||isNull) {
      const value = val?.length > 0 ? (isNum ? Number(val) : val) : null;
      setInput({...input,[name]:value});
      return;
    }
    setInput({...input,[name]:val||null});
  },[input])

  const handleAutocomplete=React.useCallback((e: React.SyntheticEvent<Element, Event>, value: IIngredients | null,reason: AutocompleteChangeReason)=>{
    if(value) {
      setInput({...input,item_id:value.id})
    }
  },[input])

  const handleDateChange=React.useCallback((date: Dayjs|null)=>{
    if(date) {
      setInput({...input,timestamp: date.unix()})
    }
  },[input])

  const valueAutoComplete = React.useMemo(()=>{
    let val: IIngredients|null = null;
    if(input.item_id) {
      const a = ingOptions.find(s=>s.id === input.item_id)
      if(a) val = a;
    }
    return val;
  },[ingOptions,input])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Autocomplete
            value={valueAutoComplete}
            clearOnBlur
            clearOnEscape
            onChange={handleAutocomplete}
            onInputChange={handleAutocompleteInputChange}
            options={ingOptions}
            getOptionLabel={o=>o.name}
            loading={ingLoading}
            open={openAutocomplete}
            disabled={loading}
            onOpen={()=>setOpenAutocomplete(true)}
            onClose={()=>setOpenAutocomplete(false)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={tMenu('ingredient')}
                variant="outlined"
                fullWidth
                required
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={t("price_ctx",{what:t("purchase")})}
            value={input.price||0}
            onChange={handleChange('price')}
            required
            fullWidth
            type='number'
            disabled={loading}
            placeholder='10000'
            helperText={`IDR ${numberFormat(`${input.price||0}`)}`}
            inputProps={{min:0}}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl variant='outlined' disabled={loading} fullWidth>
            <InputLabel htmlFor='stock-in'>{t("stock_in")}</InputLabel>
            <OutlinedInput
              label={t("stock_in")}
              id='stock-in'
              type='number'
              placeholder='5'
              onChange={handleChange('stock')}
              value={input.stock}
              inputProps={{min:0,step:'any'}}
              endAdornment={ valueAutoComplete ?
                <InputAdornment position='end'>
                  <Typography>{valueAutoComplete?.unit}</Typography>
                </InputAdornment>
                : undefined
              }
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <DateTimePicker
            label="Timestamp"
            ampm={false}
            inputFormat='DD MMM YYYY, HH:mm'
            value={timestamp}
            onChange={handleDateChange}
            disableFuture
            disabled={loading}
            renderInput={params=><TextField fullWidth {...params} />}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  )
}

interface UserMenu {
  onEdit(): void,
  editDisabled?: boolean,
  allDisabled?:boolean
}

function UserMenu({onEdit,editDisabled,allDisabled}: UserMenu) {
  const ref=React.useRef(null);
  const [open,setOpen] = React.useState(false);

  const handleClick=React.useCallback((type:'edit'|'delete')=>(_e: React.MouseEvent<HTMLLIElement>)=>{
    setOpen(false)
    if(type === 'edit') onEdit();
  },[onEdit])

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
      </MenuPopover>
    </>
  )
}

const DEFAULT_INPUT_IN: IInputStocks = {
  item_id:'',
  price:0,
  stock: 0,
  type:'in',
}

export default function OutletStocks({meta}: IPages) {
  const {t} = useTranslation('dash_product');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const {post,del,put,get} = useAPI();
  const setNotif = useNotif();
  const {toko_id,outlet_id} = router.query;
  const locale = router.locale||'en';
  const {outlet} = useOutlet(toko_id,outlet_id);
  const {page,rowsPerPage,...pagination} = usePagination(true);
  const [input,setInput] = React.useState<IInputStocks>(DEFAULT_INPUT_IN);
  const [dCreate,setDCreate] = React.useState(false);
  const [dEdit,setDEdit] = React.useState<IStocks|null>(null);
  const [dDelete,setDDelete] = React.useState<IStocks|null|boolean>(null);
  const [loading,setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<IStocks[]>([]);
  const {data,error,mutate} = useSWR<ResponsePagination<IStocks>>(`/sansorder/toko/${toko_id}/${outlet_id}/stocks?page=${page}&per_page=${rowsPerPage}`);
  const [ingOptions,setIngOption]=React.useState<IIngredients[]>([]);
  const [ingLoading,setIngLoading] = React.useState(false);
  const captchaRef = React.useRef<Recaptcha>(null);

  const buttonCreate=React.useCallback(()=>{
    setInput(DEFAULT_INPUT_IN);
    setDCreate(true)
  },[])

  const buttonEdit=React.useCallback((d: IStocks)=>()=>{
    const {id:_,items,...rest} = d;
    setInput({item_id:items.id,...rest});
    setDEdit(d);
  },[])

  const handleCreate=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const recaptcha = await captchaRef.current?.execute();
      await post(`/sansorder/toko/${toko_id}/${outlet_id}/stocks`,{...input,item_id:Number(input.item_id),recaptcha});
      mutate();
      setNotif(tCom("saved"),false)
      setDCreate(false)
    } catch(e: any) {
      setNotif(e?.message||tCom("error_500"),true);
    } finally {
      setLoading(false);
    }
  },[input,setNotif,post,toko_id,outlet_id,mutate,tCom])

  const handleEdit=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const recaptcha = await captchaRef.current?.execute();
      await put(`/sansorder/toko/${toko_id}/${outlet_id}/stocks/${dEdit?.id}`,{...input,item_id:Number(input.item_id),recaptcha});
      mutate();
      setNotif(tCom("saved"),false)
      setDEdit(null)
    } catch(e: any) {
      setNotif(e?.message||tCom("error_500"),true);
    } finally {
      setLoading(false);
    }
  },[dEdit,input,setNotif,put,toko_id,outlet_id,mutate])

  const handleAutocompleteInputChange=React.useCallback((e: React.SyntheticEvent<Element, Event>, value: string,reason: AutocompleteInputChangeReason)=>{
    if(reason==='input') {
      const filter=ingOptions.filter(item=>`${item.name}`.toLowerCase().indexOf(`${value}`.toLowerCase()) > -1);
      if(filter?.length === 0){
        setIngLoading(true)
        get<ResponsePagination<IIngredients>>(`/sansorder/toko/${toko_id}/${outlet_id}/ingredients?per_page=15&q=${encodeURIComponent(`${value}`)}`)
        .then((res)=>{
          let b=ingOptions;
          const prevOption = Object.values(ingOptions).map(o=>o.id);
          res?.data?.forEach((rs)=>{
            if(prevOption.indexOf(rs.id)===-1) b=b.concat(rs)
          })
          setIngOption(res.data);
        }).catch((err)=>{
            
        }).finally(()=>setIngLoading(false))
      }
    }
    else if(reason==='clear') {
      setInput({...input,item_id:''})
    }
  },[ingOptions,input])

  React.useEffect(()=>{
    if(ingOptions.length === 0) {
      setIngLoading(true)
      get<ResponsePagination<IIngredients>>(`/sansorder/toko/${toko_id}/${outlet_id}/ingredients?per_page=100`)
      .then((res)=>{
        setIngOption(res.data);
      }).catch((err)=>{
          
      }).finally(()=>setIngLoading(false))
    }
  },[toko_id,outlet_id,get,ingOptions])

  useMousetrap(['+','shift+='],buttonCreate);

  return (
    <Header title={`${tMenu("stock")} - ${meta?.title}`} desc={meta?.description}>
      <Dashboard title={meta?.title} subtitle={meta?.toko_name} view='dashboard stocks'>
        <Container>
          <Box pb={2} mb={5}>
            <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
              <Typography variant="h3" component='h3'>{tMenu("stock")}</Typography>
              <Button icon='add' tooltip='+' disabled={!getOutletAccess(outlet,'stocks')} onClick={buttonCreate}>{tCom("add_ctx",{what:tMenu("stock")})}</Button>
            </Stack>
          </Box>

          <Card>
            <Scrollbar>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">{tCom("name_ctx",{what:tMenu("ingredient")})}</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>{tCom("type")}</TableCell>
                    <TableCell>{t("price")}</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell align="center" width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!data && !error ? (
                    <TableRow>
                    <TableCell align="center" colSpan={6} sx={{ py: 3 }}><CircularProgress size={30} /></TableCell>
                  </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}><Typography>{error?.message}</Typography></TableCell>
                    </TableRow>
                  ) : data?.data && data?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}><Typography>{tCom("no_what",{what:tMenu("stock")})}</Typography></TableCell>
                    </TableRow>
                  ) : data?.data?.map((d)=>{
                    return (
                      <TableRow
                        hover
                        key={`product-${d.id}`}
                        tabIndex={-1}
                        role="checkbox"
                      >
                        <TableCell>{d?.items?.name}</TableCell>
                        <TableCell>{getDayJs(d?.timestamp).locale(locale).pn_format('full')}</TableCell>
                        <TableCell>{d?.type === 'in' ? t('stock_in') : d?.type === 'out' ? t('stock_out') : ''}</TableCell>
                        <TableCell sx={{whiteSpace:'nowrap'}}>{`IDR ${numberFormat(`${d.price}`)}`}</TableCell>
                        <TableCell>{`${d?.stock} ${d?.items?.unit}`}</TableCell>
                        <TableCell>
                          {d?.type === 'in' && <UserMenu onEdit={buttonEdit(d)} allDisabled={!getOutletAccess(outlet,'stocks')} />}
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
          <DialogTitle>{tCom("add_ctx",{what:tMenu("stock")})}</DialogTitle>
          <DialogContent dividers>
            <Form input={input} setInput={setInput} loading={loading} ingOptions={ingOptions} ingLoading={ingLoading} handleAutocompleteInputChange={handleAutocompleteInputChange} />
          </DialogContent>
          <DialogActions>
            <Button text color='inherit' disabled={loading} onClick={()=>setDCreate(false)}>{tCom("cancel")}</Button>
            <Button disabled={loading} loading={loading} icon='submit' type='submit'>{tCom("save")}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog loading={loading} maxWidth='md' open={dEdit!==null} handleClose={()=>setDEdit(null)}>
        <form onSubmit={handleEdit}>
          <DialogTitle>{`Edit ${tMenu("stock")}`}</DialogTitle>
          <DialogContent dividers>
            <Form input={input} setInput={setInput} loading={loading} ingOptions={ingOptions} ingLoading={ingLoading} handleAutocompleteInputChange={handleAutocompleteInputChange} />
          </DialogContent>
          <DialogActions>
            <Button text color='inherit' disabled={loading} onClick={()=>setDEdit(null)}>{tCom("cancel")}</Button>
            <Button disabled={loading} loading={loading} icon='submit' type='submit'>{tCom("save")}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Recaptcha ref={captchaRef} />
    </Header>
  )
}