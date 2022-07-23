
export interface PriceListFeature {
  id: number;
  description: string;
  locale: string;
  localizations?: { data: PriceListFeature[] }
}
