import {isMobile} from 'react-device-detect'

export default function handlePrint(token: string,query?:string) {
  return window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/print/${token}${!isMobile ? '?device=desktop': query ? '?' : ''}${query ? (!isMobile ? `&${query}` : query) : ''}`)
}