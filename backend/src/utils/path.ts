import nodePath from 'path'
import fsNode from 'fs'

module Path {
  export const fs = fsNode
  export const path = nodePath;
  export const contentPath = nodePath.resolve(process.env.PORTALNESIA_CONTENT_ROOT as string)
  export const rootPath = nodePath.resolve(process.env.PORTALNESIA_PHP_ROOT as string)

  const type_obj = {
    root:rootPath,
    content:contentPath
  }

  export function join(type: keyof typeof type_obj,...path: string[]) {
    const paths = [
      type_obj[type],
      ...path
    ];
    return nodePath.join(...paths)
  }
}

export default Path;