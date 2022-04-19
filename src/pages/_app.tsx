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
import {useRouter} from 'next/router';
import {appWithTranslation} from 'next-i18next'
import nextI18NextConfig from '@root/next-i18next.config'
// ----------------------------------------------------------------------

export interface AppProps {
  Component: any,
  pageProps: any,
  emotionCache?: EmotionCache
  theme: 'light'|'dark',
  messages: any
}

const clientSideCache = createEmotionCache();

function App({Component,pageProps,emotionCache=clientSideCache}: AppProps) {

  return (
    <CacheProvider value={emotionCache}>
      <ThemeConfig>
        <GlobalStyles />
        <SnackbarProvider anchorOrigin={{horizontal:'right',vertical:'bottom'}} maxSnack={4}>
          <Component {...pageProps} />
          <Loader />
        </SnackbarProvider>
      </ThemeConfig>
    </CacheProvider>
  );
}

export default appWithTranslation(wrapperRoot.withRedux(App),nextI18NextConfig);