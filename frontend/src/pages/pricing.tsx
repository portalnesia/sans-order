// material
import { Box, Grid, Container, Typography,styled,Card,CardContent,CardActions,Divider,List,ListItemText,ListItem,Collapse,IconButton,IconButtonProps,ListItemIcon } from '@mui/material';
import {ExpandMore as ExpandMoreIcon} from '@mui/icons-material'
// components
import Header from '../components/Header';
import Dashboard from '../layout/home/index'
import {numberFormat} from '@portalnesia/utils'
import React from 'react'
import Image from '@comp/Image'
import {staticProps} from '@redux/store'
import {useTranslation,TFunction} from 'next-i18next';
import Button from '@comp/Button'
import useSWR from '@utils/swr'
import {Circular} from '@comp/Loading'
import Label from '@comp/Label'
import Iconify from '@comp/Iconify'
import ExpandMore from '@comp/ExpandMore';
import useNotification from '@utils/notification';
import { PriceList } from '@type/PriceList';
import qs from 'qs'
import { useRouter } from 'next/router';

export const getStaticProps = staticProps({translation:'subcribe'});

interface SectionProps {
  item: PriceList
}

function PricingSection({item}: SectionProps) {
  const {t} = useTranslation('subcribe');
  const {t:tCom} = useTranslation('common');
  const [expand,setExpand] = React.useState(false)
  const setNotif = useNotification();
  const {name,price,discount,qty,features,recommend} = item

  const onSubs = React.useCallback(()=>{
    setNotif(tCom("maintenance_subs"),'info')
  },[tCom])

  return (
    <Grid item xs={12} md={6}>
      <Card variant='elevation'>
        <CardContent>
          {recommend && (
            <Label
              variant="filled"
              color={'info'}
              sx={{
                zIndex: 9,
                top:10,
                left:10,
                position:'absolute',
                textTransform: 'uppercase'
              }}
            >
              Recommended
            </Label>
          )}
          <Box textAlign='center'>
            <Typography variant='h3' component='h3'>{name}</Typography>
          </Box>
        </CardContent>

        <Divider />

        <CardContent>
          <Box textAlign='center'>
            {discount > 0 ? (
              <>
                <Box alignItems='center' justifyContent='center' position='relative' display='flex'>
                  <Typography variant='h6' component='h6' sx={{color: 'text.disabled',textDecoration: 'line-through'}}>{`Rp${numberFormat(`${Math.round((price/qty)/30)}`)}`}</Typography>
                  <Label
                    variant="filled"
                    color={'error'}
                    sx={{
                      zIndex: 9,
                      ml:2,
                      textTransform: 'uppercase'
                    }}
                  >
                    {`${((price/qty)/30/((price/qty)/30-(discount/qty)/30)).toFixed(2)}% OFF`}
                  </Label>
                </Box>
                <Box display='flex' justifyContent='center' alignItems='flex-start'>
                  <Typography component='span' sx={{fontWeight:'bold',mr:1}}>Rp</Typography>
                  <Typography variant='h4' component='h4'>{`${numberFormat(`${Math.round(((price/qty)/30)-((discount/qty)/30))}`)}`}<Typography component='span' variant='body2'>{`/${t("day")}`}</Typography></Typography>
                </Box>
              </>
            ) : (
              <Box display='flex' justifyContent='center' alignItems='flex-start'>
                <Typography component='span' sx={{fontWeight:'bold',mr:1}}>Rp</Typography>
                <Typography variant='h4' component='h4'>{`${numberFormat(`${Math.round((price/qty)/30)}`)}`}<Typography component='span' variant='body2'>{`/${t("day")}`}</Typography></Typography>
              </Box>
            )}
            
          </Box>
          <Divider sx={{pt:2}} />
          <Box textAlign='center' mt={2}>
            <Typography variant='h5' component='h5'>{`${qty} ${t("month")}`}</Typography>
          </Box>                 
        </CardContent>

        <Divider />

        <CardActions disableSpacing sx={{mx:3}}>
          <Typography variant='h5' component='h5'>{t("feature")}</Typography>
          <ExpandMore expand={expand} onClick={()=>setExpand(!expand)} aria-expanded={expand} aria-label='Features'>
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>
        
        <Collapse in={expand} timeout='auto' unmountOnExit>
          <Box pl={3} pr={3}>
            <List>
              {features.map((f,i)=>(
                <ListItem key={`features-${f.id}`}>
                  <ListItemIcon>
                    <Iconify icon={f ? 'akar-icons:circle-check':'akar-icons:circle-x'} sx={{color:f.enabled ? 'primary.main' : 'error.main'}} />
                  </ListItemIcon>
                  <ListItemText primary={f.feature?.description} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Collapse>

        <Divider />

        <CardContent>
          <CardActions>
            <Box flex="1 1 0">
              <Button size='large' sx={{display:'flex',flexGrow:1,width:'100%'}} onClick={onSubs}>{t("subcribe")}</Button>
            </Box>
          </CardActions>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default function PricingApp() {
  const {t} = useTranslation('subcribe');
  const {t:tMenu} = useTranslation('menu');
  const router = useRouter();
  const locale = router?.locale||'en'
  const query = React.useMemo(()=>qs.stringify({
    locale:locale,
    populate:{
      features:{
        populate:'feature'
      }
    }
  }),[locale])
  const {data,error} = useSWR<PriceList,true>(`/price-lists?${query}`);

  return (
    <Header title={tMenu("pricing")}>
      <Dashboard>
        <Container maxWidth='xl'>
          <Box textAlign='center' mb={4}>
            <Typography variant='h1' component='h1'>{tMenu("pricing")}</Typography>
          </Box>

          {(!data && !error || !data) ? (
            <Circular />
          ) : error ? (
            <Box display='flex' alignItems='center' flexGrow='1' justifyContent='center'>
              <Typography variant='h3' component='h3'>{`error?.message`}</Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                {data?.data?.map(d=>(
                  <PricingSection key={`pricing-${d.id}`} item={d} />
                ))}
              </Grid>
              <Divider sx={{mt:7}} />
              <Box mt={7}>
                <Typography sx={{color:'text.disabled'}}>{`* ${t("feature_first_free")}`}</Typography>
                <Typography sx={{color:'text.disabled'}}>{`** ${t("feature_max_table_number")}`}</Typography>
              </Box>
            </>
          )}
        </Container>
      </Dashboard>
    </Header>
  )
}
