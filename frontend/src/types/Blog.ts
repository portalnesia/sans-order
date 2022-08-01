import { File } from './File';

export interface Blog {
  id: number;
  title: string;
  image?: File;
  slug: string;
  text: string;
  createdBy: {
    name:string,
    picture?: string|null
  };
  publishedAt: Date
}
