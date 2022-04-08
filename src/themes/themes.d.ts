import {customShadows} from './shadows'
import {GRADIENTS,PRIMARY} from './palette'

declare module '@mui/material' {
  export interface Theme {
    customShadows: typeof customShadows
  }
  export interface Palette {
    gradients: typeof GRADIENTS
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
}

declare module '@mui/material/ListItemButton' {
  export interface ListItemButtonBaseProps {
    component?: string
  }
}