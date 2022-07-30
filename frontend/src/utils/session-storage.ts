module SessionStorage {
  export function set(key: string,data:Record<string,any>|any[]) {
    if(typeof window !== 'undefined') {
      const dt = JSON.stringify(data);
      window.sessionStorage.setItem(key,dt);
    }
  }
  export function get<D=Record<string,any>>(key: string): D|undefined {
    if(typeof window !== 'undefined') {
      const data = window.sessionStorage.getItem(key);
      if(data !== null) {
        const dt = JSON.parse(data) as D;
        return dt;
      }
    }
    return undefined
  }
  export function remove(key: string) {
    if(typeof window !== 'undefined') {
      window.sessionStorage.removeItem(key);
    }
  }
}
export default SessionStorage;