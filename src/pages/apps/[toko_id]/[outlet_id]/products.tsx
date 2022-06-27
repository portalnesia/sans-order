// material
import { Box, Grid, Container, Typography,Tooltip,IconButton,TextField, Card, FormControlLabel, Switch,Checkbox,Table,TableHead,TableRow,TableBody,TableCell,TablePagination,CircularProgress,Stack,MenuItem,ListItemIcon,ListItemText, FormLabel, Portal, Autocomplete, AutocompleteChangeReason, AutocompleteInputChangeReason, FormControl, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import {AddAPhoto,Create,Delete} from '@mui/icons-material'
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
import {IOutlet,IPages,ResponsePagination,IProduct, Without, IIngredients} from '@type/index'
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

export const getServerSideProps = wrapper({name:'check_outlet',outlet:{onlyMyToko:true,onlyAccess:['items']},translation:'dash_product'})

type IInputProduct = Without<IProduct,'id'|'outlet_id'|'toko_id'|'metadata'|'disscount'|'recipes'> & ({recipes: {id: number,consume: number}[] | null})

interface FormProps {
  input: IInputProduct,
  setInput(item: IInputProduct): void
  loading?: boolean
  openBrowser(): void
  autoFocus?:boolean,
  ingOptions: IIngredients[],
  ingLoading: boolean,
  handleAutocompleteInputChange(e: React.SyntheticEvent<Element, Event>, value: string,reason: AutocompleteInputChangeReason): void
}

function Form({input,setInput,loading,openBrowser,autoFocus,ingOptions,ingLoading,handleAutocompleteInputChange}: FormProps) {
  const {t} = useTranslation('dash_product');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const [edit,setEdit] = React.useState<{id: number, consume: number} | null>(null);
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
        setEdit({...edit,id:0})
      }
    }
  },[handleAutocompleteInputChange,edit])

  const handleChecked = React.useCallback((name: keyof IInputProduct)=>(e?: React.ChangeEvent<HTMLInputElement>)=>{
    setInput({...input,[name]:e?.target?.checked||false})
  },[input])

  const handleAutocomplete=React.useCallback((e: React.SyntheticEvent<Element, Event>, value: IIngredients | null,reason: AutocompleteChangeReason)=>{
    if(value) {
      setEdit({consume:(edit?.consume||0),id:value.id})
    }
  },[edit])

  const handleAddStocks = React.useCallback((e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    if(e?.stopPropagation) e?.stopPropagation();
    if(edit === null) return setNotif("Invalid stock",true);
    if(edit.id === 0) return setNotif("Invalid stock",true);
    if(edit.consume === 0) return setNotif("Invalid stock consume",true);

    const recipes = input.recipes||[];
    const i = recipes.findIndex(s=>s.id === edit.id);
    if(i >= 0) {
      recipes[i] = edit;
    } else {
      recipes.push(edit)
    }
    setInput({...input,recipes})
    setEdit(null);
  },[edit,input])

  const handleDeleteStocks = React.useCallback((item: IIngredients)=>()=>{
    const recipes = input.recipes||[];
    const i = recipes.findIndex(s=>s.id === item.id);
    if(i >= 0) {
      recipes.splice(i,1);
      setInput({...input,recipes})
    }
  },[input])

  const handleEditStock = React.useCallback((item: IIngredients & ({consume: number}))=>()=>{
    setEdit({id: item.id,consume: item.consume})
  },[])

  const valueAutoComplete = React.useMemo(()=>{
    let val = null;
    if(edit) {
      const a = ingOptions.find(s=>s.id === edit.id)
      if(a) val = a;
    }
    return val;
  },[ingOptions,edit])

  const ing_arr = React.useMemo(()=>{
    if(input.recipes) {
      let arr: (IIngredients & {consume: number})[]=[];
      for(const stock of input.recipes) {
        const s = ingOptions.find(s=>s.id === stock.id);
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
            <Switch disabled={loading} checked={input.active} color="primary" onChange={handleChecked('active')} />
          }
          label={t("active")}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Switch disabled={loading} checked={input.show_in_menu} color="primary" onChange={handleChecked('show_in_menu')} />
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
          <Button disabled={loading} size='small' color='inherit' onClick={()=>setEdit({id:0,consume:0})}>{tCom("add_ctx",{what:tMenu("ingredient")})}</Button>
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
        {input.image ? (
          <Box padding={{sm:2,md:3,lg:5}} display='flex' alignItems='center' justifyContent='center'>
            <Image alt={tCom("image")} src={input.image} style={{maxWidth:300}} />
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
                    onChange={(e)=>setEdit({id:edit?.id||0,consume:Number.parseFloat(e.target.value)})}
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

export default function OutletProducts({meta}: IPages) {
  const {t} = useTranslation('dash_product');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const {post,del,put,get} = useAPI();
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
  const {data,error,mutate} = useSWR<ResponsePagination<IProduct>>(`/sansorder/toko/${toko_id}/${outlet_id}/items?page=${page}&per_page=${rowsPerPage}`);
  const [browser,setBrowser] = React.useState(false);
  const [ingOptions,setIngOption]=React.useState<IIngredients[]>([]);
  const [ingLoading,setIngLoading] = React.useState(false);

  const captchaRef = React.useRef<Recaptcha>(null);

  const handleSelectedImage=React.useCallback((image: string|null)=>{
    setInput(p=>({...p,image}))
  },[setInput])
  
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

  const buttonCreate=React.useCallback(()=>{
    setInput(DEFAULT_INPUT);
    setDCreate(true)
  },[])

  const buttonEdit=React.useCallback((d: IProduct)=>()=>{
    const {id:_,outlet_id:__,toko_id:_d,metadata:_m,...rest} = d;
    setInput({...rest});
    setDEdit(d);
  },[])

  const handleCreate=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const recaptcha = await captchaRef.current?.execute();
      await post(`/sansorder/toko/${toko_id}/${outlet_id}/items`,{...input,recaptcha});
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
      await put(`/sansorder/toko/${toko_id}/${outlet_id}/items/${dEdit?.id}`,{...input,recaptcha});
      mutate();
      setNotif(tCom("saved"),false)
      setDEdit(null)
    } catch(e: any) {
      setNotif(e?.message||tCom("error_500"),true);
    } finally {
      setLoading(false);
    }
  },[dEdit,input,setNotif,put,toko_id,outlet_id,mutate])

  const handleDelete=React.useCallback(async()=>{
    if(typeof dDelete !== 'boolean' && dDelete && 'id' in dDelete) {
      setLoading(true);
      try {
        await del(`/sansorder/toko/${toko_id}/${outlet_id}/items/${dDelete?.id}`);
        mutate();
        setNotif(tCom("deleted"),false)
        setDDelete(null)
      } catch(e: any) {
        setNotif(e?.message||tCom("error_500"),true);
      } finally {
        setLoading(false);
      }
    }
  },[dDelete,del,setNotif,toko_id,outlet_id,mutate,tCom])

  const handleDeleteAll=React.useCallback(async()=>{
    if(typeof dDelete === 'boolean') {
      setLoading(true);
      try {
        const ids = selected.map(s=>s.id);
        await post(`/sansorder/toko/${toko_id}/${outlet_id}/bulk/delete`,{type:'item',ids});
        mutate();
        setNotif(tCom("General.deleted"),false)
        setDDelete(null)
      } catch(e: any) {
        setNotif(e?.message||tCom("error_500"),true);
      } finally {
        setLoading(false);
      }
    }
  },[selected,post,setNotif,toko_id,outlet_id,mutate,tCom])

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
  },[ingOptions])

  useMousetrap(['+','shift+='],buttonCreate);

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

  return (
    <Header title={`${tMenu("products")} - ${meta?.title}`} desc={meta?.description}>
      <Dashboard title={meta?.title} subtitle={meta?.toko_name}>
        <Container>
          <Box pb={2} mb={5}>
            <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
              <Typography variant="h3" component='h3'>{tMenu("products")}</Typography>
              <Button icon='add' tooltip='+' disabled={!getOutletAccess(outlet,'items')} onClick={buttonCreate}>{tCom("add_ctx",{what:tMenu("products")})}</Button>
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
                      <TableCell align="center" colSpan={7} sx={{ py: 3 }}><Typography>{error?.message}</Typography></TableCell>
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
                            <Typography variant='body2' sx={{fontSize:13}} >{`${s?.name||''}: ${s?.consume||''} ${s?.unit||''}`}</Typography>
                          ))}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" alignItems="center" justifyContent='center' spacing={2}>
                            <Label variant='filled' color={d.active ? 'success':'error'}>{d?.active ? t("active") : t("active",{context:'not'})}</Label>
                            {d?.show_in_menu && <Label variant='filled' color='info'>{t("show_in_menu")}</Label>}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <UserMenu onEdit={buttonEdit(d)} onDelete={()=>setDDelete(d)} allDisabled={!getOutletAccess(outlet,'items')} />
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

      <Recaptcha ref={captchaRef} />
      <Browser open={browser} onClose={()=>setBrowser(false)} onSelected={handleSelectedImage} />
    </Header>
  )
}