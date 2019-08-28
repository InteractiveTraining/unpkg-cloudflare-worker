import CloudflareWorkerGlobalScope from 'types-cloudflare-worker';
import {IPackageParams} from './interfaces';
import {downloadFile, getLatestVersion} from './helpers';
import * as mime from 'mime-types';

declare var self: CloudflareWorkerGlobalScope;

export class Worker {
  public async handle(event: FetchEvent) {
    let url = new URL(event.request.url);
    let path = url.pathname;
    let scope: string;
    let pkg: string;
    let version: string;
    let file: string = path.slice(1).split('/').map(el => el.split('@')).slice(2).join("/");
    const splits = path.slice(1).split('/').map(el => el.split('@')).slice(0, 2);
    
    if (splits[0] instanceof Array && splits[0][0].length === 0) {
      scope = splits[0][1];
      pkg = splits[1][0];
      version = splits[1][1];
    } else {
      pkg = splits[0][0];
      version = splits[0][1];
      file = (file && file.length > 0) ? [splits[1][0], file].join("/") : splits[1][0];
    }
    
    let params: IPackageParams = {
      ['package']: pkg,
      version: version,
      scope: (scope && scope.length > 0) ? `@${scope}` : undefined,
      '0': file
    };
    
    if (!params.version) {
      params.version = 'latest';
    }
    
    if (!params.version.includes('.')) {
      params.version = await getLatestVersion(params);
      const redirectUrl = `${url.origin}/${(params.scope) ? `${params.scope}/` : ``}${params.package}@${params.version}/${params['0']}`;
      console.log('redirect', redirectUrl);
      return Response.redirect(redirectUrl, 302);
    }
    
    // if file path is empty - respond with directory listing
    if (params['0'] === '') {
      //await getPackageFileList(params);
      return new Response(JSON.stringify({route: 'browse'}), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=31536000'
        }
      });
    } else {
      return new Response(await downloadFile(params), {
        status: 200,
        headers: {
          'Content-Type': mime.lookup(params['0']),
          'Cache-Control': 'public, max-age=31536000'
        }
      });
    }
  }
  
  
  public async handleTwo(event: FetchEvent) {
    return new Response(JSON.stringify({test: 'route-2'}), {status: 200});
  }
}

self.addEventListener('fetch', (event: FetchEvent) => {
  const worker = new Worker();
  // const url = new URL(event.request.url);
  //
  // const route = (): keyof Worker => {
  //   if (url.host === 'test.example.com') {
  //     return 'handle';
  //   } else if (url.host === 'test2.example.com') {
  //     return 'handleTwo';
  //   }
  // };
  //
  // event.respondWith(worker[route()](event));
  
  event.respondWith(worker.handle(event));
});
