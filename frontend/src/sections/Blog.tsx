import { alpha, styled } from '@mui/material/styles';
import Link from 'next/link'
import { Box, Card, Grid, Typography, CardContent, CardActionArea } from '@mui/material';
import Avatar from '@comp/Avatar';
import Iconify from '@comp/Iconify'
import SvgIcon from '@comp/SvgIcon'
import { Blog } from '@type/index';
import Image from '@comp/Image';
import { getDayJs, photoUrl } from '@utils/Main';

const CardMediaStyle = styled('div')({
  position: 'relative',
  paddingTop: 'calc(100% * 3 / 4)'
});

const TitleStyle = styled(Typography)({
  height: 44,
  overflow: 'hidden',
  WebkitLineClamp: 2,
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical'
});

const AvatarStyle = styled(Avatar)(({ theme }) => ({
  zIndex: 9,
  width: 32,
  height: 32,
  position: 'absolute',
  left: theme.spacing(3),
  bottom: theme.spacing(-2)
}));

const InfoStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(3),
  color: theme.palette.text.disabled
}));

const CoverImgStyle = styled(Image)({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute'
});

export interface BlogProps {
  items: Blog,
  index: number
};

export default function BlogPostCard({ items, index }: BlogProps) {
  const { image, title, createdBy:author, publishedAt:createdAt,slug } = items;
  const latestPostLarge = index === 0;
  const latestPost = index === 1 || index === 2;
  //sm={latestPostLarge ? 12 : 6} md={latestPostLarge ? 6 : 3}
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{ position: 'relative' }}>
        <Link href={`/blog/${slug}`} passHref>
          <CardActionArea>
            <CardMediaStyle
              sx={{
                ...((latestPostLarge || latestPost) && {
                  pt: 'calc(100% * 4 / 3)',
                  '&:after': {
                    top: 0,
                    content: "''",
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72)
                  }
                }),
                ...(latestPostLarge && {
                  pt: {
                    xs: 'calc(100% * 4 / 3)',
                    sm: 'calc(100% * 3 / 4.66)'
                  }
                })
              }}
            >
              <AvatarStyle
                alt={author.name}
                {...(author.picture ? {
                  children: <Image src={author.picture} style={{width:32,height:32}} />
                } : {
                  children: author.name
                })}
              />
              <CoverImgStyle alt={title} src={photoUrl(image?.url)} />
            </CardMediaStyle>

            <CardContent
              sx={{
                pt: 4
              }}
            >
              <Typography
                gutterBottom
                variant="caption"
                sx={{ color: 'text.disabled', display: 'block' }}
              >
                {getDayJs(createdAt).format('DD MMMM YYYY')}
              </Typography>

              <TitleStyle
                color="inherit"
                variant="subtitle2"
              >
                {title}
              </TitleStyle>
            </CardContent>
          </CardActionArea>
        </Link>
      </Card>
    </Grid>
  )
}