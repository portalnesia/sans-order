import {useCallback,useState} from 'react'
import {Pagination as Paging,PaginationProps} from '@mui/material'

export function usePagination(initialPage=1): [number,(e: any,page: number)=>void] {
  const [page,setPage] = useState(initialPage);

  const handlePage=useCallback((e: any,page: number)=>{
    setPage(page)
  },[])

  return [page,handlePage]
}

export default function Pagination({page,count,...other}: PaginationProps) {
  return <Paging color='primary' count={Number(count)} page={Number(page)} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton {...other} />
}