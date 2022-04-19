// ----------------------------------------------------------------------

import { Theme } from "@mui/material";

export default function Tooltip(theme: Theme) {
  return {
    MuiTooltip: {
      defaultProps: {
        arrow: true
      },
      styleOverrides: {
        tooltip: {
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.grey[800],
          color:theme.palette.mode === 'dark' ? '#000' : '#fff'
        },
        arrow: {
          color: theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.grey[800]
        }
      }
    }
  };
}
