// material
import { Box, Grid, Container, Typography,Hidden, Divider, Stack } from '@mui/material';
import {Edit} from '@mui/icons-material'
import {staticProps} from '@redux/store'
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import {truncate,clean} from '@portalnesia/utils'
import React from 'react'
import {useTranslation} from 'next-i18next';
import BlogSection from '@sections/Blog'
import Button from '@comp/Button'
import Image from '@comp/Image'
import { getDayJs, photoUrl } from '@utils/Main';
import { Markdown,usePageContent } from '@comp/Parser';
import { useRouter } from 'next/router';
import useTableContent,{HtmlLgDown,HtmlLgUp} from '@comp/TableContent'
import Sidebar from '@comp/Sidebar'
import {Blog} from '@type/index'
import useSWR from '@utils/swr';
import { Circular } from '@comp/Loading';
import Avatar from '@comp/Avatar';
import Pagination,{ usePagination } from '@comp/Pagination';

export const getStaticProps = staticProps({translation:'pages'});

export default function BlogIndex() {
  const {t} = useTranslation('pages');
  const {t:tCom} = useTranslation('common')
  usePageContent(true);
  const router = useRouter();
  const locale = router.locale;
  const [page,setPage] = usePagination();
  const {data,error} = useSWR<Blog,true>(`/blogs?page=${page}&pageSize=24`);

  return (
    <Header title={"Blog"}>
      <Dashboard withDashboard={false} backToTop={{position:'bottom',color:'primary'}} whatsappWidget={{enabled:false}}>
        <Container maxWidth={'lg'}>
          {!data && !error ? (
            <Box textAlign='center'>
              <Circular />
            </Box>
          ) : error ? (
            <Box textAlign='center'>
              <Typography variant='h4' component='h4'>{error?.error?.message}</Typography>
            </Box>
          ) : data?.data.length === 0 ? (
            <Box textAlign='center'>
              <Typography variant='h4' component='h4'>{tCom('no_what',{what:'blog'})}</Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Box textAlign='center' mb={6}>
                  <Typography variant='h1' component='h1'>Blog</Typography>
                </Box>
              </Grid>
              {data?.data?.map((d,i)=>(
                <BlogSection items={d} index={i} key={d?.id} />
              ))}
            </Grid>
          )}
          {data && data?.data?.length > 0 && (
            <Box mt={6}>
              <Pagination page={page} count={data?.meta?.pagination?.pageCount} onChange={setPage} />
            </Box>
          )}
        </Container>
      </Dashboard>
    </Header>
  )
}