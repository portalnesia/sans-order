import { IUserAccess } from "./Outlet";

export interface OutletUserRole {
  id: number;
  name: IUserAccess;
  description?: string;
}
