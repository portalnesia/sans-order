// material
import { Box, Grid, Container, Typography,Hidden } from '@mui/material';
import {Edit} from '@mui/icons-material'
import {staticProps} from '@redux/store'
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import {truncate,clean} from '@portalnesia/utils'
import React from 'react'
import {useTranslation} from 'next-i18next';
import Button from '@comp/Button'
import fs from 'fs'
import splitMarkdown from '@utils/split-markdown';
import { getDayJs, getDir } from '@utils/Main';
import { convertToPlaintext } from '@utils/marked';
import { Markdown,usePageContent } from '@comp/Parser';
import { useRouter } from 'next/router';
import useTableContent,{HtmlLgDown,HtmlLgUp} from '@comp/TableContent'
import Sidebar from '@comp/Sidebar'

async function getData(slug: string) {
  try {
    const github = await fs.promises.readFile(`../data/pages/${slug}.md`);
    return github.toString();
    /*if(process.env.NODE_ENV === 'development') {
      const github = await fs.promises.readFile(`./data/pages/${slug}.md`);
      return github.toString();
    } else {
      const branch = process.env.NEXT_PUBLIC_PN_ENV === 'production' ? 'main' : 'dev';
      const github = `https://raw.githubusercontent.com/portalnesia/sans-order/${branch}/data/pages/${slug}.md`
      const r = await axios.get<string>(github);
      return r?.data||undefined;
    }*/
  } catch {
    return undefined;
  }
}

type IPages = {
  meta: {
    published: string,
    modified: string,
    title: string,
    slug: string,
    description: string,
    markdown: string,
    keywords?: string[],
    callbackLang: boolean
  }
}

export async function getStaticPaths() {
  const dir = await getDir('./data/pages/*.md');
  const id = dir.map(s=>({locale:'id',params:{slug:s.replace('.md','').replace('./data/pages/','')}}));
  const en = dir.map(s=>({locale:'en',params:{slug:s.replace('.md','').replace('./data/pages/','')}}));
  const paths = id.concat(en);
  return {
    paths,
    fallback:false
  }
}

export const getStaticProps = staticProps(async({getTranslation,locale,params})=>{
  try {
    const slug = params?.slug as string|string[]|undefined
    const bhs = locale||'id';
    if(typeof slug !== 'string') return {notFound:true}
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
        meta.description = convertToPlaintext(split.data);
      }
      
      meta.published = getDayJs().utcOffset(7).format("YYYY-MM-DDTHH:mm:ssZ");
      meta.modified = getDayJs((meta?.modified ? meta?.modified : undefined)).utcOffset(7).format("YYYY-MM-DDTHH:mm:ssZ");

      meta.markdown = split.data;
      meta.slug = slug

      const defaultKeywords = ['Pages','Order System','Developer','Docs','Documentation'];
      meta.keywords = defaultKeywords.concat((meta?.keywords||[]));
      
      return {props:{meta,...(await getTranslation('pages',bhs))}}
  } catch(e) {
    return {notFound:true}
  }
})

export default function Pages({meta}: IPages) {
  const {t} = useTranslation('pages');
  usePageContent(true);
  const router = useRouter();
  const locale = router.locale;
  const {content} = useTableContent({data:meta})

  const editUrl = React.useMemo(()=>{
    return `https://github.com/portalnesia/sans-order/edit/main/data/pages/${locale!=='id' ? `${locale}/` : ''}${meta?.slug}.md`
  },[locale,meta])

  return (
    <Header title={meta?.title} desc={meta?.description}>
      <Dashboard backToTop={{position:'bottom',color:'primary'}} whatsappWidget={{enabled:false}}>
        <Container maxWidth={content.length > 0 ? 'xl' : 'lg'}>
          <Box textAlign='center' mb={8}>
            <Typography variant='h1' component='h1'>{meta?.title}</Typography>
          </Box>
          {meta?.callbackLang && (
            <Box mb={8}>
              <blockquote><Typography variant='h5'>{t("lang")}</Typography></blockquote>
            </Box>
          )}
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} lg={content.length > 0 ? 8 : 12}>
              <Box id='cardContent'>
                <Markdown source={meta?.markdown||""} />
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
          <Box mt={8}>
            <Button size='large' outlined color='inherit' startIcon={<Edit />} sx={{textTransform:'unset'}} className='no-format not_blank' target='_blank' rel='nofollow noopener noreferrer' component='a' href={editUrl}>{t("edit")}</Button>
          </Box>
        </Container>
      </Dashboard>
      {content.length > 0 && (
        <Hidden lgUp>
          <HtmlLgUp data={meta} />
        </Hidden>
      )}
    </Header>
  )
}