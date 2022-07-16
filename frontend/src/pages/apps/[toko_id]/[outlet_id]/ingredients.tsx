// material
import { Box, Grid, Container, Typography,Tooltip,IconButton,TextField, Card, FormControlLabel, Switch,Checkbox,Table,TableHead,TableRow,TableBody,TableCell,TablePagination,CircularProgress,Stack,MenuItem,ListItemIcon,ListItemText, Autocomplete, AutocompleteChangeReason, AutocompleteInputChangeReason } from '@mui/material';
import {AddAPhoto,Delete} from '@mui/icons-material'
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
import {Outlet,IPages,Product, Without, Ingredient,Nullable} from '@type/index'
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

export const getServerSideProps = wrapper({name:'check_outlet',outlet:{onlyMyToko:true,onlyAccess:['Ingredient']},translation:'dash_product'})

type IInputIngredient = Nullable<Without<Ingredient,'id'|'outlet'>>

interface FormProps {
  input: IInputIngredient,
  setInput(item: IInputIngredient): void
  loading?: boolean
  autoFocus?:boolean
}

function Form({input,setInput,loading,autoFocus}: FormProps) {
  const {t} = useTranslation('dash_product');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');

  const handleChange=React.useCallback((name: keyof IInputIngredient)=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement> | string)=>{
    const val = typeof e === 'string' ? e : e?.target?.value;
    const isNull = ['description'].includes(name)
    if(isNull) {
      const value = val?.length > 0 ? val : null;
      setInput({...input,[name]:value});
      return;
    }
    setInput({...input,[name]:val||null})
  },[input])

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <TextField
          label={tCom("name_ctx",{what:tMenu("ingredient")})}
          value={input.name}
          onChange={handleChange('name')}
          required
          fullWidth
          autoFocus={autoFocus}
          disabled={loading}
          placeholder='Milk'
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label={"Unit"}
          value={input.unit}
          onChange={handleChange('unit')}
          required
          fullWidth
          disabled={loading}
          placeholder='Kg, Liter'
        />
      </Grid>
      <Grid item xs={12}>
        <SimpleMDE disabled={loading} value={input.description||''} image onChange={handleChange('description')} label={tCom("description")} />
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

const DEFAULT_INPUT_IN: IInputIngredient = {
  name:'',
  description:'',
  unit: "",
}

export default function OutletIngredients({meta}: IPages<Outlet>) {
  const {t} = useTranslation('dash_product');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const {post,del,put} = useAPI();
  const setNotif = useNotif();
  const {outlet_id} = router.query;
  const {outlet} = useOutlet(outlet_id,{fallback:meta});
  const {page,rowsPerPage,...pagination} = usePagination(true);
  const [input,setInput] = React.useState<IInputIngredient>(DEFAULT_INPUT_IN);
  const [dCreate,setDCreate] = React.useState(false);
  const [dEdit,setDEdit] = React.useState<Ingredient|null>(null);
  const [dDelete,setDDelete] = React.useState<Ingredient|null|boolean>(null);
  const [loading,setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<Ingredient[]>([]);
  const {data,error,mutate} = useSWR<Ingredient,true>(`/ingredients/${outlet_id}?page=${page}&pageSize=${rowsPerPage}`);

  const handleSelectAllClick = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = data?.data||[]
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  },[data]);

  const handleSelect = React.useCallback((item: Ingredient) => () => {
    const items = [...selected];
    const selectedIndex = items.findIndex(i=>i.id === item.id)
    let newSelected: Ingredient[] = [];
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

  const buttonEdit=React.useCallback((d: Ingredient)=>()=>{
    const {id:_,outlet:_a,...rest} = d;
    setInput({...rest});
    setDEdit(d);
  },[])

  const handleCreate=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      await post(`/ingredients/${outlet_id}`,{...input});
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
      await put(`/ingredients/${outlet_id}/${dEdit?.id}`,{...input});
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
        await del(`/ingredients/${outlet_id}/${dDelete?.id}`);
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
            $eq: s.id
          }
        }));
        await post(`/ingredients/${outlet_id}/bulk-delete`,{filters});
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

  useMousetrap(['+','shift+='],buttonCreate);

  return (
    <Header title={`${tMenu("ingredient")} - ${outlet?.data?.name}`} desc={outlet?.data?.description}>
      <Dashboard title={outlet?.data?.name} subtitle={outlet?.data?.toko?.name} view='dashboard ingredients'>
        <Container>
          <Box pb={2} mb={5}>
            <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
              <Typography variant="h3" component='h3'>{tMenu("ingredient")}</Typography>
              <Button icon='add' tooltip='+' disabled={!getOutletAccess(outlet?.data,'Ingredient')} onClick={buttonCreate}>{tCom("add_ctx",{what:tMenu("ingredient")})}</Button>
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
                    <TableCell align="left">{tCom("name_ctx",{what:tMenu("ingredient")})}</TableCell>
                    <TableCell align="right">{tMenu('stock')}</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell align="center" width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!data && !error ? (
                    <TableRow>
                    <TableCell align="center" colSpan={5} sx={{ py: 3 }}><CircularProgress size={30} /></TableCell>
                  </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell align="center" colSpan={5} sx={{ py: 3 }}><Typography>{error?.error.message}</Typography></TableCell>
                    </TableRow>
                  ) : data?.data && data?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell align="center" colSpan={5} sx={{ py: 3 }}><Typography>{tCom("no_what",{what:tMenu("ingredient")})}</Typography></TableCell>
                    </TableRow>
                  ) : data?.data.map(i=>{
                    const isSelected = selected.findIndex(it=>it.id === i.id) !== -1;
                    return (
                      <TableRow
                        hover
                        key={`ingredient-${i.id}`}
                        tabIndex={-1}
                        role="checkbox"
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={handleSelect(i)}
                          />
                        </TableCell>
                        <TableCell>{i?.name}</TableCell>
                        <TableCell align="right">{numberFormat(`${i?.stock||0}`)}</TableCell>
                        <TableCell>{i?.unit}</TableCell>
                        <TableCell>
                          <UserMenu onEdit={buttonEdit(i)} onDelete={()=>setDDelete(i)} allDisabled={!getOutletAccess(outlet?.data,'Ingredient')} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
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
        </Container>
      </Dashboard>

      <Dialog loading={loading} maxWidth='md' open={dCreate} handleClose={()=>setDCreate(false)}>
        <form onSubmit={handleCreate}>
          <DialogTitle>{tCom("add_ctx",{what:tMenu("products")})}</DialogTitle>
          <DialogContent dividers>
            <Form input={input} setInput={setInput} loading={loading} />
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
            <Form input={input} setInput={setInput} loading={loading} />
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
    </Header>
  )
}