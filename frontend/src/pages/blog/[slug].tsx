// material
import { Box, Grid, Container, Typography,Hidden, Divider, Stack } from '@mui/material';
import {Edit} from '@mui/icons-material'
import wrapper from '@redux/store'
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import {truncate,clean} from '@portalnesia/utils'
import React from 'react'
import {useTranslation} from 'next-i18next';
import Button from '@comp/Button'
import Image from '@comp/Image'
import { getDayJs, photoUrl } from '@utils/Main';
import { Markdown,usePageContent } from '@comp/Parser';
import { useRouter } from 'next/router';
import useTableContent,{HtmlLgDown,HtmlLgUp} from '@comp/TableContent'
import Sidebar from '@comp/Sidebar'
import {Blog,IPages} from '@type/index'
import useSWR from '@utils/swr';
import { Circular } from '@comp/Loading';
import Avatar from '@comp/Avatar';
import Comments from '@comp/Comments';

export const getServerSideProps = wrapper(async({redirect,request,getTranslation,params,locale})=>{
  const slug = params?.slug;
  if(typeof slug !== 'string') return redirect();

  const blog = await request<Blog>('get',`/blogs/${slug}`);

  return {
    props:{
      meta: blog,
      ...(await getTranslation('pages',locale||'en'))
    }
  }
})

export default function BlogPages({meta}: IPages<Blog>) {
  const {t} = useTranslation('pages');
  usePageContent(true);
  const router = useRouter();
  const slug = router?.query?.slug;
  const locale = router.locale||'en';
  const {content} = useTableContent({data:meta})
  const {data,error} = useSWR<Blog>(`/blogs/${slug}`,{revalidateOnMount:false,fallback:meta});

  const date = React.useMemo(()=>{
    return getDayJs(data?.data?.publishedAt||undefined,true).locale(locale)
  },[data,locale])

  return (
    <Header title={meta?.data?.title} desc={truncate(meta?.data?.text||'',300)} image={photoUrl(meta?.data?.image?.url)}>
      <Dashboard withDashboard={false} backToTop={{position:'bottom',color:'primary'}} whatsappWidget={{enabled:false}}>
        <Container maxWidth={content.length > 0 ? 'xl' : 'lg'}>
          {!data && !error ? (
            <Box textAlign='center'>
              <Circular />
            </Box>
          ) : error ? (
            <Box textAlign='center'>
              <Typography variant='h4' component='h4'>{error?.error?.message}</Typography>
            </Box>
          ) : (
            <>
              <Box mb={8}>
                <Typography variant='h1' component='h1'>{data?.data?.title}</Typography>
                <Divider sx={{my:2}} />
                <Stack direction='row' spacing={2} alignItems='center' justifyContent={'space-between'}>
                    <Stack direction='row' spacing={2} alignItems='center' justifyContent={{xs:'flex-start',sm:'flex-end'}}>
                      <Avatar alt={data?.data?.createdBy?.name} 
                        {...(data?.data?.createdBy?.picture ? {
                          children: <Image alt={data?.data?.createdBy?.name} src={data?.data?.createdBy?.picture} style={{width:40}} />
                        } : {
                          children:data?.data?.createdBy?.name
                        })}
                      />
                      <Typography sx={{textAlign:{sx:'left',sm:'right'}}}>{data?.data?.createdBy?.name}</Typography>
                    </Stack>

                    <Typography sx={{textAlign:{sx:'left',md:'right'}}}>{`${date.pn_format('minimal')}`}</Typography>
                  </Stack>
              </Box>
              
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} lg={content.length > 0 ? 8 : 12}>
                  <Box id='cardContent'>
                    <Markdown source={data?.data?.text||""} />
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
              <Grid container spacing={2} sx={{mt:3}}>
                <Grid item xs={12} lg={content.length > 0 ? 8 : 12}>
                  {data && <Comments type='api::blog.blog' id={data?.data?.id} /> }
                </Grid>
              </Grid>
            </>
          )}
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