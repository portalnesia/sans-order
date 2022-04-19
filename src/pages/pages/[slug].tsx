// material
import { Box, Grid, Container, Typography,Hidden } from '@mui/material';
import {Edit} from '@mui/icons-material'
import wrapper from '@redux/store'
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import {numberFormat,truncate,clean} from '@portalnesia/utils'
import React from 'react'
import Image from '@comp/Image'
import {staticProps} from '@redux/store'
import {useTranslation} from 'next-i18next';
import Button from '@comp/Button'
import useSWR from '@utils/swr'
import {Circular} from '@comp/Loading'
import Label from '@comp/Label'
import Iconify from '@comp/Iconify'
import nodePath from 'path'
import fs from 'fs'
import axios from 'axios'
import splitMarkdown from '@utils/split-markdown';
import { marked } from 'marked';
import htmlEncode from '@utils/html-encode'
import { getDayJs } from '@utils/Main';
import { convertToPlaintext } from '@utils/marked';
import { Parser,usePageContent } from '@comp/Parser';
import { useRouter } from 'next/router';
import useTableContent,{HtmlLgDown,HtmlLgUp} from '@comp/TableContent'
import Sidebar from '@comp/Sidebar'

async function getData(slug: string) {
  try {
    if(process.env.NODE_ENV === 'development') {
      const github = await fs.promises.readFile(slug);
      return github.toString();
    } else {
      const github = `https://raw.githubusercontent.com/portalnesia/sans-order/main/data/pages/${slug}.md`
      const r = await axios.get<string>(github);
      return r?.data||undefined;
    }
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
    html: string,
    keywords?: string[],
    callbackLang: boolean
  }
}

export const getServerSideProps = wrapper(async({params,locale,redirect,getTranslation})=>{
  const slug = params?.slug
  const bhs = locale||'id';
  if(typeof slug !== 'string') return redirect();
  try {
    let callbackLang = false;
    const path = bhs === 'id' ? `./data/pages/${slug}.md` : `./data/pages/en/${slug}.md`
    let github: string|undefined = await getData(path);
    if(!github) {
      callbackLang = true;
      github = await getData(`./data/pages/${slug}.md`);
    }
    if(!github) return redirect();

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

    const defaultKeywords = ['Pages','Order System','Developer','Docs','Documentation'];
    meta.keywords = defaultKeywords.concat((meta?.keywords||[]));

    return {props:{meta,...(await getTranslation('pages',bhs))}}
  } catch {
    return redirect();
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
  },[locale])

  return (
    <Header title={meta.title} desc={meta.description}>
      <Dashboard>
        <Container>
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