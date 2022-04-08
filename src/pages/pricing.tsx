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
import {useTranslations} from 'next-intl';
import Button from '@comp/Button'
import useSWR from '@utils/swr'
import {Circular} from '@comp/Loading'
import Label from '@comp/Label'
import Iconify from '@comp/Iconify'

export const getStaticProps = staticProps();

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean
}

const ExpandMore = styled((props: ExpandMoreProps)=>{
  const {expand,...rest}=props
  return <IconButton {...rest} />;
})(({theme,expand})=>({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft:'auto',
  transition: theme.transitions.create('transform',{
    duration: theme.transitions.duration.shorter
  })
}))

const FEATURES = (t: ReturnType<typeof useTranslations>)=>([
  `${t("Subcribe.feature.free",{qty:1})}*`,
  t("Subcribe.feature.order_system"),
  `${t("Subcribe.feature.table_number")}**`,
  t("Subcribe.feature.banner"),
  t("Subcribe.feature.cashier_system"),
  t("Subcribe.feature.media_promotion")
])

const PACKAGES = [
  {
    id:"toko_1",
    name:"Bronze",
    features:[
      true,
      true,
      true,
      true,
      false,
      false
    ]
  },{
    id:"toko_2",
    name:"Platinum",
    recommend:false,
    features:[
      true,
      true,
      true,
      true,
      true,
      false
    ]
  },{
    id:"toko_3",
    name:'Gold',
    features:[
      true,
      true,
      true,
      true,
      true,
      true
    ]
  }
]

type IProduct = {
  price: number,
  disscount: number,
  metadata: {
    id: string,
    qty: number
  }
}

interface SectionProps {
  item: IProduct
}

function PricingSection({item}: SectionProps) {
  const t = useTranslations();
  const [expand,setExpand] = React.useState(false)
  const {price,disscount,metadata:{id,qty}} = item
  const packages = React.useMemo(()=>PACKAGES.find(p=>p.id === id),[id])
  const fitur = React.useMemo(()=>FEATURES(t),[t])

  if(!packages) return null;
  const {name,features,recommend}=packages;

  return (
    <Grid item xs={12} md={6} lg={4}>
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
            {disscount ? (
              <>
                <Box alignItems='center' justifyContent='center' position='relative' display='flex'>
                  <Typography variant='h6' component='h6' sx={{color: 'text.disabled',textDecoration: 'line-through'}}>{`IDR ${numberFormat(`${price}`)}`}</Typography>
                  <Label
                    variant="filled"
                    color={'error'}
                    sx={{
                      zIndex: 9,
                      ml:2,
                      textTransform: 'uppercase'
                    }}
                  >
                    {`${((price/qty)/((price/qty)-(disscount/qty))).toFixed(2)}% OFF`}
                  </Label>
                </Box>
                <Box display='flex' justifyContent='center' alignItems='flex-start'>
                  <Typography component='span' sx={{fontWeight:'bold',mr:1}}>IDR </Typography>
                  <Typography variant='h4' component='h4'>{`${numberFormat(`${Math.round((price/qty)-(disscount/qty))}`)}`}<Typography component='span' variant='body2'>{`/${t("Subcribe.month")}`}</Typography></Typography>
                </Box>
              </>
            ) : (
              <Box display='flex' justifyContent='center' alignItems='flex-start'>
                <Typography component='span' sx={{fontWeight:'bold',mr:1}}>IDR </Typography>
                <Typography variant='h4' component='h4'>{`${numberFormat(`${Math.round(price/qty)}`)}`}<Typography component='span' variant='body2'>{`/${t("Subcribe.month")}`}</Typography></Typography>
              </Box>
            )}
            
          </Box>
          <Divider sx={{pt:2}} />
          <Box textAlign='center' mt={2}>
            <Typography variant='h5' component='h5'>{`${qty} ${t("Subcribe.month")}`}</Typography>
          </Box>                 
        </CardContent>

        <Divider />

        <CardActions disableSpacing>
          <Typography variant='h5' component='h5'>{t("Subcribe.feature.title")}</Typography>
          <ExpandMore expand={expand} onClick={()=>setExpand(!expand)} aria-expanded={expand} aria-label='Features'>
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>
        
        <Collapse in={expand} timeout='auto' unmountOnExit>
          <Box pl={3} pr={3}>
            <List>
              {features.map((f,i)=>(
                <ListItem key={`features-${i}`}>
                  <ListItemIcon>
                    <Iconify icon={f ? 'akar-icons:circle-check':'akar-icons:circle-x'} sx={{color:f ? 'primary.main' : 'error.main'}} />
                  </ListItemIcon>
                  <ListItemText primary={fitur[i]} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Collapse>

        <Divider />

        <CardContent>
          <CardActions>
            <Box flex="1 1 0">
              <Button size='large' sx={{display:'flex',flexGrow:1,width:'100%'}}>{t("Subcribe.subcribe")}</Button>
            </Box>
          </CardActions>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default function PricingApp() {
  const t = useTranslations();
  const {data,error} = useSWR<IProduct[]>(`/subscription/all/toko`);

  return (
    <Header title={t("Menu.pricing")}>
      <Dashboard>
        <Container maxWidth='xl'>
          <Box textAlign='center' mb={4}>
            <Typography variant='h1' component='h1'>{t("Menu.pricing")}</Typography>
          </Box>

          {(!data && !error || !data) ? (
            <Circular />
          ) : error ? (
            <Box display='flex' alignItems='center' flexGrow='1' justifyContent='center'>
              <Typography variant='h3' component='h3'>{error?.message}</Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                {data?.map(d=>(
                  <PricingSection key={`pricing-${d.metadata.id}`} item={d} />
                ))}
              </Grid>
              <Divider sx={{mt:7}} />
              <Box mt={7}>
                <Typography sx={{color:'text.disabled'}}>{`* ${t("Subcribe.feature.first_free")}`}</Typography>
                <Typography sx={{color:'text.disabled'}}>{`** ${t("Subcribe.feature.max_table_number")}`}</Typography>
              </Box>
            </>
          )}
        </Container>
      </Dashboard>
    </Header>
  )
}
