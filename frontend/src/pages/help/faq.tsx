// material
import { Box, Container, Typography,Divider,Collapse } from '@mui/material';
import {Edit,ExpandMore as ExpandMoreIcon} from '@mui/icons-material'
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import React from 'react'
import {staticProps} from '@redux/store'
import {useTranslation} from 'next-i18next';
import ExpandMore from '@comp/ExpandMore';
import Button from '@comp/Button'
import fs from 'fs'
import { Markdown } from '@comp/Parser';
import { useRouter } from 'next/router';
import jsYaml from 'js-yaml'

type Iqa = {
  q: string,
  a: string
}
type IPages = {
  meta: {
    faq: Iqa[]
  }
}

async function getYaml(locale: string='id') {
  const bhs = locale === 'id' ? '' : '/en'
  const buffer = await fs.promises.readFile(`../data/help${bhs}/faq.yaml`);
  const faq_string = buffer.toString();
  const faq = await jsYaml.load(faq_string) as {faq: Iqa[]};
  return faq;
}

export const getStaticProps = staticProps(async({getTranslation,locale})=>{
  const bhs = locale||'en';
  return {
    props: {
      meta: await getYaml(bhs),
      ...(await getTranslation('pages',bhs))
    }
  }
});

function PNAccordion({faq,index}: {faq: Iqa,index:number}) {
  const [expand, setExpand] = React.useState<boolean>(false);

  return (
    <>
      <Button onClick={()=>setExpand(!expand)} sx={{display:'block',width:'100%',borderRadius:0,px:2,py:1}} text color='inherit'>
        <Box textAlign='start' display='flex' flexDirection='row' justifyContent={'space-between'} alignItems='center'>
          <Typography variant='h5' component='h5'>{`${index}. ${faq.q}`}</Typography>
          <ExpandMore disabled expand={expand}>
            <ExpandMoreIcon />
          </ExpandMore>
        </Box>
      </Button>

      <Collapse in={expand}>
        <Divider />
        <Box padding={2}>
          <Markdown source={faq.a} />
        </Box>
      </Collapse>
    </>
  )
}

export default function Faq({meta}: IPages) {
  const {t} = useTranslation('pages');
  const {t:tMenu} = useTranslation('menu');
  const router = useRouter();
  const locale = router.locale||'en';

  const editUrl = React.useMemo(()=>{
    return `https://github.com/portalnesia/sans-order/edit/main/data/help/${locale!=='id' ? `${locale}/` : ''}faq.yaml`;
  },[locale])

  return (
    <Header title={"FAQ"}>
      <Dashboard>
        <Container>
          <Box textAlign='center' mb={8}>
            <Typography variant='h1' component='h1'>{tMenu("faq")}</Typography>
          </Box>
          
          <Box>
            {meta.faq.map((f,i)=>(
              <PNAccordion key={`qna-${i}`} faq={f} index={i+1} />
            ))}
          </Box>
          <Box mt={4}>
            <Button size='large' outlined color='inherit' startIcon={<Edit />} sx={{textTransform:'unset'}} className='no-format not_blank' target='_blank' rel='nofollow noopener noreferrer' component='a' href={editUrl}>{t("edit")}</Button>
          </Box>
        </Container>
      </Dashboard>
    </Header>
  )
}