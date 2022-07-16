import fs from 'fs'
import path from 'path'

type IDirectory = {
  uid: string,
  dir: string
}

async function generateTypescript(data: IDirectory) {
  const schema = await fs.promises.readFile(path.join(data.dir,'schema.json'));
  const json = JSON.parse(schema.toString());
  const attr = json.attributes;
  const obj: Record<string,any> = {}
  Object.keys(attr).forEach((k)=>{
    const typeOri = attr[k].type;
    let type: string|undefined;
    if(['string','uid','richtext'].includes(typeOri)) {
      type = 'string'
    } else if(['number','boolean'].includes(typeOri)) {
      type = typeOri;
    } else {

    }
    if(type) obj[k] = type;
  })
  console.log(obj);
}

async function listDirs() {
  const dirs = await fs.promises.readdir(path.resolve('./src/api'));
  return dirs.filter(d=>!d.startsWith('.'));
}

function getSchemaDir(uid: string) {
  return path.resolve(path.join('./','src','api',uid,'content-types',uid));
}

async function main() {
  const dirs = await listDirs();
  const maps = dirs.map(d=>({
    uid:d,
    dir: getSchemaDir(d)
  }))
  await generateTypescript(maps[2]);
}

main();