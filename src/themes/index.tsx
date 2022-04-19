import { useMemo,ReactNode } from 'react';
// material
import { CssBaseline, ThemeOptions } from '@mui/material';
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
import {enUS,idID} from '@mui/material/locale'
//
import { useRouter } from 'next/router';
import palette from './palette';
import darkPalette from './palette-dark'
import typography from './typography';
import componentsOverride from './overrides';
import shadows, { customShadows } from './shadows';
import {State,useSelector} from '@redux/index'

// ----------------------------------------------------------------------

export default function ThemeConfig({ children }: {children: ReactNode}) {
  const router = useRouter();
  const locale = router.locale||router.defaultLocale||'en';
  const cookies_theme = useSelector<State['redux_theme']>(s=>s.redux_theme);

  const themeOptions = useMemo<ThemeOptions>(
    () => ({
      palette: cookies_theme==='dark' ? darkPalette : palette,
      shape: { borderRadius: 8 },
      typography,
      shadows,
      customShadows
    }),
    [cookies_theme]
  );

  const theme = createTheme(themeOptions,(locale==='id' ? idID : enUS));
  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
