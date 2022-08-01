import type { Workbox } from 'workbox-window'

declare global {
  interface Window {
    workbox?: Workbox
  }
}

declare module 'firebase/messaging' {
  export interface NotificationPayload {
    click_action?: string,
    icon?: string
  }
}

declare module '@portalnesia/portalnesia-strapi' {
  export interface PortalnesiaUser {
    admin: boolean
  }
}