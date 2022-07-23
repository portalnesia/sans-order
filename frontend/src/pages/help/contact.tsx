// material
import { Box, Grid, Container, Typography,styled,Stack,Divider,IconButton, TextField } from '@mui/material';
import {WhatsApp,Email,Instagram,Facebook,Twitter} from '@mui/icons-material'
// components
import Header from '../../components/Header';
import Dashboard from '../../layout/home/index';
import React from 'react';
import {staticProps, useSelector} from '@redux/store';
import {useTranslation,TFunction} from 'next-i18next';
import Button from '@comp/Button';
import useNotif from '@utils/notification'
import {useAPI} from '@utils/api';
import {useRouter} from 'next/router'
import config from '@root/web.config.json'
import { State } from '@redux/index';
import { ucwords } from '@portalnesia/utils';

export const getStaticProps = staticProps({translation:'catalogue'});

const dataContact=[
  {
    icon: <Email />,
    link:`mailto:${config.contact.email}`,
    label:config.contact.email,
    target:true
  },
  {
    icon: <WhatsApp />,
    link:"/wa",
    label: config.contact.whatsapp
  },
  {
    icon: <Instagram />,
    link:"/ig",
    label:config.contact.instagram
  },
  {
    icon: <Facebook />,
    link:"/fb",
    label:config.contact.facebook.name
  },
  {
    icon: <Twitter />,
    link:"/tw",
    label:config.contact.twitter
  }
]

type IInput = {
  name: string|null,
  email: string|null,
  subject: string,
  message: string
}

const defaultInput = {
  name:null,
  email:null,
  subject:'',
  message:''
}

export default function Contact() {
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const {t} = useTranslation('catalogue');
  const user = useSelector<State['user']>(s=>s.user);
  const [input,setInput] = React.useState<IInput>(defaultInput)
  const router=useRouter()
  const setNotif = useNotif();
  const {subject}=router?.query
  const {post} = useAPI()
  const [loading,setLoading] = React.useState(false)

  const handleChange=React.useCallback((name: keyof typeof defaultInput,val: string)=>{
    setInput({
      ...input,
      [name]:val
    })
  },[input])

  const handleSubmit = React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);

    try {
      const {name,email,...rest} = input;
      const data = {
        ...rest,
        ...(user ? {
          user: user.id
        } : {
          name,
          email
        })
      }
      await post(`/supports`,data);
      setNotif(tCom("success"),false);
      setInput({...defaultInput,...(user ? {name:user.name,email:user.email} : {})})
    } catch(e: any) {
      setNotif(e?.error?.message,true);
    } finally {
      setLoading(false);
    }
  },[input,post,setNotif,tCom,user])

  React.useEffect(()=>{
    if(user) {
      setInput({...defaultInput,name:user.name,email:user.email})
    }
  },[user])

  return (
    <Header title={tMenu("contact")}>
      <Dashboard>
        <Container maxWidth='md'>
          <Box textAlign='center' mb={4}>
            <Typography variant='h1' component='h1'>{tMenu("contact_us")}</Typography>
          </Box>

          <Box>
            <Typography>{t("contact.header")}</Typography>
          </Box>

          <Box mt={2} mb={4}>
            {dataContact.map(c=>(
              <a href={c.link} {...(c.target ? {} : {target:'_blank'})}>
                <Stack spacing={2} direction='row' alignItems='center' mb={0.5}>
                  {c.icon}
                  <Typography>{c.label}</Typography>
                </Stack>
              </a>
            ))}
          </Box>

          <Box>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    value={input?.name}
                    onChange={e=>handleChange('name',e.target.value)}
                    label={ucwords(t('name'))}
                    fullWidth
                    required
                    disabled={loading}
                    {...(user ? {inputProps:{readOnly:true},InputLabelProps:{shrink:true}} : {})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    value={input?.email}
                    onChange={e=>handleChange('email',e.target.value)}
                    label={"Email"}
                    fullWidth
                    required
                    disabled={loading}
                    {...(user ? {inputProps:{readOnly:true},InputLabelProps:{shrink:true}} : {})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    value={input?.subject}
                    onChange={e=>handleChange('subject',e.target.value)}
                    label={ucwords(t('contact.subject'))}
                    fullWidth
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    onChange={e=>handleChange('message',e.target.value)}
                    value={input?.message}
                    label={t('contact.message')}
                    fullWidth
                    required
                    minRows={6}
                    maxRows={15}
                    multiline
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button icon='send' type='submit' disabled={loading} loading={loading}>{tCom("send")}</Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Container>
      </Dashboard>
    </Header>
  )
}