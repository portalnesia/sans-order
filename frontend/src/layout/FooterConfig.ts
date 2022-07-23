import { TFunction } from "next-i18next"

export const footerMenu = (t: TFunction): {header:string,child:{name: string,link?:string,exlink?:string}[]}[] => ([
  {
    header:t("product"),
    child:[]
  },{
    header:t('company'),
    child:[{
      name: t("pricing"),
      link: '/pricing'
    },
    {
      name:t("terms_of_services"),
      link:"/pages/terms-of-services"
    },{
      name:t("policy",{context:'privacy'}),
      link:"/pages/privacy-policy"
    },{
      name:t("policy",{context:'cookie'}),
      link:"/pages/cookie-policy"
    }]
  },{
    header:t('help'),
    child:[{
      name:t("contact_us"),
      link:"/help/contact"
    },{
      name:"FAQ",
      link:"/help/faq"
    },
    {
      name:t("payment_tutorial"),
      link:"/help/payment"
    }]
  }
])

export const dashboardFooterMenu = (t: TFunction): {name: string,link?:string,exlink?:string}[] => ([
  {
    name:t("contact_us"),
    link:"/help/contact"
  },{
    name:t("terms_of_services"),
    link:"/pages/terms-of-services"
  },{
    name:t("policy",{context:'privacy'}),
    link:"/pages/privacy-policy"
  },{
    name:t("policy",{context:'cookie'}),
    link:"/pages/cookie-policy"
  }
])