const withPWA = require('next-pwa');
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
    images: {
      domains: ['portalnesia.com','content.portalnesia.com'],
    },
    poweredByHeader: false,
    pwa: {
      dest: 'public',
      disable:process.env.NEXT_PUBLIC_PN_ENV !== 'production',
      register:true,
      maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-webfonts',
            expiration: {
              maxEntries: 4,
              maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'google-fonts-stylesheets',
            expiration: {
              maxEntries: 4,
              maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
            },
          },
        },
        {
          urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-font-assets',
            expiration: {
              maxEntries: 4,
              maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
            }
          }
        },
        {
          urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-image-assets',
            expiration: {
              maxEntries: 64,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        },
        {
          urlPattern: /\/_next\/image\?url=.+$/i,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "next-image",
            expiration: {
              maxEntries: 64,
              maxAgeSeconds: 24 * 60 * 60, // 24 hours
            },
          },
        },
        {
          urlPattern: /\.(?:mp3|wav|ogg)$/i,
          handler: 'CacheFirst',
          options: {
            rangeRequests: true,
            cacheName: 'static-audio-assets',
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        },
        {
          urlPattern: /\.(?:mp4)$/i,
          handler: 'CacheFirst',
          options: {
            rangeRequests: true,
            cacheName: 'static-video-assets',
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        },
        {
          urlPattern: /\.(?:js)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-js-assets',
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        },
        {
          urlPattern: /\.(?:css|less)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-style-assets',
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        },
        {
          urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "next-data",
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 24 * 60 * 60, // 24 hours
            }
          },
        },
        {
          urlPattern: /\.(?:json|xml|csv)$/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'static-data-assets',
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        },
        {
          urlPattern: ({url}) => {
            const isSameOrigin = self.origin === url.origin;
            if (!isSameOrigin) return false
            const pathname = url.pathname
            // Exclude /api/auth/callback/* to fix OAuth workflow in Safari without impact other environment
            // Above route is default for next-auth, you may need to change it if your OAuth workflow has a different callback route
            // Issue: https://github.com/shadowwalker/next-pwa/issues/131#issuecomment-821894809
            if (pathname.startsWith('/api/auth/')) return false
            if (pathname.startsWith('/api/')) return true
            return false
          },
          handler: 'NetworkFirst',
          method: 'GET',
          options: {
            cacheName: 'apis',
            expiration: {
              maxEntries: 16,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            },
            networkTimeoutSeconds: 10 // fall back to cache if api does not response within 10 seconds
          }
        },
        {
          urlPattern: ({url}) => {
            const isSameOrigin = self.origin === url.origin
            if (!isSameOrigin) return false
            const pathname = url.pathname
            if (pathname.startsWith('/api/')) return false
            return true
          },
          handler: 'NetworkFirst',
          options: {
            cacheName: 'others',
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            },
            networkTimeoutSeconds: 10
          }
        },
        {
          urlPattern: ({url}) => {
            if(/api\.portalnesia\.com/.test(url.origin)) return true;
            return false;
          },
          handler: 'NetworkFirst',
          method: 'GET',
          options: {
            cacheName: 'apis-cross-origin',
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 60 * 60 // 1 hour
            },
            networkTimeoutSeconds: 10
          }
        },
        {
          urlPattern: ({url}) => {
            if(/(accounts|api)\.portalnesia\.com/.test(url.origin)) return false;
            const isSameOrigin = self.origin === url.origin
            return !isSameOrigin
          },
          handler: 'NetworkFirst',
          method: 'GET',
          options: {
            cacheName: 'cross-origin',
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 60 * 60 // 1 hour
            },
            networkTimeoutSeconds: 30
          }
        }
      ],
    },
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
      if (dev) {
        config.devtool = 'cheap-module-source-map';
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
      config.module.exprContextCritical = false;
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

module.exports = withTM(withPWA(nextConfig));