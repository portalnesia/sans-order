import Link from 'next/link'
import { Box, Card, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import Image from '@comp/Image'
import Label from '@comp/Label'
import { numberFormat } from '@portalnesia/utils';

const ProductImgStyle = styled(Image)({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute'
});

interface ProductsProps {
  items:{
    name: string,
    image: string,
    price: number,
    link?: string,
    status?: string,
    priceSale?: number
  }
}

export default function Products({ items }: ProductsProps) {
  const { name, image, price, status, priceSale,link } = items;

  return (
    <Card>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {status && (
          <Label
            variant="filled"
            color={(status === 'sale' && 'error') || 'info'}
            sx={{
              zIndex: 9,
              top: 16,
              right: 16,
              position: 'absolute',
              textTransform: 'uppercase'
            }}
          >
            {status}
          </Label>
        )}
        <ProductImgStyle alt={name} src={image} />
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        {link ? (
          <Link href={link.replace(process.env.DOMAIN as string,'')} passHref><a>
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </a></Link>
        ) : (
          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>
        )}

        <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle1">
          <Typography
            component="span"
            variant="body1"
            sx={{
              color: 'text.disabled',
              textDecoration: 'line-through'
            }}
          >
            {priceSale && `IDR ${numberFormat(`${priceSale}`)}`}
          </Typography>
          &nbsp;
          {`IDR ${numberFormat(`${price}`)}`}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  )
}