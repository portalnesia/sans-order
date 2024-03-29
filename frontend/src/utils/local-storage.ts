import { nanoid } from "@portalnesia/utils";

module LocalStorage {
    export function set(key: string,data:Record<string,any>|any[]) {
        if(typeof window !== 'undefined') {
            const dt = JSON.stringify(data);
            window.localStorage.setItem(key,dt);
        }
    }
    export function get<D=Record<string,any>>(key: string): D|undefined {
        if(typeof window !== 'undefined') {
            const data = window.localStorage.getItem(key);
            if(data !== null) {
                const dt = JSON.parse(data) as D;
                return dt;
            }
        }
        return undefined
    }
    export function remove(key: string) {
        if(typeof window !== 'undefined') {
            window.localStorage.removeItem(key);
        }
    }
    export function getID() {
      if(typeof window !== 'undefined') {
        let id = window.localStorage.getItem('pn_device_id');
        if(!id) {
          id = nanoid();
          window.localStorage.setItem('pn_device_id',id);
        }
        return id;
      }
      return undefined;
    }
}
export default LocalStorage;