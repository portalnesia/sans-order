import PropTypes from 'prop-types';
import { forwardRef,ReactNode,useMemo,useState,useCallback } from 'react';
import Head from 'next/head'
// material
import { Box, BoxProps } from '@mui/material';

// ----------------------------------------------------------------------

export interface HeaderProps extends BoxProps {
  children: ReactNode,
  title?: string
}

export default function Header({ children, title, ...other }: HeaderProps) {
  const titles = useMemo(()=>title ? `${title} | Sans Order` : `Sans Order`,[title]);

  return (
    <>
      <Head>
        <title>{titles}</title>
      </Head>
      {children}
    </>
  )
};
