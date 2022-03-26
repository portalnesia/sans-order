// component
import Iconify from '../../components/Iconify';
import {useTranslations} from 'next-intl'
// ----------------------------------------------------------------------

const navbarConfig = (t: ReturnType<typeof useTranslations>)=>([
  {
    title: t("Menu.home"),
    path: '/'
  },
  {
    title: t("Menu.pricing"),
    path: '/pricing'
  },
  {
    title: t("Menu.contact"),
    path: '/contact'
  }
]);

export default navbarConfig;
