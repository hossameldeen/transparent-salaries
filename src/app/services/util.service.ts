import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  async datArchiveCreate(opts: any): Promise<DatArchive | null> {
    try {
      return await DatArchive.create(opts)
    }
    catch (e) {
      if (e.name === 'UserDeniedError' && e.permissionDenied === true)
        return null
      throw e
    }
  }

  async datArchiveSelectArchive(opts: any): Promise<DatArchive | null> {
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
   * TODO: a hack. Depends on our knowledge that beaker by default writs dat.json & .datignore
   */
  async isNewArchive(datArchive: DatArchive): Promise<boolean> {
    return (await datArchive.getInfo()).version === 2
  }

  /**
   * TODO: actually not accuare because, for example, it should throw in case of timeout error instead of returning false.
   * TODO: That may enhance when there's a documented way to differentiate between exception types.
   * TODO: In the current business logic, the action depends on the presence of file/directory. However, if there's an action that depends
   * TODO: on the absence, you actually can't depend on this method. Same for directoryExists.
   */
  async fileExists(datArchive: DatArchive, path: string): Promise<boolean> {
    return (await datArchive.getInfo()).version === 2
  }

  async directoryExists(datArchive: DatArchive, path: string): Promise<boolean> {
    return (await datArchive.getInfo()).version === 2
  }

  getCurrentMonth(): string {
    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1
    return year.toString() + '-' + (month < 10 ? '0' + month.toString() : month.toString())
  }

  assertNever(x: never): never {
    throw new Error("Unexpected object: " + x)
  }

  wait(milliseconds): Promise<void> {
    return new Promise((resolve, _) => setTimeout(resolve, milliseconds))
  }
}
