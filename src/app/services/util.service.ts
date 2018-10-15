import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  static async datArchiveCreate(opts: any): Promise<DatArchive | null> {
    try {
      return await DatArchive.create(opts)
    }
    catch (e) {
      if (e.name === 'UserDeniedError' && e.permissionDenied === true)
        return null
      throw e
    }
  }

  static async datArchiveSelectArchive(opts: any): Promise<DatArchive | null> {
    try {
      return await DatArchive.selectArchive(opts)
    }
    catch (e) {
      if (e.name === 'UserDeniedError' && e.permissionDenied === true)
        return null
      throw e
    }
  }

  /**
   * TODO: actually not accuare because, for example, it should throw in case of timeout error instead of returning false.
   * TODO: That may enhance when there's a documented way to differentiate between exception types.
   * TODO: In the current business logic, the action depends on the presence of file/directory. However, if there's an action that depends
   * TODO: on the absence, you actually can't depend on this method. Same for directoryExists.
   */
  static async fileExists(datArchive: DatArchive, path: string): Promise<boolean> {
    try {
      return (await datArchive.stat(path)).isFile()
    }
    catch(e) {
      return false
    }
  }

  static async directoryExists(datArchive: DatArchive, path: string): Promise<boolean> {
    try {
      return (await datArchive.stat(path)).isDirectory()
    }
    catch(e) {
      return false
    }
  }

  static getCurrentMonth(): string {
    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1
    return year.toString() + '-' + (month < 10 ? '0' + month.toString() : month.toString())
  }

  static assertNever(x: never): never {
    throw new Error("Unexpected object: " + x)
  }

  wait(milliseconds): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
  }
}
