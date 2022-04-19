import Link from 'next/link';
// material
import { Box, SxProps, Theme } from '@mui/material';
import Image,{ImageProps} from './Image'

// ----------------------------------------------------------------------

export interface LogoProps {
  size?:number,
  href?:string
}

export default function Logo({size=40,href=''}: LogoProps) {
  return (
    <Link href={`${href}/`} passHref><a>
      <Image src="/icon/android-icon-48x48.png" width={size} height={size} />
    </a></Link>
  );
}
