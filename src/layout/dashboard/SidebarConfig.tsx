// component
import Iconify from '../../components/Iconify';
import type {TFunction} from 'next-i18next'
import type {NextRouter} from 'next/router'
// ----------------------------------------------------------------------

const getIcon = (name: string) => <Iconify icon={name} width={22} height={22} />;

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
    title: t("stock"),
    path: `/stocks`,
    icon: getIcon('icon-park-outline:ad-product')
  },{
    title: t("products"),
    path: `/products`,
    icon: getIcon('eva:shopping-bag-fill')
  },{
    title: t("setting"),
    path: `/setting`,
    icon: getIcon('eva:settings-fill'),
    children:[{
      title: 'Outlet',
      path: `/setting/outlet`
    },{
      title: t("team"),
      path: `/setting/team`
    }]
  }
]);

export default sidebarConfig;
