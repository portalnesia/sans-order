import {customShadows} from './shadows'
import {GRADIENTS,PRIMARY,CHART_COLORS} from './palette'

declare module '@mui/material' {
  export interface Theme {
    customShadows: typeof customShadows
  }
  export interface Palette {
    gradients: typeof GRADIENTS,
    chart: typeof CHART_COLORS
  }
  export interface PaletteColor {
    lighter: string,
    darker: string
  }
  export interface Color {
    [500_8]: string,
    [500_12]: string,
    [500_16]: string,
    [500_24]: string,
    [500_32]: string,
    [500_48]: string,
    [500_56]: string,
    [500_80]: string
  }
  export interface TypeBackground {
    neutral: string
  }

  export interface PaletteOptions {
    gradients: typeof GRADIENTS,
    chart: typeof CHART_COLORS
  }
}

declare module '@mui/material/ListItemButton' {
  export interface ListItemButtonBaseProps {
    component?: string
  }
}