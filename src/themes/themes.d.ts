import {customShadows} from './shadows'
import {GRADIENTS,PRIMARY,CHART_COLORS} from './palette'
import type {LoadingButtonTypeMap} from '@mui/lab'
import type {OverrideProps} from '@mui/material/OverridableComponent'
import type {ElementType} from 'react'

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

  export type LoadingButtonProps<
    D extends React.ElementType = LoadingButtonTypeMap['defaultComponent'],
    P = {},
  > = OverrideProps<LoadingButtonTypeMap<P, D>, D>;
}

declare module '@mui/lab' {
  type CustomProps = {
    component?: string,
    download?: string,
    target?: string,
    rel?: string
  }
  export type LoadingButtonProps<
    D extends ElementType = LoadingButtonTypeMap['defaultComponent'],
    P = CustomProps,
  > = OverrideProps<LoadingButtonTypeMap<P, D>, D>;
}

declare module '@mui/material/ListItemButton' {
  export interface ListItemButtonBaseProps {
    component?: string
  }
}