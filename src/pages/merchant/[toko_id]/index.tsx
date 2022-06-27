import React from 'react'
import { Box, Grid, Container, Typography,Card,CardContent,CardActionArea } from '@mui/material';
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import Image from '@comp/Image'
import {useTranslation} from 'next-i18next';
import useSWR from '@utils/swr'
import {Circular} from '@comp/Loading'
import Iconify from '@comp/Iconify'
import wrapper from '@redux/store'
import { IOutletPagination, IPages, ResponsePagination } from '@type/index';
import { useRouter } from 'next/router';
import useToko from '@utils/useToko';
import { photoUrl } from '@utils/Main';
import Pagination,{usePagination} from '@comp/Pagination'
import { Markdown } from '@comp/Parser';

export const getServerSideProps = wrapper({name:'check_toko',outlet:{onlyMyToko:false}});

export default function MerchantIndex({meta}: IPages) {
	const {t} = useTranslation('common');
	const router = useRouter();
	const {toko_id} = router.query;
	const {toko,errToko} = useToko(toko_id);
	const [page,setPage] = usePagination(true);
	const {data:outlet,error:errorOutlet} = useSWR<ResponsePagination<IOutletPagination>>(`/sansorder/toko/${toko_id}/outlet?page=${page}&per_page=24`)

	return (
		<Header title={meta?.title} desc={meta?.description} image={meta?.image}>
			<Dashboard withDashboard={false} withNavbar={false} logoProps={{href:!toko ? false : `merchant/${toko?.slug}`}} whatsappWidget={{enabled:false}}>
				<Container maxWidth='lg' sx={{mt:2}}>
					{!toko && !errToko ? (
						<Box display='flex' position='absolute' top='40%' left='50%' alignItems={'center'} justifyContent='center'><Circular /></Box>
					) : errToko ? (
						<Box textAlign='center' mb={4}>
							<Typography variant='h3' component='h3'>{errToko?.message}</Typography>
						</Box>
					) : toko ? (
						<>
							<Box textAlign='center' mb={4}>
								{toko.logo && <Box mb={2}><Image src={`${photoUrl(toko.logo)}&watermark=no&export=banner&size=300&no_twibbon=true`} style={{width:'100%',height:'auto'}} withPng fancybox /></Box>}
								<Typography gutterBottom variant='h2' component='h2'>{toko.name}</Typography>
								{toko.slogan && <Typography variant='body2'>{toko.slogan}</Typography>}
							</Box>

							{toko.description && (
                <Box mb={4}>
                  <Markdown source={toko.description} />
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
											<Box textAlign='center'><Typography>{errorOutlet.message}</Typography></Box>
										</Grid>
									) : outlet?.data?.length === 0 ? (
										<Grid item xs={12}>
											<Box textAlign='center'><Typography>{t("no_what",{what:"Outlet"})}</Typography></Box>
										</Grid>
									) : outlet?.data.map((d,i)=>(
										<Grid item xs={12} sm={6} md={4} lg={3} key={`merchant-${i}`}>
											<Card>
												<CardActionArea onClick={()=>router.push(`/merchant/${toko.slug}/${d.id}`)}>
													<CardContent>
														<Typography>{d.name}</Typography>
													</CardContent>
												</CardActionArea>
											</Card>
										</Grid>
									))}
									{(outlet?.total_page||1) > 1 && (
										<Grid item xs={12}>
											<Box mt={2}>
												<Pagination page={page} count={outlet?.total_page||1} onChange={setPage} />
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