// component
import Iconify from '../../components/Iconify';
<<<<<<< HEAD
import type {TFunction} from 'next-i18next'
=======
import type {useTranslations} from 'next-intl'
>>>>>>> main
import type {NextRouter} from 'next/router'
// ----------------------------------------------------------------------

const getIcon = (name: string) => <Iconify icon={name} width={22} height={22} />;

<<<<<<< HEAD
const sidebarConfig = (t: TFunction)=>([
  {
    title: t("home"),
    path: `/`,
    icon: getIcon('eva:pie-chart-2-fill')
  },{
    title: t("order"),
    path: `/order`,
    icon: getIcon('fa6-solid:cash-register'),
    children:[{
      title: t("cashier"),
      path: `/order/cashier`
    },{
      title: t("self_order"),
      path: `/order/self-order`
    }]
  },{
    title: t("transactions"),
    path: `/transactions`,
    icon: getIcon('icon-park-outline:transaction')
  },{
    title: t("products"),
    path: `/products`,
    icon: getIcon('eva:shopping-bag-fill')
  },{
    title: t("setting"),
=======
const sidebarConfig = (t: ReturnType<typeof useTranslations>,r: NextRouter)=>([
  {
    title: t("Menu.home"),
    path: `/`,
    icon: getIcon('eva:pie-chart-2-fill')
  },{
    title: t("Menu.order"),
    path: `/order`,
    icon: getIcon('fa6-solid:cash-register'),
    children:[{
      title: t("Menu.cashier"),
      path: `/order/cashier`
    },{
      title: t("Outlet.self_order"),
      path: `/order/self-order`
    }]
  },{
    title: t("Menu.transactions"),
    path: `/transactions`,
    icon: getIcon('icon-park-outline:transaction')
  },{
    title: t("Menu.products"),
    path: `/products`,
    icon: getIcon('eva:shopping-bag-fill')
  },{
    title: t("Menu.setting"),
>>>>>>> main
    path: `/setting`,
    icon: getIcon('eva:settings-fill'),
    children:[{
      title: 'Outlet',
      path: `/setting/outlet`
    },{
<<<<<<< HEAD
      title: t("team"),
=======
      title: t("Menu.team"),
>>>>>>> main
      path: `/setting/team`
    }]
  }
]);

export default sidebarConfig;
