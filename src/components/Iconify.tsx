// icons
import { Icon } from '@iconify/react';
// @mui
import { Box,BoxProps } from '@mui/material';
import {ReactElement} from 'react'
// ----------------------------------------------------------------------


export interface IconifyProps extends BoxProps {
  icon: ReactElement|string
}

export default function Iconify({ icon, sx, ...other }: IconifyProps) {
  return <Box component={Icon} icon={icon} sx={{ ...sx }} {...other} />;
}
