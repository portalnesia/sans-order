// material
import { Box, Grid, Container, Typography,styled,Card,CardContent,CardActions,Divider,List,ListItemText,ListItem,Collapse,IconButton,IconButtonProps } from '@mui/material';
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

const PACKAGES = (t: ReturnType<typeof useTranslations>)=>([
  {
    id:"toko_1",
    name:"Bronze",
    features:[
      `${t("Subcribe.feature.free",{qty:1})}*`
    ]
  },{
    id:"toko_2",
    name:"Platinum",
    recommend:false,
    features:[
      `${t("Subcribe.feature.free",{qty:1})}*`
    ]
  },{
    id:"toko_3",
    name:'Gold',
    features:[
      `${t("Subcribe.feature.free",{qty:1})}*`
    ]
  }
])

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
  const packages = React.useMemo(()=>PACKAGES(t).find(p=>p.id === id),[id,t])

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
                    {`${(price/(price-disscount)).toFixed(2)}% OFF`}
                  </Label>
                </Box>
                <Box display='flex' justifyContent='center' alignItems='flex-start'>
                  <Typography component='span' sx={{fontWeight:'bold',mr:1}}>IDR </Typography>
                  <Typography variant='h4' component='h4'>{`${numberFormat(`${price-disscount}`)}`}</Typography>
                </Box>
              </>
            ) : (
              <Box display='flex' justifyContent='center' alignItems='flex-start'>
                <Typography component='span' sx={{fontWeight:'bold',mr:1}}>IDR </Typography>
                <Typography variant='h4' component='h4'>{`${numberFormat(`${price}`)}`}</Typography>
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
                  <ListItemText primary={f} />
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box textAlign='center' mb={4}>
                <Typography variant='h1' component='h1'>{t("Menu.pricing")}</Typography>
              </Box>
            </Grid>
            {!data && !error ? (
              <Circular />
            ) : error ? (
              <Box display='flex' alignItems='center' flexGrow='1' justifyContent='center'>
                <Typography variant='h3' component='h3'>{error?.message}</Typography>
              </Box>
            ) : data?.map(d=>(
              <PricingSection key={`pricing-${d.metadata.id}`} item={d} />
            ))}
          </Grid>
        </Container>
      </Dashboard>
    </Header>
  )
}
