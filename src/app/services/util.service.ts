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

  getCurrentMonth(): string {
    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1
    return year.toString() + '-' + (month < 10 ? '0' + month.toString() : month.toString())
  }
}
