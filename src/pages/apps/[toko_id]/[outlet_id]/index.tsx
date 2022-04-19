// material
import { Box, Grid, Container, Typography,CardContent,CardActionArea,Card, CardMedia,Divider,IconButton } from '@mui/material';
import {AddAPhoto,Delete} from '@mui/icons-material'
// components
import Header from '@comp/Header';
import Dashboard from '@layout/dashboard/index'
import React from 'react'
import useNotif from '@utils/notification'
import Button from '@comp/Button'
import Backdrop from '@comp/Backdrop'
import {Circular} from '@comp/Loading'
import Image from '@comp/Image'
import Pagination,{usePagination} from '@comp/Pagination'
import {IToko,IOutletPagination,ResponsePagination, Without,IPages} from '@type/index'
import wrapper from '@redux/store'
import {useTranslations} from 'next-intl';
import useSWR from '@utils/swr';

import { useRouter } from 'next/router';
import Iconify from '@comp/Iconify';
import Breadcrumbs from '@comp/Breadcrumbs';
import dynamic from 'next/dynamic'

export const getServerSideProps = wrapper({name:'check_outlet',outlet:{onlyMyToko:true}})


export default function OutletIndex({meta}: IPages) {
  const t = useTranslations();
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;

  return (
    <Header title={meta?.title} desc={meta?.description}>
      <Dashboard title={meta?.title} subtitle={meta?.toko_name}>
        <Container>
          
        </Container>
      </Dashboard>
    </Header>
  )
}