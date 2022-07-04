// component
import Iconify from '../../components/Iconify';
import {TFunction} from 'next-i18next'
// ----------------------------------------------------------------------

const navbarConfig = (t: TFunction)=>([
  {
    title: t("home"),
    path: '/'
  },
  {
    title: t("pricing"),
    path: '/pricing'
  },
  {
    title:t("help"),
    path:"/help"
  }
  /*{
    title: t("contact"),
    path: '/contact'
  }*/
]);

export default navbarConfig;
