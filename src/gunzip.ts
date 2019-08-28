import * as pako from 'pako';

function concatArrayBuffer(arrayBufferList = []) {
  const resultTypedArray = new Uint8Array(arrayBufferList.reduce((o, arrayBuffer) => o + arrayBuffer.byteLength, 0));
  let byteOffset = 0;
  arrayBufferList.forEach((arrayBuffer) => {
    const {byteLength} = arrayBuffer;
    resultTypedArray.set(new Uint8Array(arrayBuffer), byteOffset);
    byteOffset += byteLength
  });
  return resultTypedArray.buffer
}

// https://github.com/nodeca/pako/issues/35#issuecomment-437341187
export function gunzipAll(arrayBuffer: ArrayBuffer) {
  const arrayBufferList = [];
  let byteOffset = 0;
  let byteLeft = 1;
  while (byteLeft > 0) {
    const inflator = new pako.Inflate() as any;
    inflator.push(new Uint8Array(arrayBuffer, byteOffset));
    if (inflator.err) throw inflator.msg;
    arrayBufferList.push(inflator.result);
    byteOffset += inflator.strm.total_in;
    byteLeft = inflator.strm.avail_in
  }
  return concatArrayBuffer(arrayBufferList)
}