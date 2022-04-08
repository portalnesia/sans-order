// component
import Iconify from '../../components/Iconify';
import type {useTranslations} from 'next-intl'
import type {NextRouter} from 'next/router'
// ----------------------------------------------------------------------

const getIcon = (name: string) => <Iconify icon={name} width={22} height={22} />;

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
    path: `/setting`,
    icon: getIcon('eva:settings-fill'),
    children:[{
      title: 'Outlet',
      path: `/setting/outlet`
    },{
      title: t("Menu.team"),
      path: `/setting/team`
    }]
  }
]);

export default sidebarConfig;
