import { Ingredient } from '../Ingredient';

export interface Recipes {
  id: number;
  consume: number;
  item?: Ingredient;
}
