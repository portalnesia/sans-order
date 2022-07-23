import { File } from './File';

export interface Blog {
  id: number;
  title: string;
  image?: File;
  slug: string;
  text: string;
}
