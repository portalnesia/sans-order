// material
import { Box, Grid, Container, Typography,IconButton,TextField, Card, CardContent,Stack,MenuItem,ListItemText, styled, SxProps, Theme, Tooltip } from '@mui/material';
import {Download} from '@mui/icons-material'
import {DatePicker,LocalizationProvider} from '@mui/lab'
import AdapterDayjs from '@mui/lab/AdapterDayjs'
// components
import Header,{withForbidden} from '@comp/Header';
import Dashboard from '@layout/dashboard/index'
import React from 'react'
import Button from '@comp/Button'
import {IPages} from '@type/index'
import wrapper from '@redux/store'
import {useTranslation,TFunction} from 'next-i18next';
import useSWR from '@utils/swr';
import { useRouter } from 'next/router';
import Iconify from '@comp/Iconify';
import MenuPopover from '@comp/MenuPopover'
import { numberFormat } from '@portalnesia/utils';
import { getDayJs } from '@utils/Main';
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsReact from 'highcharts-react-official'
import { Circular } from '@comp/Loading';
import Backdrop from '@comp/Backdrop';

if(typeof Highcharts === 'object') {
  HighchartsExporting(Highcharts)
}
export const getServerSideProps = wrapper({name:'check_outlet',outlet:{onlyMyToko:true},translation:'dash_index'})

type IIncome = {
  income:number,
  total_transactions:number
}

type GraphItems = {
  name: string,
  y: number
}

type IResponse = {
  data: IIncome,
  today: IIncome,
  graph:{
    items: GraphItems[],
    transactions:{
      date: string[],
      time: number[],
      total: number[]
    }
  }
}

const Div = styled('div')(()=>({}))

const cardData=['income_today','tr_today','income','tr'] as ('income_today'|'tr_today'|'income'|'tr')[];
const cardDataTitleFunction=(locale: string,t: TFunction,query: {filter:string,from:null|number,to:null|number})=>{
  const filters = query.filter === 'custom' && query.from && query.to ? `${getDayJs(query.from).locale(locale).pn_format('fulldate')} - ${getDayJs(query.to).locale(locale).pn_format('fulldate')}` : query.filter === 'weekly' ? t("week") : t("month");
  return [`${t("income")} ${t("today")}`,`${t("transactions")} ${t("today")}`,`${t("income")} ${filters}`,`${t("transactions")} ${filters}`]
}
const cardSx: SxProps<Theme>[] = [
  {
    backgroundColor:(t)=>t.palette.mode==='dark' ? t.palette.primary.dark : t.palette.primary.lighter,
  },{
    backgroundColor:(t)=>t.palette.mode==='dark' ? t.palette.info.dark : t.palette.info.lighter
  },{
    backgroundColor:(t)=>t.palette.mode==='dark' ? t.palette.warning.dark : t.palette.warning.lighter
  },{
    backgroundColor:(t)=>t.palette.mode==='dark' ? t.palette.error.dark : t.palette.error.lighter
  }
]

export default function OutletIndex({meta}: IPages) {
  const {t} = useTranslation('dash_index');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');

  const router = useRouter();
  const locale = router.locale||'en'
  const {toko_id,outlet_id} = router.query;
  const [query,setQuery]=React.useState<{filter:string,from:null|number,to:null|number}>({filter:'monthly',from:null,to:null})
  const [range,setRange]=React.useState({from:getDayJs().subtract(1, 'month'),to:getDayJs()})
  const [dFilter,setDFilter] = React.useState(false);
  const [dRange,setDRange] = React.useState(false);
  const filterRef = React.useRef(null);
  const rangeRef = React.useRef(null);
  const {data,error}=useSWR<IResponse>(`/toko/${toko_id}/${outlet_id}/insight?filter=${query?.filter}${query?.filter === 'custom' ? `&from=${query?.from}&to=${query?.to}` : ''}`)
  const [graph,setGraph] = React.useState<{items: IResponse['graph']['items']|null,transactions: IResponse['graph']['transactions']|null}>({items:null,transactions:null});
  const [iData,setIData] = React.useState<{income:number|null,tr:number|null,income_today:number|null,tr_today:number|null}>({income:null,tr:null,income_today:null,tr_today:null});
  const [trChart,setTrChart] = React.useState<null|any>(null);
  const [itChart,setItChart] = React.useState<null|any>(null);
  const [loading,setLoading] = React.useState(false)

  const itCanvas = React.useRef<HTMLCanvasElement>(null);
  const trCanvas = React.useRef<HTMLCanvasElement>(null);
  const itHighchart = React.useRef<HighchartsReact.RefObject>(null);
  const trHighchart = React.useRef<HighchartsReact.RefObject>(null);

  const cardDataTitle = React.useMemo(()=>{
    return cardDataTitleFunction(locale,t,query);
  },[locale,t,query])

  const title=React.useMemo(()=>{
    let title: string
    if(query.filter === 'custom' && query.from && query.to) {
      title = `${getDayJs(query.from).locale(locale).utc(true).pn_format('fulldate')} - ${getDayJs(query.to).utc(true).locale(locale).pn_format('fulldate')}`;
    } else if(query.filter === 'weekly') {
      title = `${getDayJs().subtract(1,'week').utc(true).locale(locale).pn_format('fulldate')} - ${getDayJs().utc(true).locale(locale).pn_format('fulldate')}`;
    } else {
      title = `${getDayJs().subtract(1,'month').utc(true).locale(locale).pn_format('fulldate')} - ${getDayJs().utc(true).locale(locale).pn_format('fulldate')}`;
    }
    return title;
  },[query,locale])

  const handleChange=React.useCallback((filter:'monthly'|'weekly'|'custom')=>()=>{
    if(filter!=='custom') {
      setQuery({filter,from:null,to:null})
      setDFilter(false);
    } else {
      const from = range.from.unix();
      const to = range.to.unix();
      setQuery({filter,from,to})
      setDFilter(false);
      setDRange(false);
    }
  },[range])

  const handleDateChange=React.useCallback((name: 'from'|'to')=>(value: any)=>{
    const val = getDayJs(value);
    if(name === 'from' && range.to.isAfter(val.add(1,'month'))) {
      setRange({
        ...range,
        to:val.add(1,'month'),
        [name]:value
      });
    } else if(name === 'to' && range.from.isBefore(val.subtract(1,'month'))) {
      setRange({
        ...range,
        from:val.subtract(1,'month'),
        [name]:value
      });
    }  else {
      setRange({
        ...range,
        [name]:value
      });
    }
  },[range])

  const handleDownload = React.useCallback((type: 'item'|'transaction')=>()=>{
    setLoading(true);
    const highchart = type==='item' ? itHighchart.current : trHighchart.current;
    const canvas = type==='item' ? itCanvas.current : trCanvas.current;
    if(highchart && canvas) {
      console.log(highchart)
      const svg = highchart?.chart?.getSVG({chart:{width:1000,height:500}});
      const blob = new Blob([svg], {
        type: "image/svg+xml;charset=utf-8"
      })
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      const o = (window.webkitURL || window.URL)
      const url =o.createObjectURL(blob);
      let image = new Image;
      image.src = url;
      image.onload = ()=>{
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, 1e3, 500);
        ctx.font='130px sans-serif';
        ctx.textAlign='center'
        ctx.textBaseline='middle';
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillText(`SansOrder`,500,250,800);
        o.revokeObjectURL(url)

        const tt=canvas.toDataURL();
        for (var e, aa = atob(tt.split(",")[1]), n = new ArrayBuffer(aa.length), oo = new Uint8Array(n), i = 0; i < aa.length; i++) oo[i] = 255 & aa.charCodeAt(i);
        try {
          e = new Blob([n], {
            type: "image/png"
          })
        } catch (t) {
          var r = new((window as any).WebKitBlobBuilder || (window as any).MozBlobBuilder);
          r.append(n), e = r.getBlob("image/png")
        }
        const urll = o.createObjectURL(e);
        setLoading(false);
        const a = document.createElement('a');
        a.href = urll;
        a.download = `${type === 'item' ? `${tMenu("products")} ${t("best_seller")}` : `${t("chart",{what:t("income")})}`} ${title}.png`;
        a.click();
        a.remove();
        o.revokeObjectURL(e)
      }
    }
  },[title,t,tMenu])

  React.useEffect(()=>{
    Highcharts.setOptions({
      lang:{
        months: locale==='id' ? ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'] : ['January','February','March','April','May','June','July','August','September','October','November','December']
      },
    })
  },[locale])

  React.useEffect(()=>{
    const option={
      chart: {
        type: "line",
        style: {
          fontFamily: "serif"
        }
      },
      exporting: {
        enabled: !1
      },
      credits: {
        enabled: true,
        href:process.env.URL,
        text:"SansOrder",
        style:{
          fontSize:'12px',
          color:'#000'
        }
      },
      title: {
        style: {
          color: "#000000",
          fontSize: "20px",
          fontWeight: "bold"
        }
      },
      subtitle: {
        text: `${meta?.title}`,
        style:{
          fontSize:'15px'
        }
      },
      plotOptions: {
        line: {
          cursor: "pointer",
            dataLabels: {
              enabled: !0,
              crop: 0,
              overflow: 'allow',
              format: "{point.y}"
            },
          marker: {
            enabled: !0,
            symbol: "circle",
            radius: 4,
            states: {
              hover: {
                enabled: !0
              }
            }
          }
        }
      },
      tooltip: {
        split: !0,
        //@ts-ignore
        formatter: function(): any {
          // @ts-ignore
          return ['<p style="font-weight: 600;font-size:16px;color:#000">' + Highcharts.dateFormat("%e %B %Y", getDayJs(this.x).utc(true).toDate()) + "</p>"].concat(this.points ? this.points.map(function(t) {
              return '<span style="margin-right:2px;font-size:15px;color:#000">' + t.series.name + ':</span>  <span style="font-weight: 600;margin-right:2px;font-size:15px;color:#000">IDR ' + numberFormat(t.y,".") + "</span>"
          }) : [])
        }
      },
      legend: {
        enabled: false
      },
    }
    if(graph?.transactions !== null && graph?.transactions?.time?.length > 0) {
      const gr=document.getElementById('transactions-chart');
      const width=gr?.clientWidth||gr?.offsetWidth||0;
      const opt={
        ...option,
        series: [{
          data: graph?.transactions?.total,
          name: t("income"),
          pointStart: graph?.transactions?.time[0],
          pointInterval: 864e5
        }],
        title:{
          ...option.title,
          text:`${t("chart",{what:t("income")})} ${title}`
        },
        xAxis: {
          type: "datetime",
          dateTimeLabelFormats: {
            day: "%e %b"
          },
          labels: {
            style: {
              color: "#000000",
            }
          },
          crosshair: {
            width: Math.round(width / graph.transactions.time.length),
            color: "rgba(204,214,235,0.25)"
          }
        },
        yAxis: {
          title: {
            text: "IDR",
            style: {
              fontSize:"18px"
            }
          },
          labels: {
            style: {
              color: "#000000",
              fontSize:"15px"
            }
          }
        },
      }
      setTrChart(opt);
    } else {
      setTrChart(null);
    }

    if(graph?.items !== null && graph.items.length > 0) {
      const opt={
        ...option,
        chart: {
          ...option.chart,
          type: 'column'
        },
        title:{
          ...option.title,
          text:`${tMenu("products")} ${t("best_seller")} ${title}`
        },
        xAxis: {
          type: 'category',
          labels: {
            style: {
              color: "#000000",
              fontSize:"15px"
            },
            //@ts-ignore
            formatter: function () {
              //@ts-ignore
                return this.value;
            }
          }
        },
        series:[{
          data: graph?.items,
          name: tMenu("products")
        }],
        tooltip: {
          shared: true,
          headerFormat: '<span style="font-weight: 600;font-size:16px;color:#000">{point.point.name}</span><br/>',
          pointFormat: `<span style="margin-right:2px;font-size:15px;color:#000">${t("sold")}: <b>{point.y}</b></span><br/>`
        },
        plotOptions: {
          series: {
            borderWidth: 0,
            dataLabels: {
              enabled: true,
              format: '{point.y}',
              style:{
                fontSize:'15px'
              }
            }
          }
        },
        yAxis: {
          title: {
            text: "Total",
            style: {
              fontSize:"18px"
            }
          },
          labels: {
            style: {
              color: "#000000",
              fontSize:"15px"
            }
          }
        },
      }
      setItChart(opt);
    } else {
      setItChart(null);
    }
  },[graph,iData,title,t,tMenu,meta])

  React.useEffect(()=>{
    if(data) {
        setIData({income_today:Number(data.today.income),tr_today:Number(data.today.total_transactions),income:Number(data.data.income),tr:Number(data.data.total_transactions)})
        setGraph(data.graph)
    }
  },[data])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Header title={meta?.title} desc={meta?.description}>
        <Dashboard title={meta?.title} subtitle={meta?.toko_name}>
          <Container>
            <Box pb={2} mb={5}>
              <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
                <Typography variant="h3" component='h3'>{tMenu("home")}</Typography>
                <Button startIcon={<Iconify icon='akar-icons:filter' />} text color='inherit' ref={filterRef} onClick={()=>setDFilter(true)}>Filter</Button>
              </Stack>
              <MenuPopover open={dFilter} onClose={()=>setDFilter(false)} anchorEl={filterRef.current} paperSx={{py:1,width:250}}>
                <MenuItem sx={{ color: 'text.secondary',py:1 }} onClick={handleChange('monthly')} selected={query.filter==='monthly'}>
                  <ListItemText primary={t("month")} />
                </MenuItem>
                <MenuItem sx={{ color: 'text.secondary',py:1 }}  onClick={handleChange('weekly')} selected={query.filter==='weekly'}>
                  <ListItemText primary={t("week")} />
                </MenuItem>
                <MenuItem sx={{ color: 'text.secondary',py:1 }} ref={rangeRef} onClick={()=>setDRange(true)} selected={query.filter==='custom'}>
                  <ListItemText primary={t("custom")} />
                </MenuItem>
              </MenuPopover>
              <MenuPopover open={dRange} onClose={()=>setDRange(false)} anchorEl={rangeRef.current} paperSx={{py:2,px:2,width:{xs:'90%',sm:200,md:300,lg:400}}}>
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <DatePicker
                      disableFuture
                      label={t("from")}
                      inputFormat="DD MMMM YYYY"
                      value={range.from}
                      onChange={handleDateChange('from')}
                      renderInput={params=><TextField fullWidth {...params} />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <DatePicker
                      disableFuture
                      label={t("to")}
                      inputFormat="DD MMMM YYYY"
                      value={range.to}
                      onChange={handleDateChange('to')}
                      renderInput={params=><TextField fullWidth {...params} />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button onClick={handleChange('custom')}>{tCom("save")}</Button>
                  </Grid>
                </Grid>
              </MenuPopover>
            </Box>
            {!data && !error ? (
              <Box display='flex'><Circular /></Box>
            ) : error ? (
              <Box display='flex' alignItems='center' flexGrow='1' justifyContent='center'>
                <Typography variant='h3' component='h3'>{error?.message}</Typography>
              </Box>
            ) : (
              <>
                <Box mb={8}>
                  <Grid container spacing={4} justifyContent="center" flexGrow={1}>
                    {cardData.map((dt,i)=>(
                      <Grid item key={dt} xs={6} lg={3}>
                        <Card sx={{...cardSx[i],height:'100%',display:'flex',flexGrow:1,justifyContent:'center',alignItems:'center'}}>
                          <CardContent>
                            <Div sx={{textAlign:'center'}}>
                              <Typography variant='h4' component='h4'>{iData?.[dt] != 0 ? (['income','income_today'].includes(dt) ? `${`IDR ${numberFormat(`${iData?.[dt]}`)}`}` : iData[dt]) : (['income','income_today'].includes(dt) ? 'IDR 0' : '0')}</Typography>
                              <Typography variant='subtitle2'>{cardDataTitle[i]}</Typography>
                            </Div>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                <Box>
                  <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
                            <Typography variant='h4' component='h4'>{`${tMenu("products")} ${t("best_seller")} ${title}`}</Typography>
                            <Tooltip title="Download"><IconButton onClick={handleDownload('item')}><Download /></IconButton></Tooltip>
                          </Stack>
                          <Div sx={{mt:2}} id='items-chart'>
                            {trChart === null ? (
                              <Div sx={{display:'flex',justifyContent:'center',my:3}}>
                                <Typography variant='h6' component='h6'>{tCom("no_what",{what:"Data"})}</Typography>
                              </Div>
                            ) : <HighchartsReact ref={itHighchart} highcharts={Highcharts} options={itChart} />}
                          </Div>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
                            <Typography variant='h4' component='h4'>{`${t("chart",{what:t("income")})} ${title}`}</Typography>
                            <Tooltip title="Download"><IconButton onClick={handleDownload('transaction')}><Download /></IconButton></Tooltip>
                          </Stack>
                          <Div sx={{mt:2}} id='transactions-chart'>
                            {trChart === null ? (
                              <Div sx={{display:'flex',justifyContent:'center',my:3}}>
                                <Typography variant='h6' component='h6'>{tCom("no_what",{what:"Data"})}</Typography>
                              </Div>
                            ) : <HighchartsReact ref={trHighchart} highcharts={Highcharts} options={trChart} />}
                          </Div>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </Container>
        </Dashboard>
        <canvas ref={itCanvas} style={{display:'none'}} width={1000} height={500} />
        <canvas ref={trCanvas} style={{display:'none'}} width={1000} height={500} />
        <Backdrop open={loading} />
      </Header>
    </LocalizationProvider>
  )
}