export interface IPackageParams {
  scope?: string;
  package: string;
  version?: string;
  0?: string;
}

export interface ITarFile {
  name: string;
  mode: string;
  mtime: number;
  uid: any;
  gid: any;
  size: number;
  checksum: number;
  type: string;
  linkname: string;
  ustarFormat: string;
  version: string;
  uname: string;
  gname: string;
  devmajor: number;
  devminor: number;
  namePrefix: string;
  buffer: ArrayBuffer;
  content: string;
}

export interface IPAXField {
  name: string;
  value: string;
}