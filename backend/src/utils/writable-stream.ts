import stream from 'stream'

export default class WritableBufferStream extends stream.Writable {
  _chunks: any[] = []
  
  _write(chunk: any,enc: string,callbacks: (err?: Error|null)=>void){
    this._chunks.push(chunk);
    callbacks(null);
  }

  _destroy(err: any, callbacks: (err?: Error|null)=>void) {
    this._chunks = [];
  }

  toBuffer() {
    return Buffer.concat(this._chunks);
  }
}