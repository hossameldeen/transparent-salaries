declare class DatArchive {

  static create(opts: any): Promise<DatArchive>;

  static selectArchive(opts: any): Promise<DatArchive>;

  constructor(datUrl: String);

  url: string;

  getInfo(): Promise<{
    key: string,
    url: string,
    version: number,
    peers: number,
    isOwner: boolean,

    title: string,
    description: string,
  
    mtime: number,
    size: number,
  }>;

  /**
   * There're rules for when a string is returned is returned. Check the docs.
   * 
   * I wish I could write it using dependent types.
   */
  readFile(path: string, opts?: { encoding?: string, timeout?: number }): Promise<string>;

  /**
   * There're rules for when an ArrayBuffer is returned is returned. Check the docs.
   */
  readFile(path: string, opts?: { encoding?: string, timeout?: number }): Promise<ArrayBuffer>;

  readdir(path: string, opts?: { recursive?: boolean, timeout?: number, stat?: boolean }): Promise<Array<string>>;

  /**
   * @param data there're rules on the allowable types of this parameter; check the docs.
   */
  writeFile(path: string, data, opts?: { encoding?: string }): Promise<void>;

  /**
   * @param data there're rules on the allowable types of this parameter; check the docs.
   */
  writeFile(path: string, data, encoding?: string): Promise<void>;

  mkdir(path: string): Promise<void>;

  unlink(path: string): Promise<void>;
}
