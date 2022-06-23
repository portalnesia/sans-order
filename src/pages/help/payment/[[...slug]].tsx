// material
import { Box, Grid, Container, Typography,Hidden,Stack } from '@mui/material';
import {Edit,ArrowBack,ArrowForward } from '@mui/icons-material'
import wrapper,{staticProps} from '@redux/store'
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import {numberFormat,truncate,clean} from '@portalnesia/utils'
import React from 'react'
import Image from '@comp/Image'
import {useTranslation} from 'next-i18next';
import Button from '@comp/Button'
import {useDefaultSWR} from '@utils/swr'
import {Circular} from '@comp/Loading'
import Label from '@comp/Label'
import Iconify from '@comp/Iconify'
import nodePath from 'path'
import fs from 'fs'
import axios from 'axios'
import splitMarkdown from '@utils/split-markdown';
import { marked } from 'marked';
import htmlEncode from '@utils/html-encode'
import { getDayJs,getDir } from '@utils/Main';
import { convertToPlaintext } from '@utils/marked';
import { Parser,usePageContent } from '@comp/Parser';
import { useRouter } from 'next/router';
import useTableContent,{HtmlLgDown,HtmlLgUp} from '@comp/TableContent'
import Sidebar from '@comp/Sidebar'
import Link from 'next/link'
import { BankCode} from '@type/index';
import {QrisIcon,BankIcon,DanaIcon,ShopeePayIcon,LinkAjaIcon} from '@comp/payment-icon/index'

async function getData(slug: string) {
  try {
    const github = await fs.promises.readFile(`./data/help/${slug}.md`);
    return github.toString();
    /*if(process.env.NODE_ENV === 'development') {
      console.log(slug)
      const github = await fs.promises.readFile(`./data/help/${slug}.md`);
      return github.toString();
    } else {
      const branch = process.env.NEXT_PUBLIC_PN_ENV === 'production' ? 'main' : 'dev';
      const github = `https://raw.githubusercontent.com/portalnesia/sans-order/${branch}/data/help/${slug}.md`
      const r = await axios.get<string>(github);
      return r?.data||undefined;
    }*/
  } catch {
    return undefined;
  }
}

type PaymentCode = BankCode | 'EWALLET' | 'QRIS' | 'COD'
type IIndex = {title: string,link: string,key: PaymentCode}

async function getIndex() {
  const file = await fs.promises.readFile('./data/help/payment/index.json');
  const index = Buffer.from(file).toString();
  const json = JSON.parse(index) as IIndex[];
  return json;
}

type IPages = {
  meta: {
    published?: string,
    modified?: string,
    title?: string,
    slug?: string,
    description?: string,
    html: string,
    keywords?: string[],
    callbackLang: boolean,
    index: IIndex[]
  }
}

type StaticPathsResult = {
  locale: string;
  params: {
    slug?: string[];
  }
}

export async function getStaticPaths() {
  const dir = await getDir('./data/help/payment/**/*.md');
  const id = dir.map(s=>({locale:'id',params:{slug:s.replace('.md','').replace('./data/help/payment/','').split("/")}})) as StaticPathsResult[];
  const en = dir.map(s=>({locale:'en',params:{slug:s.replace('.md','').replace('./data/help/payment/','').split("/")}})) as StaticPathsResult[];
  const paths = id.concat(en);
  paths.push({locale:'id',params:{slug:undefined}},{locale:'en',params:{slug:undefined}})

  return {
    paths,
    fallback:true
  }
}

export const getStaticProps = staticProps(async({getTranslation,locale,params})=>{
  let slugs = params?.slug as string|string[]|undefined;
  const bhs = (locale||'id') as string;
  if(typeof slugs === 'undefined') {
    return {props:{meta:{
      html:'',
      callbackLang:false
    },...(await getTranslation('pages',bhs))}}
  }
  try {
    if(!Array.isArray(slugs)) return {notFound:true}
    let slug = `payment/${slugs.join("/")}`;
    let callbackLang = false;
    const path = bhs === 'id' ? `${slug}` : `en/${slug}`
    let github: string|undefined = await getData(path);
    if(!github) {
      callbackLang = true;
      github = await getData(`${slug}`);
    }
    if(!github) return {notFound:true}

    const split = splitMarkdown(github);
    const meta = split.meta||{};
    meta.callbackLang = callbackLang;
    if(meta?.description) {
      meta.description = truncate(clean(meta.description),200)
    } else {
      meta.description = convertToPlaintext(split.html);
    }
    const markHtml = marked(split.html);
    const html = htmlEncode(markHtml,true);
    
    meta.published = getDayJs().utcOffset(7).format("YYYY-MM-DDTHH:mm:ssZ");
    meta.modified = getDayJs((meta?.modified ? meta?.modified : undefined)).utcOffset(7).format("YYYY-MM-DDTHH:mm:ssZ");

    meta.html = html;
    meta.slug = slug

    const defaultKeywords = ['Payment','Order System','Help','Docs','Documentation'];
    meta.keywords = defaultKeywords.concat((meta?.keywords||[]));
    meta.index = await getIndex();

    return {props:{meta,...(await getTranslation('pages',bhs))}}
  } catch {
    return {notFound:true}
  }
})

function PaymentHelpDetail({meta}: IPages) {
  const {t} = useTranslation('pages');
  usePageContent(true);
  const router = useRouter();
  const locale = router.locale;
  const {content} = useTableContent({data:meta})

  const [prev,next] = React.useMemo(()=>{
    const slg = meta?.slug;
    const paymentIndex = meta?.index;
    if(paymentIndex && paymentIndex?.length > 0 && slg) {
      const current = paymentIndex.findIndex(s=>slg && slg.match(s.link));
      if(current > -1) {
        if(current === 0) {
          const prev = paymentIndex[paymentIndex?.length - 1]
          const next = paymentIndex[current + 1];
          return [prev,next];
        }
        else if(current === paymentIndex?.length - 1) {
          const prev = paymentIndex[current - 1];
          const next = paymentIndex[0]
          return [prev,next];
        }
        else {
          const prev = paymentIndex[current - 1];
          const next = paymentIndex[current + 1];
          return [prev,next];
        }
      }
    }
    return [null,null]
  },[meta])

  const editUrl = React.useMemo(()=>{
    return meta?.slug ? `https://github.com/portalnesia/sans-order/edit/main/data/help/${locale!=='id' ? `${locale}/` : ''}${meta?.slug}.md` : ''
  },[locale,meta])

  return (
    <Container maxWidth={content.length > 0 ? 'xl' : 'lg'}>
      <Box textAlign='center' mb={8}>
        <Typography variant='h1' component='h1'>{meta?.title}</Typography>
      </Box>
      {meta.callbackLang && (
        <Box mb={8}>
          <blockquote><Typography variant='h5'>{t("lang")}</Typography></blockquote>
        </Box>
      )}

      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} lg={content.length > 0 ? 8 : 12}>
          <Box id='cardContent'>
            <Parser html={meta.html} />
          </Box>
        </Grid>
        <Hidden lgDown>
          <Grid item xs={12} lg={4}>
            <Sidebar id='cardContent'>
              <HtmlLgDown data={meta} />
            </Sidebar>
          </Grid>
        </Hidden>
      </Grid>

      <Box mt={4}>
        <Button size='large' outlined color='inherit' startIcon={<Edit />} sx={{textTransform:'unset'}} className='no-format not_blank' target='_blank' rel='nofollow noopener noreferrer' component='a' href={editUrl}>{t("edit")}</Button>
      </Box>

      {(prev !== null || next !== null) && (
        <Box mt={8}>
          <Grid container spacing={1} alignItems='center' justifyContent='space-between'>
            {prev !== null && (
              <Grid item xs={12} sm={6}>
                <Link href={`/help/payment${prev?.link}`} passHref><Button className='no-format not_blank' component='a' startIcon={<ArrowBack />} outlined size='large' sx={{textAlign:'unset',textTransform:'unset'}}>
                  <div>
                    <Typography color='text.secondary' sx={{fontSize:13}}>{t('previous')}</Typography>
                    <Typography>{prev?.title}</Typography>
                  </div>
                </Button></Link>
              </Grid>
            )}

            {next !== null && (
              <Grid item xs={12} sm={!prev ? 12 : 6} sx={{textAlign:'right'}}>
                <Link href={`/help/payment${next?.link}`} passHref><Button className='no-format not_blank' component='a' endIcon={<ArrowForward />} outlined size='large' sx={{textAlign:'unset',textTransform:'unset'}}>
                  <div>
                    <Typography color='text.secondary' sx={{fontSize:13}}>{t('next')}</Typography>
                    <Typography>{next?.title}</Typography>
                  </div>
                </Button></Link>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
      {content.length > 0 && (
        <Hidden lgUp>
          <HtmlLgUp data={meta} />
        </Hidden>
      )}
    </Container>
  )
}

export default function PaymentHelp({meta}: IPages) {
  const router = useRouter();
  const {slug} = router.query;
  //const {data:paymentIndex,error} = useIndex();

  const icon = React.useCallback((data: PaymentCode)=>{
    if(data === 'QRIS') return <QrisIcon />;

    if(data === 'EWALLET') {
      return (
        <Box textAlign='center'>
          <Typography>E-Wallet</Typography>
          <Stack mt={4} direction='row' spacing={2} justifyContent='center' alignItems='center'>
            <DanaIcon />
            <LinkAjaIcon />
            <ShopeePayIcon />
          </Stack>
        </Box>
      )
    }

    if(['MANDIRI','BRI','BNI','PERMATA'].includes(data)) {
      if(typeof BankIcon[data as BankCode] !== 'undefined') {
        const Element = BankIcon[data as BankCode];
        return <Element />;
      }
    }

    if(data === 'COD') return <Typography>COD</Typography>;
    return null
  },[])

  return (
    <Header title={meta?.title} desc={meta?.description}>
      <Dashboard>
        {typeof slug?.[0] !== 'undefined' ? (
          <PaymentHelpDetail meta={meta} />
        ) : (
          <Container>
            <Grid container spacing={2}>

            </Grid>
          </Container>
        )}
      </Dashboard>
    </Header>
  )
}