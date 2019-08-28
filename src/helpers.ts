import {IPackageParams} from './interfaces';
import {untarBuffer} from './tar';
import {gunzipAll} from './gunzip';


export function getRegistryOptions(): RequestInit {
  let options: RequestInit = {};
  
  // if (process.env.NPM_TOKEN && process.env.NPM_TOKEN.trim().length > 0) {
  //   options.headers = {authorization: `Bearer ${process.env.NPM_TOKEN.trim()}`};
  // } else {
  //   options.auth = `${process.env.NPM_USER}:${process.env.NPM_PASSWORD}`;
  // }
  
  return options;
}

export function getPackageUrl(pkg: IPackageParams): string {
  return `https://registry.npmjs.com/${(pkg.scope) ? `${pkg.scope}/` : ''}${pkg.package}`;
}

export async function getLatestVersion(pkg: IPackageParams): Promise<string> {
  return new Promise(async (resolve, reject) => {
    let res = await fetch(getPackageUrl(pkg), getRegistryOptions());
    let body = await res.json();
    const tags = body['dist-tags'];
    resolve(tags[pkg.version] || tags['latest']);
  });
}


export async function downloadFile(pkg: IPackageParams): Promise<string> {
  let url = `${getPackageUrl(pkg)}/-/${pkg.package}-${pkg.version}.tgz`;
  console.log('download', url);
  let response = await fetch(url, getRegistryOptions());
  
  let arrayBuffer = await response.arrayBuffer();
  let gunzipBuffer = gunzipAll(arrayBuffer);
  
  return untarBuffer(gunzipBuffer, pkg['0']);
}