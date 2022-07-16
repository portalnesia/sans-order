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
import {useAPI} from '@utils/api'
import Button from '@comp/Button'
import Backdrop from '@comp/Backdrop'
import Image from '@comp/Image'
import Popover from '@comp/Popover'
import {Outlet,IPages,Product, Without, Stock, Ingredient, Nullable} from '@type/index'
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

export const getServerSideProps = wrapper({name:'check_outlet',outlet:{onlyMyToko:true,onlyAccess:['Stock']},translation:'dash_product'})

type IInputStocks = Nullable<Without<Stock,'item'|'outlet'|'id'|'timestamp'>> & ({item: string|number,timestamp?:Date})

interface FormProps {
  input: IInputStocks,
  setInput(item: IInputStocks): void
  loading?: boolean
  autoFocus?:boolean
  ingOptions: Ingredient[],
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
    return getDayJs();
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

  const handleAutocomplete=React.useCallback((e: React.SyntheticEvent<Element, Event>, value: Ingredient | null,reason: AutocompleteChangeReason)=>{
    if(value) {
      setInput({...input,item:value.id})
    }
  },[input])

  const handleDateChange=React.useCallback((date: Dayjs|null)=>{
    if(date) {
      setInput({...input,timestamp: date.toDate()})
    }
  },[input])

  const valueAutoComplete = React.useMemo(()=>{
    let val: Ingredient|null = null;
    if(input.item) {
      const a = ingOptions.find(s=>s.id === input.item)
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
              onChange={handleChange('stocks')}
              value={input.stocks}
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
  item:'',
  price:0,
  stocks: 0,
  type:'in',
}

export default function OutletStocks({meta}: IPages<Outlet>) {
  const {t} = useTranslation('dash_product');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const {post,del,put,get} = useAPI();
  const setNotif = useNotif();
  const {toko_id,outlet_id} = router.query;
  const locale = router.locale||'en';
  const {outlet} = useOutlet(outlet_id,{fallback:meta});
  const {page,rowsPerPage,...pagination} = usePagination(true);
  const [input,setInput] = React.useState<IInputStocks>(DEFAULT_INPUT_IN);
  const [dCreate,setDCreate] = React.useState(false);
  const [dEdit,setDEdit] = React.useState<Stock|null>(null);
  const [dDelete,setDDelete] = React.useState<Stock|null|boolean>(null);
  const [loading,setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<Stock[]>([]);
  const {data,error,mutate} = useSWR<Stock,true>(`/stocks/${outlet_id}?page=${page}&pageSize=${rowsPerPage}`);
  const [ingOptions,setIngOption]=React.useState<Ingredient[]>([]);
  const [ingLoading,setIngLoading] = React.useState(false);

  const buttonCreate=React.useCallback(()=>{
    setInput(DEFAULT_INPUT_IN);
    setDCreate(true)
  },[])

  const buttonEdit=React.useCallback((d: Stock)=>()=>{
    const {id:_,item,outlet:_a,...rest} = d;
    setInput({item:item?.id||0,...rest});
    setDEdit(d);
  },[])

  const handleCreate=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      await post(`/stocks/${outlet_id}`,{...input,item:Number(input.item)});
      mutate();
      setNotif(tCom("saved"),false)
      setDCreate(false)
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error_500"),true);
    } finally {
      setLoading(false);
    }
  },[input,setNotif,post,toko_id,outlet_id,mutate,tCom])

  const handleEdit=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      await put(`/stocks/${outlet_id}/${dEdit?.id}`,{...input,item:Number(input.item)});
      mutate();
      setNotif(tCom("saved"),false)
      setDEdit(null)
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error_500"),true);
    } finally {
      setLoading(false);
    }
  },[dEdit,input,setNotif,put,toko_id,outlet_id,mutate])

  const handleAutocompleteInputChange=React.useCallback((e: React.SyntheticEvent<Element, Event>, value: string,reason: AutocompleteInputChangeReason)=>{
    if(reason==='input') {
      const filter=ingOptions.filter(item=>`${item.name}`.toLowerCase().indexOf(`${value}`.toLowerCase()) > -1);
      if(filter?.length === 0){
        setIngLoading(true)
        get<Ingredient,true>(`/ingredients/${outlet_id}`,{
          params:{
            pageSize:15,
            filters:{
              name:{
                $contains: value
              }
            }
          }
        })
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
      setInput({...input,item:''})
    }
  },[ingOptions,input])

  React.useEffect(()=>{
    if(ingOptions.length === 0) {
      setIngLoading(true)
      get<Ingredient,true>(`/ingredients/${outlet_id}`,{
        params:{
          pageSize:100,
        }
      })
      .then((res)=>{
        setIngOption(res.data);
      }).catch((err)=>{
          
      }).finally(()=>setIngLoading(false))
    }
  },[toko_id,outlet_id,get,ingOptions])

  useMousetrap(['+','shift+='],buttonCreate);

  return (
    <Header title={`${tMenu("stock")} - ${outlet?.data?.name}`} desc={outlet?.data?.description}>
      <Dashboard title={outlet?.data?.name} subtitle={outlet?.data?.toko?.name} view='dashboard stocks'>
        <Container>
          <Box pb={2} mb={5}>
            <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
              <Typography variant="h3" component='h3'>{tMenu("stock")}</Typography>
              <Button icon='add' tooltip='+' disabled={!getOutletAccess(outlet?.data,'Stock')} onClick={buttonCreate}>{tCom("add_ctx",{what:tMenu("stock")})}</Button>
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
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}><Typography>{error?.error.message}</Typography></TableCell>
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
                        <TableCell>{d?.item?.name}</TableCell>
                        <TableCell>{getDayJs(d?.timestamp).locale(locale).pn_format('full')}</TableCell>
                        <TableCell>{d?.type === 'in' ? t('stock_in') : d?.type === 'out' ? t('stock_out') : ''}</TableCell>
                        <TableCell sx={{whiteSpace:'nowrap'}}>{`IDR ${numberFormat(`${d.price}`)}`}</TableCell>
                        <TableCell>{`${d?.stocks} ${d?.item?.unit}`}</TableCell>
                        <TableCell>
                          {d?.type === 'in' && <UserMenu onEdit={buttonEdit(d)} allDisabled={!getOutletAccess(outlet?.data,'Stock')} />}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Scrollbar>
            <TablePagination
              count={data?.meta.pagination.pageCount||0}
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
    </Header>
  )
}