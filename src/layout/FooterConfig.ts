import { TFunction } from "next-i18next"

const footerMenu = (t: TFunction): {name: string,link?:string,exlink?:string}[] => ([
  {
    name:t("contact"),
    link:"/contact"
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

export default footerMenu;