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
import NotFound from '../404'

export const getStaticProps = staticProps({translation:'landing'});

export default function Faq() {

  return <NotFound />
}