import { PriceFeatures } from './components/PriceFeatures';

export interface PriceList {
  id: number;
  name: string;
  price: number;
  discount: number;
  features: PriceFeatures[];
  recommend: boolean;
  qty: number;
}
