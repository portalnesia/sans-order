import { ReactNode,useMemo } from 'react';
import Head from 'next/head'
import config from '@root/web.config.json'
// material
// ----------------------------------------------------------------------

export interface HeaderProps {
  children: ReactNode,
  title?: string,
  desc?: string|null
}


export default function Header({ children, title,desc }: HeaderProps) {
  const titles = useMemo(()=>title ? `${title} | ${config.title}` : config.title,[title]);
  const description = useMemo(()=>typeof desc === 'string' && desc.length > 0 ? `${desc} - ${config.description}` : config.description,[desc]);

  return (
    <>
      <Head>
        <title>{titles}</title>
        <meta name='description' content={description} />
      </Head>
      {children}
    </>
  )
};
