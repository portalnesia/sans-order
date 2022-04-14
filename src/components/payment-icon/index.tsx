import {ReactNode} from 'react'
import {SvgIconProps} from '@mui/material'
import {BankCode,EWalletCode} from '@type/index'
import {DanaIcon,ShopeePayIcon,LinkAjaIcon} from './Ewallet'
import {MandiriIcon,BniIcon,BriIcon,PermataIcon} from './Bank'
export * from './Bank'
export * from './Ewallet'
export {default as RedirectIcon} from './Redirect'

export {default as QrisIcon} from './Qris'

export const EWalletIcon: Record<EWalletCode,(props: SvgIconProps)=>JSX.Element> = {
  DANA: DanaIcon,
  SHOPEEPAY: ShopeePayIcon,
  LINKAJA: LinkAjaIcon
}

export const BankIcon: Record<BankCode,(props: SvgIconProps)=>JSX.Element> = {
  MANDIRI: MandiriIcon,
  BNI: BniIcon,
  BRI: BriIcon,
  PERMATA: PermataIcon
}