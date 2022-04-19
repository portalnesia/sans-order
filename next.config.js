//const withPWA = require('next-pwa');
const withTM=require('next-transpile-modules')(['@mui/material','@mui/lab','@mui/styles','@mui/base','@mui/system','@mui/icons-material'])
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const nextConfig = {
    typescript:{
      ignoreBuildErrors:true
    },
    i18n:{
      locales: ['en', 'id'],
      defaultLocale:"en",
    },
    env: {
      API_LOCAL_URL: process.env.NODE_ENV !== 'production' ? 'https://api.portalnesia.com' : 'http://localhost:3007',
      DOMAIN:'https://portalnesia.com',
      URL: process.env.NODE_ENV !== 'production' ? 'http://localhost:3001' : 'https://portalnesia.com',
      APP_URL: 'https://datas.portalnesia.com',
      SHORT_URL: 'http://kakek.c1.biz',
      CONTENT_URL:'https://content.portalnesia.com',
      API_URL:'https://api.portalnesia.com',
      ACCOUNT_URL:'https://accounts.portalnesia.com',
      LINK_URL:'https://link.portalnesia.com',
      /**
       * NEXT_PUBLIC_APP_TOKEN
       * NEXT_PUBLIC_RECAPTCHA
       * NEXT_PUBLIC_CLIENT_ID
       * NEXT_PUBLIC_X_DEBUG
       */
    },
    images: {
      domains: ['portalnesia.com','content.portalnesia.com'],
    },
    poweredByHeader:false,
    webpack:(config,{dev,isServer})=>{
      if(!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs:false,
          net:false,
          tls:false
        }
        config.externals['node-fetch'] = 'fetch';
        config.externals['fetch'] = 'fetch';
      }
      config.plugins.push(
        new webpack.ProvidePlugin({
          '$':'jquery',
          'jQuery':'jquery'
        })
      )
      if (!dev && !isServer) {
        config.optimization.minimizer.push(new TerserPlugin(),new CssMinimizerPlugin())
      }
      config.output.sourcePrefix="";
      config.module.unknownContextCritical=false;
      config.module.rules.push(
        {
          test: /\.wasm$/,
          type: 'javascript/auto',
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/',
            outputPath: 'static/',
            name: '[contenthash].[ext]',
          },
        }
      )
      return config;
    }
}

module.exports = withTM((nextConfig));