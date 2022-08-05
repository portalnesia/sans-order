// material
import { Box, Grid, Container, Typography,Tooltip,IconButton,TextField, Card, FormControlLabel, Switch,Checkbox,Table,TableHead,TableRow,TableBody,TableCell,TablePagination,CircularProgress,Stack,MenuItem,ListItemIcon,ListItemText, Autocomplete, AutocompleteChangeReason, AutocompleteInputChangeReason, FormControl, InputLabel, OutlinedInput, InputAdornment } from '@mui/material';
import {AddAPhoto,Close,Delete} from '@mui/icons-material'
import {LocalizationProvider, DateTimePicker} from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// components
import Header from '@comp/Header';
import Dashboard from '@layout/dashboard/index'
import React from 'react'
import useNotif from '@utils/notification'
import {useAPI} from '@utils/api'
import Button from '@comp/Button'
import {Outlet,IPages,Product, Without, Stock, Ingredient, Nullable, Transaction, colorOrderStatus, colorStatus} from '@type/index'
import wrapper from '@redux/store'
import {useTranslation} from 'next-i18next';
import useSWR from '@utils/swr';
import { useRouter } from 'next/router';
import Iconify from '@comp/Iconify';
import MenuPopover from '@comp/MenuPopover'
import useOutlet from '@utils/useOutlet'
import Scrollbar from '@comp/Scrollbar'
import {useMousetrap} from '@utils/useKeys'
import usePagination from '@comp/TablePagination'
import dynamic from 'next/dynamic'
import { numberFormat } from '@portalnesia/utils';
import { getDayJs, getOutletAccess } from '@utils/Main';
import { Dayjs } from 'dayjs';
import { State,useSelector } from '@redux/index';
import Select, { SelectItem } from '@comp/Select';
import QueryString from 'qs';

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))

export const getServerSideProps = wrapper({name:'check_outlet',outlet:{onlyMyToko:true,onlyAccess:['Stock']},translation:'dash_product'})

type IInputStocks = Nullable<Without<Stock,'outlet'|'id'|'timestamp'>> & ({timestamp?:Date})

interface FormProps {
  input: IInputStocks,
  setInput(item: IInputStocks): void
  loading?: boolean
  autoFocus?:boolean
  ingOptions: Ingredient[],
  ingLoading: boolean,
  outlet?: Outlet,
  edit?: boolean
  handleAutocompleteInputChange(e: React.SyntheticEvent<Element, Event>, value: string,reason: AutocompleteInputChangeReason): void
}

function Form({input,setInput,loading,ingOptions,ingLoading,edit,outlet,handleAutocompleteInputChange}: FormProps) {
  const {t} = useTranslation('dash_product');
  const {t:tMenu} = useTranslation('menu');
  const user = useSelector<State['user']>(s=>s.user);
  const [openAutocomplete,setOpenAutocomplete] = React.useState(false)

  const timestamp = React.useMemo(()=>{
    if(input.timestamp) return getDayJs(input.timestamp);
    return getDayJs();
  },[input])

  const canEdit = React.useMemo(()=>{
    return !!(!edit || user && outlet && outlet?.toko?.user?.id == user?.id)
  },[outlet,user,edit])

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
  },[input,setInput])

  const handleAutocomplete=React.useCallback((e: React.SyntheticEvent<Element, Event>, value: Ingredient | null)=>{
    if(value) {
      setInput({...input,item:value})
    }
  },[input,setInput])

  const handleDateChange=React.useCallback((date: Dayjs|null)=>{
    if(date) {
      setInput({...input,timestamp: date.toDate()})
    }
  },[input,setInput])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Autocomplete
            value={input?.item}
            clearOnBlur
            clearOnEscape
            onChange={handleAutocomplete}
            onInputChange={handleAutocompleteInputChange}
            options={ingOptions}
            getOptionLabel={o=>o.name}
            loading={ingLoading}
            open={openAutocomplete}
            disabled={loading||!canEdit}
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
            disabled={loading||!canEdit}
            placeholder='10000'
            helperText={`Rp${numberFormat(`${input.price||0}`)}`}
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
              value={input.stocks||!canEdit}
              inputProps={{min:0,step:'any'}}
              endAdornment={ input?.item ?
                <InputAdornment position='end'>
                  <Typography>{input?.item?.unit}</Typography>
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
            renderInput={params=><TextField required fullWidth {...params} />}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  )
}

interface UserMenu {
  onEdit(): void,
  editDisabled?: boolean,
  allDisabled?:boolean,
  type: 'in'|'out',
  onDetail(): void
}

function UserMenu({onEdit,editDisabled,allDisabled,type,onDetail}: UserMenu) {
  const ref=React.useRef(null);
  const [open,setOpen] = React.useState(false);

  const handleClick=React.useCallback((type:'edit'|'detail')=>(_e: React.MouseEvent<HTMLLIElement>)=>{
    setOpen(false)
    if(type === 'edit') onEdit();
    if(type === 'detail') onDetail();
  },[onEdit,onDetail])

  return (
    <>
      <IconButton ref={ref} onClick={() => setOpen(true)}>
        <Iconify icon="eva:more-vertical-fill" width={20} height={20} />
      </IconButton>

      <MenuPopover open={open} onClose={()=>setOpen(false)} anchorEl={ref.current} paperSx={{py:1}}>
        <MenuItem disabled={!!editDisabled||!!allDisabled} sx={{ color: 'text.secondary',py:1 }} onClick={handleClick('detail')}>
          <ListItemIcon>
            <Iconify icon="ep:warning" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Detail" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
        {type === 'in' && (
          <MenuItem disabled={!!editDisabled||!!allDisabled} sx={{ color: 'text.secondary',py:1 }} onClick={handleClick('edit')}>
            <ListItemIcon>
              <Iconify icon="eva:edit-fill" width={24} height={24} />
            </ListItemIcon>
            <ListItemText primary="Edit" primaryTypographyProps={{ variant: 'body2' }} />
          </MenuItem>
        )}
      </MenuPopover>
    </>
  )
}

function StockDetail({stock}: {stock: Stock|null}) {
  const {t} = useTranslation('dash_product');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const locale = router.locale||'en';

  if(!stock) return null;

  const transaction = stock.transaction as Transaction
  const product = stock.product as Product

  return (
    <Box sx={{m:1}}>
      <Box sx={{mb:4}}>
        <Typography paragraph variant='h6' component='h6'>{tMenu('stock')}</Typography>
        <Table>
          <TableBody>
            <TableRow hover>
              <TableCell sx={{borderBottom:'unset',py:1}}>{tCom('type')}</TableCell>
              <TableCell sx={{borderBottom:'unset',py:1}}>{stock?.type === 'in' ? t('stock_in') : stock?.type === 'out' ? t('stock_out') : ''}</TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell sx={{borderBottom:'unset',py:1}}>{tMenu('ingredient')}</TableCell>
              <TableCell sx={{borderBottom:'unset',py:1}}>{stock.item?.name}</TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell sx={{borderBottom:'unset',py:1}}>{'Timestamp'}</TableCell>
              <TableCell sx={{borderBottom:'unset',py:1}}>{getDayJs(stock?.timestamp).locale(locale).pn_format('full')}</TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell sx={{borderBottom:'unset',py:1}}>{'Stock'}</TableCell>
              <TableCell sx={{borderBottom:'unset',py:1}}>{`${stock?.stocks} ${stock?.item?.unit}`}</TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell sx={{borderBottom:'unset',py:1}}>{t('price')}</TableCell>
              <TableCell sx={{borderBottom:'unset',py:1}}>{stock?.type === 'in' ? `Rp${numberFormat(`${stock.price}`)}` : '-'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
      {stock?.transaction?.uid && (
        <Box sx={{mb:4}}>
          <Typography paragraph variant='h6' component='h6'>{tMenu('transactions')}</Typography>
          <Table>
            <TableBody>
              <TableRow hover>
                <TableCell sx={{borderBottom:'unset',py:1}}>{'ID'}</TableCell>
                <TableCell sx={{borderBottom:'unset',py:1}}>{transaction.uid}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell sx={{borderBottom:'unset',py:1}}>{tCom("type")}</TableCell>
                <TableCell sx={{borderBottom:'unset',py:1}}>{transaction.type.toUpperCase()}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell sx={{borderBottom:'unset',py:1}}>{t("payment_method")}</TableCell>
                <TableCell sx={{borderBottom:'unset',py:1}}>{transaction.payment}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell sx={{borderBottom:'unset',py:1}}>{t("payment_status")}</TableCell>
                <TableCell sx={{borderBottom:'unset',py:1}}>{transaction.status}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell sx={{borderBottom:'unset',py:1}}>{t("order_status")}</TableCell>
                <TableCell sx={{borderBottom:'unset',py:1}}>{transaction.order_status}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell sx={{borderBottom:'unset',py:1}}>{'Subtotal'}</TableCell>
                <TableCell sx={{borderBottom:'unset',py:1}}>{`Rp${numberFormat(`${transaction.subtotal}`)}`}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell sx={{borderBottom:'unset',py:1}}>{t('discount')}</TableCell>
                <TableCell sx={{borderBottom:'unset',py:1}}>{`Rp${numberFormat(`${transaction.discount}`)}`}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell sx={{borderBottom:'unset',py:1}}>{'Total'}</TableCell>
                <TableCell sx={{borderBottom:'unset',py:1}}>{`Rp${numberFormat(`${transaction.total}`)}`}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      )}
      {stock?.product?.id && (
        <Box sx={{mb:4}}>
          <Typography paragraph variant='h6' component='h6'>{tMenu('product')}</Typography>
          <Table>
            <TableBody>
              <TableRow hover>
                <TableCell sx={{borderBottom:'unset',py:1}}>{tCom('name')}</TableCell>
                <TableCell sx={{borderBottom:'unset',py:1}}>{product.name}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell sx={{borderBottom:'unset',py:1}}>{t("price")}</TableCell>
                <TableCell sx={{borderBottom:'unset',py:1}}>{`Rp${numberFormat(`${product.price}`)}`}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell sx={{borderBottom:'unset',py:1}}>HPP</TableCell>
                <TableCell sx={{borderBottom:'unset',py:1}}>{`Rp${numberFormat(`${product.hpp||'0'}`)}`}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  )
}

const DEFAULT_INPUT_IN: IInputStocks = {
  item:null,
  price:0,
  stocks: 0,
  type:'in',
}
type IFilter = 'stock_in'|'stock_out'|'none'

export default function OutletStocks({meta}: IPages<Outlet>) {
  const {t} = useTranslation('dash_product');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const {post,put,get} = useAPI();
  const setNotif = useNotif();
  const {toko_id,outlet_id} = router.query;
  const locale = router.locale||'en';
  const {outlet} = useOutlet(outlet_id,{fallback:meta});
  const {page,rowsPerPage,...pagination} = usePagination(true);
  const [input,setInput] = React.useState<IInputStocks>(DEFAULT_INPUT_IN);
  const [dCreate,setDCreate] = React.useState(false);
  const [dEdit,setDEdit] = React.useState<Stock|null>(null);
  const [loading,setLoading] = React.useState(false);
  const [dDetail,setDDetail] = React.useState<Stock|null>(null)
  const [dFilter,setDFilter] = React.useState(false);
  const [filter,setFilter] = React.useState<string>('none');
  const [filterQuery,setFilterQuery] = React.useState<string|null>(null)
  const {data,error,mutate} = useSWR<Stock,true>(`/stocks/${outlet_id}?page=${page}&pageSize=${rowsPerPage}${filterQuery ? `&${filterQuery}` : ''}`);
  const [ingOptions,setIngOption]=React.useState<Ingredient[]>([]);
  const [ingLoading,setIngLoading] = React.useState(false);

  const filterRef = React.useRef(null)

  const handleFilter = React.useCallback((value: 'stock_in'|'stock_out'|'none')=>()=>{
    setFilter(value);
    if(['stock_in','stock_out'].includes(value)) {
      const type = value.replace('stock_','');
      setFilterQuery(QueryString.stringify({
        filters:{
          type
        }
      }))
    }
    else setFilterQuery(null);
    setDFilter(false)
  },[])

  const buttonCreate=React.useCallback(()=>{
    setInput(DEFAULT_INPUT_IN);
    setDCreate(true)
  },[])

  const buttonEdit=React.useCallback((d: Stock)=>()=>{
    const {id:_,item,outlet:_a,...rest} = d;
    setInput({item,...rest});
    setDEdit(d);
  },[])

  const handleCreate=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      if(!input?.item) return setNotif(tCom("error_empty",{what:tMenu('ingredient')}),true);
      await post(`/stocks/${outlet_id}`,{...input,item:input.item?.id});
      mutate();
      setNotif(tCom("saved"),false)
      setDCreate(false)
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error_500"),true);
    } finally {
      setLoading(false);
    }
  },[input,setNotif,post,outlet_id,mutate,tCom,tMenu])

  const handleEdit=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      if(!input?.item) return setNotif(tCom("error_empty",{what:tMenu('ingredient')}),true);
      await put(`/stocks/${outlet_id}/${dEdit?.id}`,{...input,item:input.item?.id});
      mutate();
      setNotif(tCom("saved"),false)
      setDEdit(null)
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error_500"),true);
    } finally {
      setLoading(false);
    }
  },[dEdit,input,setNotif,put,outlet_id,mutate,tCom,tMenu])

  const handleDetail = React.useCallback((s: Stock)=>()=>{
    setDDetail(s)
  },[])

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
        }).catch(()=>{
            
        }).finally(()=>setIngLoading(false))
      }
    }
    else if(reason==='clear') {
      setInput({...input,item:null})
    }
  },[ingOptions,input,get,outlet_id])

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
      }).catch(()=>{
          
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
            <Box p={2}>
              <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
                <Button startIcon={<Iconify icon='akar-icons:filter' />} text color='inherit' ref={filterRef} onClick={()=>setDFilter(true)}>Filter</Button>
              </Stack>
              <MenuPopover open={dFilter} onClose={()=>setDFilter(false)} anchorEl={filterRef.current} paperSx={{py:1,width:250}}>
                <MenuItem sx={{ color: 'text.secondary',py:1 }} onClick={handleFilter('none')} selected={filter===null}>
                  <ListItemText primary='None' />
                </MenuItem>
                <MenuItem sx={{ color: 'text.secondary',py:1 }}  onClick={handleFilter('stock_in')} selected={filter==='stock_in'}>
                  <ListItemText primary={t("stock_in")} />
                </MenuItem>
                <MenuItem sx={{ color: 'text.secondary',py:1 }}  onClick={handleFilter('stock_out')} selected={filter==='stock_out'}>
                  <ListItemText primary={t("stock_out")} />
                </MenuItem>
              </MenuPopover>
            </Box>
            <Scrollbar>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">{tCom("name_ctx",{what:tMenu("ingredient")})}</TableCell>
                    <TableCell>{`${tMenu("transactions")} (${tMenu("product")})`}</TableCell>
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
                    <TableCell align="center" colSpan={7} sx={{ py: 3 }}><CircularProgress size={30} /></TableCell>
                  </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell align="center" colSpan={7} sx={{ py: 3 }}><Typography>{error?.error.message}</Typography></TableCell>
                    </TableRow>
                  ) : data?.data && data?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell align="center" colSpan={7} sx={{ py: 3 }}><Typography>{tCom("no_what",{what:tMenu("stock")})}</Typography></TableCell>
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
                        <TableCell>{`${d?.transaction?.uid ? `${d?.transaction?.uid} (${d?.product?.name})` : '-'}`}</TableCell>
                        <TableCell>{getDayJs(d?.timestamp).locale(locale).format('DD MMM YYYY, HH:mm')}</TableCell>
                        <TableCell>{d?.type === 'in' ? t('stock_in') : d?.type === 'out' ? t('stock_out') : ''}</TableCell>
                        <TableCell sx={{whiteSpace:'nowrap'}}>{d?.type === 'in' ? `Rp${numberFormat(`${d.price}`)}` : '-'}</TableCell>
                        <TableCell>{`${d?.stocks} ${d?.item?.unit}`}</TableCell>
                        <TableCell>
                          <UserMenu onEdit={buttonEdit(d)} allDisabled={!getOutletAccess(outlet?.data,'Stock')} type={d?.type} onDetail={handleDetail(d)} />
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
            <Form outlet={outlet?.data} input={input} setInput={setInput} loading={loading} ingOptions={ingOptions} ingLoading={ingLoading} handleAutocompleteInputChange={handleAutocompleteInputChange} />
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
            <Form edit outlet={outlet?.data} input={input} setInput={setInput} loading={loading} ingOptions={ingOptions} ingLoading={ingLoading} handleAutocompleteInputChange={handleAutocompleteInputChange} />
          </DialogContent>
          <DialogActions>
            <Button text color='inherit' disabled={loading} onClick={()=>setDEdit(null)}>{tCom("cancel")}</Button>
            <Button disabled={loading} loading={loading} icon='submit' type='submit'>{tCom("save")}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog loading={loading} maxWidth='md' open={dDetail!==null} handleClose={()=>setDDetail(null)}>
        <DialogTitle>
          <Stack direction='row' alignItems='center' justifyContent='space-between'>
            <Typography variant='h6' component='h6'>{(dDetail?.type === 'in' ? t('stock_in') : t('stock_out')).toUpperCase()}</Typography>
            <IconButton onClick={()=>setDDetail(null)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <StockDetail stock={dDetail as Stock} />
        </DialogContent>
      </Dialog>
    </Header>
  )
}