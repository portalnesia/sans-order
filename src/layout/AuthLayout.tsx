// material
import {ReactNode} from 'react'
import { styled } from '@mui/material/styles';
import { Typography,Stack } from '@mui/material';
import LanguagePopover from './LanguagePopover'
// components
import Logo from '../components/Logo';

// ----------------------------------------------------------------------

const HeaderStyle = styled('header')(({ theme }) => ({
  top: 0,
  zIndex: 9,
  lineHeight: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  padding: theme.spacing(3),
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    alignItems: 'flex-start',
    padding: theme.spacing(7, 5, 0, 7)
  }
}));

// ----------------------------------------------------------------------

export default function AuthLayout({ children }: {children: ReactNode}) {
  return (
    <HeaderStyle>
      <Logo />

      <Stack direction="row" alignItems="center" spacing={1.5}>
        <LanguagePopover />
        <Typography
          variant="body2"
          sx={{
            display: { xs: 'none', sm: 'block' },
            mt: { md: -2 }
          }}
        >
          {children}
        </Typography>
      </Stack>
      <style jsx global>{`
        body:{
          overflow:hidden;
        }
      `}</style>
    </HeaderStyle>
  );
}
