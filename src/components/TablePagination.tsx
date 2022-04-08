import {useState,useCallback} from 'react'

export default function usePagination(initialPage=1,initialPerPage=25) {
  const [page,setPage] = useState(initialPage);
  const [rowsPerPage,setRowsPerPage] = useState(initialPerPage);

  const onPageChange = useCallback((_e: any, newPage: number) => {
    setPage(newPage+1);
  },[]);

  const onRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  },[]);

  return {page,rowsPerPage,onPageChange,onRowsPerPageChange,component:'div',rowsPerPageOptions:[10,25,50]}
}