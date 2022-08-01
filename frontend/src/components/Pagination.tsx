import {useCallback,useState,useMemo} from 'react'
import {Pagination as Paging,PaginationProps} from '@mui/material'
import { useRouter } from 'next/router';

export function usePagination(initialPage: number|true=1): [number,(e: any,page: number)=>void] {
  const router = useRouter();
  const {page: rPage} = router.query;
  const [sPage,setPage] = useState(typeof initialPage === 'number' ? initialPage : Number(rPage||1));

  const page = useMemo(()=>{
    if(typeof initialPage === 'number') return sPage;
    if(typeof rPage === 'string') {
      const page = Number(rPage);
      if(Number.isNaN(page)) return 1;
      return page;
    }
    return sPage;
  },[sPage,rPage,initialPage])

  const handlePage=useCallback((e: any,next_page: number)=>{
    if(typeof initialPage === 'number') {
      setPage(next_page);
    } else {
      const {pathname,query,asPath}=router;
      const q = {...query,page:next_page};
      const url = new URL(`${process.env.NEXT_PUBLIC_URL}/${asPath}`);
      const quer = url.searchParams;
      quer.set('page',`${next_page}`)
      const path = `${url.pathname}?${quer.toString()}`
      router.replace({pathname,query:q},path,{shallow:true})
    }
  },[initialPage,page,router])

  return [page,handlePage]
}

export default function Pagination({page,count,...other}: PaginationProps) {
  console.log(page,count)
  return <Paging color='primary' count={Number(count)} page={Number(page)} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton {...other} />
}