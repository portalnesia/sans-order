import Link from 'next/link';
// material
import Image from './Image'
import config from '@root/web.config.json'
// ----------------------------------------------------------------------

export interface LogoProps {
  size?:number,
  href?:string|false
}

export default function Logo({size=40,href=''}: LogoProps) {
  if(typeof href==='boolean') return <Image src={config.logo} width={size} height={size} />
  return (
    <Link href={`/${href}`} passHref><a>
      <Image src={config.logo} width={size} height={size} />
    </a></Link>
  );
}
