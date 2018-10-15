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

  stat(path: string, opts?: { timeout?: number }): Promise<Stat>;

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

/**
 * TODO: Not sure if this will actually work, because pfrazee seems to be creating the Stat class manually by binding to prototype instead
 * TODO: of using javascript classes syntax.
 */
declare class Stat {
  isDirectory(): boolean
  isFile(): boolean

  // files only:
  size: number // (bytes)
  blocks: number // (number of data blocks in the metadata)
  downloaded: number // (number of blocks downloaded, if a remote archive)
  mtime: Date // (last modified time; not reliable)
  ctime: Date // (creation time; not reliable)
}
