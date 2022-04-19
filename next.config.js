//const withPWA = require('next-pwa');
const withTM=require('next-transpile-modules')(['@mui/material','@mui/lab','@mui/styles','@mui/base','@mui/system','@mui/icons-material'])
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const {i18n} = require('./next-i18next.config')

const nextConfig = {
    typescript:{
      ignoreBuildErrors:true
    },
    i18n,
    env: {
      URL: process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : process.env.NODE_ENV === 'test' ? 'https://sans-stagging.portalnesia.com' : 'https://portalnesia.com',
      APP_URL: 'https://datas.portalnesia.com',
      SHORT_URL: 'http://kakek.c1.biz',
      CONTENT_URL:'https://content.portalnesia.com',
      API_URL:'https://api.portalnesia.com',
      ACCOUNT_URL:'https://accounts.portalnesia.com',
      LINK_URL:'https://link.portalnesia.com',
      PORTAL_URL:"https://portalnesia.com"
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