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
}

declare module '@mui/material/ListItemButton' {
  export interface ListItemButtonBaseProps {
    component?: string
  }
}