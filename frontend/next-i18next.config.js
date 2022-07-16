const path = require('path')

module.exports = {
  i18n:{
    locales: ['en', 'id'],
    defaultLocale:"en",
  },
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender:true,
}