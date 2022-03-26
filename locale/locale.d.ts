import en from './en.json'

declare module 'use-intl/dist/GlobalMessages' {
  type locale = typeof en;
  
  export default interface GlobalMessages extends locale {

  }
}