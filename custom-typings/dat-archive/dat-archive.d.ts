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

  /**
   * opts & opts.recursive should be optional, but making them required because you usually you want it recursive and
   * to remind you to send it.
   */
  rmdir(path: string, opts: { recursive: boolean }): Promise<void>;

  /**
   * Copies a file or directory to a target path.
   *
   * Example: await archive.copy('/images', '/backup-images')
   */
  copy(path: string, dstPath: string, opts?: { timeout?: number }): Promise<void>;

  /**
   * Works with both files and directories
   */
  rename(oldPath: string, newPath: string, opts?: { timeout?: number }): Promise<void>;

  /**
   * I'm adding it only because it's used in the standard example of `watch`.
   */
  download(path: string, opts?: { timeout?: number }): Promise<void>;

  /**
   * The EventTarget returned has 2 events: change and invalidated.
   *
   * Usually, you shouldn't need to add `onInvalidated` here, add it manually.
   *
   * For the standard way to use it, check Beaker's DatArchive API docs.
   */
  watch(pattern?: string | Array<string>, onInvalidated?: ({ path: string }) => void): Promise<EventTarget & { close: () => void }>;
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
