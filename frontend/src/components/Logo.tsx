import Link from 'next/link';
// material
import Image from './Image'
import config from '@root/web.config.json'
import { useTheme } from '@mui/material/styles';
// ----------------------------------------------------------------------

export interface LogoProps {
  size?:number,
  href?:string|false
}

export default function Logo({size=40,href=''}: LogoProps) {
  const theme = useTheme();
  if(typeof href==='boolean') return <Image alt={config.title} src={config.logo[theme.palette.mode]} width={size} height={size} />
  return (
    <Link href={`/${href}`} passHref><a>
      <Image alt={config.title} src={config.logo[theme.palette.mode]} width={size} height={size} />
    </a></Link>
  );
}
