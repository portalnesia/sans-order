// material
import { Box, Grid, Container, Typography,Tooltip,IconButton,TextField, Card, FormControlLabel, Switch,Checkbox,Table,TableHead,TableRow,TableBody,TableCell,TablePagination,CircularProgress,Stack,MenuItem,ListItemIcon,ListItemText, FormLabel, Portal, Autocomplete, AutocompleteChangeReason, AutocompleteInputChangeReason, FormControl, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import {AddAPhoto,Create,Delete} from '@mui/icons-material'
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
import {Outlet,IPages,Product, Without, Ingredient, Nullable, File} from '@type/index'
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
import { getOutletAccess } from '@utils/Main';

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const SimpleMDE = dynamic(()=>import('@comp/SimpleMDE'))
const Browser = dynamic(()=>import('@comp/Browser'),{ssr:false})

export const getServerSideProps = wrapper({name:'check_outlet',outlet:{onlyMyToko:true,onlyAccess:['Product']},translation:'dash_product'})

type IInputProduct = Nullable<Without<Product,'id'|'outlet'|'metadata'|'recipes'>> & ({recipes: {item: number,consume: number}[] | null})

interface FormProps {
  input: IInputProduct,
  setInput(item: IInputProduct): void
  loading?: boolean
  openBrowser(): void
  autoFocus?:boolean,
  ingOptions: Ingredient[],
  ingLoading: boolean,
  handleAutocompleteInputChange(e: React.SyntheticEvent<Element, Event>, value: string,reason: AutocompleteInputChangeReason): void
}

function Form({input,setInput,loading,openBrowser,autoFocus,ingOptions,ingLoading,handleAutocompleteInputChange}: FormProps) {
  const {t} = useTranslation('dash_product');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const [edit,setEdit] = React.useState<{item: number, consume: number} | null>(null);
  const [openAutocomplete,setOpenAutocomplete] = React.useState(false)
  const setNotif = useNotif();

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

  const handleInputChange=React.useCallback((e: React.SyntheticEvent<Element, Event>, value: string,reason: AutocompleteInputChangeReason)=>{
    if(reason==='input') return handleAutocompleteInputChange(e,value,reason);
    else if(reason==='clear') {
      if(edit) {
        setEdit({...edit,item:0})
      }
    }
  },[handleAutocompleteInputChange,edit])

  const handleChecked = React.useCallback((name: keyof IInputProduct)=>(e?: React.ChangeEvent<HTMLInputElement>)=>{
    setInput({...input,[name]:e?.target?.checked||false})
  },[input])

  const handleAutocomplete=React.useCallback((e: React.SyntheticEvent<Element, Event>, value: Ingredient | null,reason: AutocompleteChangeReason)=>{
    if(value) {
      setEdit({consume:(edit?.consume||0),item:value.id})
    }
  },[edit])

  const handleAddStocks = React.useCallback((e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    if(e?.stopPropagation) e?.stopPropagation();
    if(edit === null) return setNotif("Invalid stock",true);
    if(edit.item === 0) return setNotif("Invalid stock",true);
    if(edit.consume === 0) return setNotif("Invalid stock consume",true);

    const recipes = input.recipes||[];
    const i = recipes.findIndex(s=>s.item === edit.item);
    if(i >= 0) {
      recipes[i] = edit;
    } else {
      recipes.push(edit)
    }
    setInput({...input,recipes})
    setEdit(null);
  },[edit,input])

  const handleDeleteStocks = React.useCallback((item: Ingredient)=>()=>{
    const recipes = input.recipes||[];
    const i = recipes.findIndex(s=>s.item === item.id);
    if(i >= 0) {
      recipes.splice(i,1);
      setInput({...input,recipes})
    }
  },[input])

  const handleEditStock = React.useCallback((item: Ingredient & ({consume: number}))=>()=>{
    setEdit({item: item.id,consume: item.consume})
  },[])

  const valueAutoComplete = React.useMemo(()=>{
    let val = null;
    if(edit) {
      const a = ingOptions.find(s=>s.id === edit.item)
      if(a) val = a;
    }
    return val;
  },[ingOptions,edit])

  const ing_arr = React.useMemo(()=>{
    if(input.recipes) {
      let arr: (Ingredient & {consume: number})[]=[];
      for(const stock of input.recipes) {
        const s = ingOptions.find(s=>s.id === stock.item);
        if(s) arr.push({...s,consume:stock.consume});
      }
      return arr;
    }
    return null;
  },[input,ingOptions])

  return (
    <>
    <Grid container spacing={4}>
      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Switch disabled={loading} checked={input.active||false} color="primary" onChange={handleChecked('active')} />
          }
          label={t("active")}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Switch disabled={loading} checked={input.show_in_menu||false} color="primary" onChange={handleChecked('show_in_menu')} />
          }
          label={t("show_in_menu")}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label={tCom("name_ctx",{what:tMenu("products")})}
          value={input.name}
          onChange={handleChange('name')}
          required
          fullWidth
          autoFocus={autoFocus}
          placeholder='Cappucino'
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label={t("category")}
          value={input.category}
          onChange={handleChange('category')}
          fullWidth
          placeholder='Coffee'
          disabled={loading}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          label={t("price")}
          value={input.price||0}
          onChange={handleChange('price')}
          required
          fullWidth
          helperText={`IDR ${numberFormat(`${input.price||0}`)}`}
          type='number'
          inputProps={{min:0}}
          disabled={loading}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          label={"HPP"}
          value={input.hpp||0}
          onChange={handleChange('hpp')}
          required
          fullWidth
          helperText={`IDR ${numberFormat(`${input.hpp||0}`)}`}
          type='number'
          inputProps={{min:0}}
          disabled={loading}
        />
      </Grid>

      <Grid item xs={12}>
        <div className='flex-header'>
          <FormLabel>{tMenu('recipes')}</FormLabel>
          <Button disabled={loading} size='small' color='inherit' onClick={()=>setEdit({item:0,consume:0})}>{tCom("add_ctx",{what:tMenu("ingredient")})}</Button>
        </div>
        
        <Scrollbar>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left">{tCom("name_ctx",{what:tMenu("ingredient")})}</TableCell>
                <TableCell>Consume</TableCell>
                <TableCell width='20%'></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ing_arr && ing_arr.length > 0 ? ing_arr.map(s=>(
                <TableRow key={`table-stock-${s.id}`}>
                  <TableCell align="left">{s.name}</TableCell>
                  <TableCell>{`${s.consume} ${s.unit}`}</TableCell>
                  <TableCell align='right'>
                    <Stack direction='row' spacing={2}>
                      <IconButton sx={{mr:1}} onClick={handleEditStock(s)}>
                        <Create />
                      </IconButton>
                      <IconButton onClick={handleDeleteStocks(s)}>
                        <Delete />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              )) : (
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
        {input.image?.url ? (
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
      <Dialog maxWidth='sm' open={edit !== null} handleClose={()=>setEdit(null)}>
        <form onSubmit={handleAddStocks}>
          <DialogTitle>{tCom("add_ctx",{what:tMenu("stock")})}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  value={valueAutoComplete}
                  clearOnBlur
                  clearOnEscape
                  onChange={handleAutocomplete}
                  onInputChange={handleInputChange}
                  options={ingOptions}
                  getOptionLabel={o=>o.name}
                  loading={ingLoading}
                  open={openAutocomplete}
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
              <Grid item xs={12} md={6}>
                <FormControl variant='outlined' disabled={loading} fullWidth>
                  <InputLabel htmlFor='ingredient-consume'>{"Consume"}</InputLabel>
                  <OutlinedInput
                    label={"Consume"}
                    id='ingredient-consume'
                    type='number'
                    value={edit?.consume||0}
                    onChange={(e)=>setEdit({item:edit?.item||0,consume:Number.parseFloat(e.target.value)})}
                    placeholder='5'
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button text color='inherit' disabled={loading} onClick={()=>setEdit(null)}>{tCom("cancel")}</Button>
            <Button icon='add' type='submit'>{tCom("add")}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Portal>
    </>
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
  hpp:0,
  image: null,
  category:null,
  recipes: []
}

export default function OutletProducts({meta}: IPages<Outlet>) {
  const {t} = useTranslation('dash_product');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const {post,del,put,get} = useAPI();
  const setNotif = useNotif();
  const {outlet_id} = router.query;
  const {outlet} = useOutlet(outlet_id,{fallback:meta});
  const {page,rowsPerPage,...pagination} = usePagination(true);
  const [input,setInput] = React.useState<IInputProduct>(DEFAULT_INPUT);
  const [dCreate,setDCreate] = React.useState(false);
  const [dEdit,setDEdit] = React.useState<Nullable<Product>|null>(null);
  const [dDelete,setDDelete] = React.useState<Product|null|boolean>(null);
  const [loading,setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<Product[]>([]);
  const {data,error,mutate} = useSWR<Product,true>(`/products/${outlet_id}?page=${page}&pageSize=${rowsPerPage}`);
  const [browser,setBrowser] = React.useState(false);
  const [ingOptions,setIngOption]=React.useState<Ingredient[]>([]);
  const [ingLoading,setIngLoading] = React.useState(false);

  const handleSelectedImage=React.useCallback((image: File|null)=>{
    setInput(p=>({...p,image}))
  },[setInput])

  const handleDeletedImages = React.useCallback((dt: File)=>{
    if(input.image?.id === dt.id) setInput({...input,image:null})
  },[input])
  
  const handleSelectAllClick = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = data?.data||[]
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  },[data]);

  const handleSelect = React.useCallback((item: Product) => () => {
    const items = [...selected];
    const selectedIndex = items.findIndex(i=>i.id === item.id)
    let newSelected: Product[] = [];
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
    setInput(DEFAULT_INPUT);
    setDCreate(true)
  },[])

  const buttonEdit=React.useCallback((d: Product)=>()=>{
    const {id:_,outlet:__,metadata:_m,recipes:r,...rest} = d;
    const recipes = r.map(r=>({
      item:(r?.item?.id||0),
      consume:r.consume
    }))
    setInput({...rest,recipes});
    setDEdit(d);
  },[])

  const handleCreate=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      await post(`/products/${outlet_id}`,{...input,image:input?.image?.id});
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
      await put(`/products/${outlet_id}/${dEdit?.id}`,{...input,image:input?.image?.id});
      mutate();
      setNotif(tCom("saved"),false)
      setDEdit(null)
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error_500"),true);
    } finally {
      setLoading(false);
    }
  },[dEdit,input,setNotif,put,outlet_id,mutate])

  const handleDelete=React.useCallback(async()=>{
    if(typeof dDelete !== 'boolean' && dDelete && 'id' in dDelete) {
      setLoading(true);
      try {
        await del(`/products/${outlet_id}/${dDelete?.id}`);
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
        const filters = selected.map(s=>({
          id:{
            $eq:s.id
          }
        }));
        await post(`/products/${outlet_id}/bulk-delete`,{filters});
        mutate();
        setNotif(tCom("General.deleted"),false)
        setDDelete(null)
      } catch(e: any) {
        setNotif(e?.error?.message||tCom("error_500"),true);
      } finally {
        setLoading(false);
      }
    }
  },[selected,post,setNotif,outlet_id,mutate,tCom])

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
  },[ingOptions])

  useMousetrap(['+','shift+='],buttonCreate);

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
  },[outlet_id,get,ingOptions])

  return (
    <Header title={`${tMenu("products")} - ${outlet?.data?.name}`} desc={outlet?.data?.description}>
      <Dashboard title={outlet?.data?.name} subtitle={outlet?.data?.toko?.name}>
        <Container>
          <Box pb={2} mb={5}>
            <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
              <Typography variant="h3" component='h3'>{tMenu("products")}</Typography>
              <Button icon='add' tooltip='+' disabled={!getOutletAccess(outlet?.data,'Product')} onClick={buttonCreate}>{tCom("add_ctx",{what:tMenu("products")})}</Button>
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
                    <TableCell align="left">{tCom("name_ctx",{what:tMenu("products")})}</TableCell>
                    <TableCell>{t("price")}</TableCell>
                    <TableCell>HPP</TableCell>
                    <TableCell align="left">{t("stock")}</TableCell>
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
                      <TableCell align="center" colSpan={7} sx={{ py: 3 }}><Typography>{error?.error.message}</Typography></TableCell>
                    </TableRow>
                  ) : data?.data && data?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell align="center" colSpan={7} sx={{ py: 3 }}><Typography>{tCom("no_what",{what:tMenu("products")})}</Typography></TableCell>
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
                        <TableCell sx={{whiteSpace:'nowrap'}}>{`IDR ${numberFormat(`${d.price}`)}`}</TableCell>
                        <TableCell sx={{whiteSpace:'nowrap'}}>{`IDR ${numberFormat(`${d.hpp}`)}`}</TableCell>
                        <TableCell>
                          {d?.recipes?.map(s=>(
                            <Typography variant='body2' sx={{fontSize:13}} >{`${s?.item?.name||''}: ${s?.consume||''} ${s?.item?.unit||''}`}</Typography>
                          ))}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" alignItems="center" justifyContent='center' spacing={2}>
                            <Label variant='filled' color={d.active ? 'success':'error'}>{d?.active ? t("active") : t("active",{context:'not'})}</Label>
                            {d?.show_in_menu && <Label variant='filled' color='info'>{t("show_in_menu")}</Label>}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <UserMenu onEdit={buttonEdit(d)} onDelete={()=>setDDelete(d)} allDisabled={!getOutletAccess(outlet?.data,'Product')} />
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
            <Form input={input} setInput={setInput} loading={loading} openBrowser={()=>setBrowser(true)} ingOptions={ingOptions} ingLoading={ingLoading} handleAutocompleteInputChange={handleAutocompleteInputChange} />
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
            <Form autoFocus input={input} setInput={setInput} loading={loading} openBrowser={()=>setBrowser(true)} ingOptions={ingOptions} ingLoading={ingLoading} handleAutocompleteInputChange={handleAutocompleteInputChange} />
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
            <Button disabled={loading} loading={loading} icon='delete' color='error' onClick={handleDeleteAll}>{tCom("delete")}</Button>
          ) : (
            <Button disabled={loading} loading={loading} icon='delete' color='error' onClick={handleDelete}>{tCom("delete")}</Button>
          )}
        </DialogActions>
      </Dialog>
      <Browser open={browser} onClose={()=>setBrowser(false)} onSelected={handleSelectedImage} onDeleted={handleDeletedImages} />
    </Header>
  )
}