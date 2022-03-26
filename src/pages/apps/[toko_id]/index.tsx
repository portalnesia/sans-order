// material
import { Box, Grid, Container, Typography,styled,SxProps,Theme } from '@mui/material';
// components
import Header from '@comp/Header';
import Dashboard from '@layout/dashboard/index'
import React from 'react'
import Image from '@comp/Image'
import {staticProps} from '@redux/store'
import {useTranslations} from 'next-intl';

export const getStaticProps = staticProps();

export default function DashboardApp() {
  const t = useTranslations();

  return (
    <Header title={t("Menu.home")}>
      <Dashboard>
        <Box>
          <Typography variant="h2" component='h2'>INDEX</Typography>
        </Box>
      </Dashboard>
    </Header>
  )
}
