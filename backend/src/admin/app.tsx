// @ts-ignore
import Logo from './extensions/logo.png';
// @ts-ignore
import favicon from './extensions/favicon.ico';

export default {
  config: {
    locales: ['en'],
    auth: {
      logo: Logo,
    },
    head: {
      favicon: favicon,
    },
    menu: {
      logo: Logo,
    },
    notifications:{
      release:false
    },
    translations:{
      en:{
        "Auth.form.welcome.subtitle": "Log in to your SansOrder Admin Account",
        "Auth.form.welcome.title": "Welcome to SansOrder!",
        "app.components.LeftMenu.navbrand.title": "SansOrder Dashboard",
        //"app.components.LeftMenu.navbrand.workplace": "Workplace",
      }
    }
  },
  bootstrap(app) {},
};
