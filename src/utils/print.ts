import {isMobile} from 'react-device-detect'

<<<<<<< HEAD
export default function handlePrint(toko_id: string,outlet_id: string,token: string,query?:string) {
  return window.open(`${process.env.API_URL}/toko/${toko_id}/${outlet_id}/print/${token}${!isMobile ? '?device=desktop':''}${query ? (!isMobile ? `&${query}` : query) : ''}`)
=======
export default function handlePrint(toko_id: string,outlet_id: string,token: string) {
  return window.open(`${process.env.API_URL}/toko/${toko_id}/${outlet_id}/print/${token}${!isMobile ? '?device=desktop':''}`)
>>>>>>> main
}