import { PriceListFeature } from '../PriceListFeature';

export interface PriceFeatures {
  id: number;
  feature?: PriceListFeature;
  enabled: boolean;
}
