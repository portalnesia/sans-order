import React from 'react'
import { Box, Grid, Container, Typography,Card,CardContent,CardActionArea } from '@mui/material';
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import Image from '@comp/Image'
import {useTranslation} from 'next-i18next';
import useSWR from '@utils/swr'
import {Circular} from '@comp/Loading'
import qs from 'qs'
import wrapper from '@redux/store'
import { Toko, IPages, Outlet } from '@type/index';
import { useRouter } from 'next/router';
import Pagination,{usePagination} from '@comp/Pagination'
import { Markdown } from '@comp/Parser';

export const getServerSideProps = wrapper({name:'check_toko',outlet:{onlyMyToko:false}});

export default function MerchantIndex({meta}: IPages<Toko>) {
	const {t} = useTranslation('common');
	const router = useRouter();
	const {toko_id} = router.query;
	const [page,setPage] = usePagination(true);
  const queryToko = React.useMemo(()=>{
    return qs.stringify({
      populate:{
        logo:'*'
      }
    })
  },[])
  const queryOutlet = React.useMemo(()=>{
    return qs.stringify({
      page
    })
  },[page])

	const {data:toko,error:errToko} = useSWR<Toko>(`/tokos/${toko_id}?${queryToko}`,{fallback:meta})
  const {data:outlet,error:errorOutlet} = useSWR<Outlet,true>(!toko ? null : `/tokos/${toko?.data?.slug}/outlets?${queryOutlet}`)

	return (
		<Header title={toko?.data.name} desc={toko?.data?.description} image={toko?.data?.logo?.url}>
			<Dashboard withDashboard={false} withNavbar={false} logoProps={{href:!toko ? false : `merchant/${toko?.data?.slug}`}} whatsappWidget={{enabled:false}}>
				<Container maxWidth='lg' sx={{mt:2}}>
					{!toko && !errToko ? (
						<Box display='flex' position='absolute' top='40%' left='50%' alignItems={'center'} justifyContent='center'><Circular /></Box>
					) : errToko ? (
						<Box textAlign='center' mb={4}>
							<Typography variant='h3' component='h3'>{errToko?.error.message}</Typography>
						</Box>
					) : toko ? (
						<>
							<Box textAlign='center' mb={4}>
								{toko?.data.logo && <Box mb={2}><Image alt={toko?.data?.name} src={toko?.data.logo.url} style={{width:300,height:'auto'}} withPng fancybox /></Box>}
								<Typography gutterBottom variant='h2' component='h2'>{toko?.data.name}</Typography>
								{toko?.data.slogan && <Typography variant='body2'>{toko?.data.slogan}</Typography>}
							</Box>

							{toko?.data.description && (
                <Box mb={4}>
                  <Markdown source={toko?.data.description} />
                </Box>
              )}

							<Box mb={4}>
								<Typography className='underline-heading' variant='h3' component='h3'>Outlet</Typography>
							</Box>

							<Box>
								<Grid container spacing={2}>
									{!outlet && !errorOutlet ? (
										<Grid item xs={12}>
											<Box display='flex' alignItems={'center'} justifyContent='center'><Circular /></Box>
										</Grid>
									) : errorOutlet ? (
										<Grid item xs={12}>
											<Box textAlign='center'><Typography>{errorOutlet.error.message}</Typography></Box>
										</Grid>
									) : outlet?.data?.length === 0 ? (
										<Grid item xs={12}>
											<Box textAlign='center'><Typography>{t("no_what",{what:"Outlet"})}</Typography></Box>
										</Grid>
									) : outlet?.data.map((d,i)=>(
										<Grid item xs={12} sm={6} md={4} lg={3} key={`merchant-${i}`}>
											<Card>
												<CardActionArea onClick={()=>router.push(`/merchant/${toko.data.slug}/${d.id}`)}>
													<CardContent>
														<Typography>{d.name}</Typography>
													</CardContent>
												</CardActionArea>
											</Card>
										</Grid>
									))}
									{(outlet?.meta.pagination.pageCount||1) > 1 && (
										<Grid item xs={12}>
											<Box mt={2}>
												<Pagination page={page} count={outlet?.meta.pagination.pageCount||1} onChange={setPage} />
											</Box>
										</Grid>
									)}
								</Grid>
							</Box>
						</>
					) : null}
				</Container>
			</Dashboard>
		</Header>
	)
}