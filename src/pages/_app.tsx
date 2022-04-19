// theme
import ThemeConfig from '@themes/index';
import GlobalStyles from '@themes/globalStyles';
// components
//import ScrollToTop from './components/ScrollToTop';
//import { BaseOptionChartStyle } from '@comp/charts/BaseOptionChart';
import {CacheProvider} from '@emotion/react'
import createEmotionCache from '@utils/emotion-cache'
import Loader from '@comp/Loader'
import {useMemo} from 'react';
import { EmotionCache } from '@emotion/cache';
import {wrapperRoot,State} from '@redux/index';
import {connect} from 'react-redux';
import {SnackbarProvider} from 'notistack'
import {NextIntlProvider} from 'next-intl'
import en from '@locale/en.json'
import id from '@locale/id.json'
import {useRouter} from 'next/router';
// ----------------------------------------------------------------------

export interface AppProps {
  Component: any,
  pageProps: any,
  emotionCache?: EmotionCache
  theme: 'light'|'dark',
  messages: any
}

const clientSideCache = createEmotionCache();

function App({Component,pageProps,theme,emotionCache=clientSideCache}: AppProps) {
  const router = useRouter();
  const {locale,defaultLocale} = router;
  const lang = useMemo(()=>{
    const lang = locale||defaultLocale;
    return lang === 'id' ? id : en;
  },[locale])

  return (
    <NextIntlProvider messages={lang}>
      <CacheProvider value={emotionCache}>
        <ThemeConfig>
          <GlobalStyles />
          <SnackbarProvider anchorOrigin={{horizontal:'right',vertical:'bottom'}} maxSnack={4}>
            <Component {...pageProps} />
            <Loader />
          </SnackbarProvider>
        </ThemeConfig>
      </CacheProvider>
    </NextIntlProvider>
  );
}

export default wrapperRoot.withRedux(connect<{theme:'light'|'dark'},{},{},State>(state=>({theme:state.redux_theme}))(App));