import {IDate} from './general'

export type IBaseFiles = {
  id: string,
  id_number: number,
  title: string,
  created: IDate,
  private: boolean,
  type: 'video'|'audio'|'images'|'youtube',
  size: number,
  thumbs: string|null,
  url: string,
  artist?: string,
}

export interface IFiles extends IBaseFiles {
  can_set_profile?: boolean,
  is_profile_picture?: boolean
}

export interface IFilesDetail extends IBaseFiles {
  seen: ISeen;
  user: UserPagination
}