import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
//import {GA_TRACKING_ID} from 'portal/utils/gtag'
import createEmotionCache from '@utils/emotion-cache'
import {withEmotionCache} from 'tss-react/nextJs'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta key='meta-2' httpEquiv='Content-Type' content='text/html; charset=utf-8' />
          <link rel="icon" href="/favicon.ico" />
          <link rel="stylesheet" href='https://fonts.googleapis.com/css?family=Inter|Roboto|Material+Icons&display=swap' />
          
          <link rel="icon" type="image/png" sizes="512x512" href="/icon/android-icon-512x512.png" />
    	    <link rel="icon" type="image/png" sizes="192x192" href="/icon/android-icon-192x192.png" />
          <link rel="icon" type="image/png" sizes="32x32" href={`${process.env.CONTENT_URL}/icon/favicon-32x32.png`} />
    	    <link rel="icon" type="image/png" sizes="96x96" href={`${process.env.CONTENT_URL}/icon/favicon-96x96.png`} />
    	    <link rel="icon" type="image/png" sizes="16x16" href={`${process.env.CONTENT_URL}/con/favicon-16x16.png`} />
          <link rel="apple-touch-icon" sizes="57x57" href={`${process.env.CONTENT_URL}/icon/apple-icon-57x57.png`} />
          <link rel="apple-touch-icon" sizes="60x60" href={`${process.env.CONTENT_URL}/icon/apple-icon-60x60.png`} />
          <link rel="apple-touch-icon" sizes="72x72" href={`${process.env.CONTENT_URL}/icon/apple-icon-72x72.png`} />
          <link rel="apple-touch-icon" sizes="76x76" href={`${process.env.CONTENT_URL}/icon/apple-icon-76x76.png`} />
          <link rel="apple-touch-icon" sizes="114x114" href={`${process.env.CONTENT_URL}/icon/apple-icon-114x114.png`} />
          <link rel="apple-touch-icon" sizes="120x120" href={`${process.env.CONTENT_URL}/icon/apple-icon-120x120.png`} />
          <link rel="apple-touch-icon" sizes="144x144" href={`${process.env.CONTENT_URL}/icon/apple-icon-144x144.png`} />
          <link rel="apple-touch-icon" sizes="152x152" href={`${process.env.CONTENT_URL}/icon/apple-icon-152x152.png`} />
          <link rel="apple-touch-icon" sizes="180x180" href={`${process.env.CONTENT_URL}/icon/apple-icon-180x180.png`} />
          <meta name="msapplication-TileImage" content={`${process.env.CONTENT_URL}/icon/ms-icon-144x144.png`} />
          <link rel="manifest" href="/manifest.json"/>
          <link className='higtlightjs-light' rel='stylesheet' href='/css/github.css' />
          {/*<link className='higtlightjs-dark' rel='stylesheet' href='/css/github-dark.css' />*/}
          {process.env.NODE_ENV==='production' ? <script key='arcio' src="https://arc.io/widget.min.js#3kw38brn" /> : null}
        </Head>
        <body>
          <Main />
          <NextScript />
          <div id="wrapfabtest"><div className="adBanner" style={{backgroundColor: 'transparent',height: 1,width: 1}}></div></div>
        </body>
      </Html>
    );
  }
}

export default withEmotionCache({
  "Document":MyDocument,
  "getCaches": ()=>[createEmotionCache()]
})