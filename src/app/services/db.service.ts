import {Injectable} from '@angular/core';
import {DBRow} from 'src/app/models/db-row.model';
import {v4 as uuid} from 'uuid';
import {UtilService} from './util.service';
import {Lock, LockerService} from './locker.service';

/**
 * A wrapper around a profile dat archive that is used as a database.
 *
 * For my use-case, I should always be dealing with JSON values. This service will be built on that assumption.
 * // TODO: improve wording of the line above.
 */
@Injectable({
  providedIn: 'root'
})
export class DBService {

  /**
   * This is the only place my application is allowed to edit. I'll consider other places to belong to other apps.
   *
   * TODO: Of course, change this to the actual PK when publishing isA
   */
  private readonly ROOT = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6';

  private readonly BASE_DIR_COMPONENTS = [ this.ROOT, 'version', '545']
  private readonly BASE_DIR = '/' + this.BASE_DIR_COMPONENTS.join('/');
  private readonly TABLES_NAMES = ['salaries', 'trustees']

  private readonly migrations = [
    { preCheck: async (datArchive: DatArchive) => await this.preCheckIsNewArchive(datArchive),
      migrate: async (datArchive: DatArchive) => await this.migrateNewArchiveTo545(datArchive),
      postCheck: async (datArchive: DatArchive) => await this.postCheck545(datArchive),
    }
  ]

  constructor(
    private readonly lockerService: LockerService,
    private readonly utilService: UtilService
  ) { }

  private async preCheckIsNewArchive(datArchive: DatArchive): Promise<boolean> {
    return await this.utilService.isNewArchive(datArchive)
  }

  private async migrateNewArchiveTo545(datArchive: DatArchive): Promise<void> {
    let base = ''
    for (const baseDirComponent of this.BASE_DIR_COMPONENTS) {
      base = base + '/' + baseDirComponent;
      await datArchive.mkdir(base)
    }
    for (const tableName of this.TABLES_NAMES)
      await datArchive.mkdir(base + '/' + tableName)
  }

  private async postCheck545(datArchive: DatArchive): Promise<boolean> {
    let base = ''
    for (const baseDirComponent of this.BASE_DIR_COMPONENTS) {
      base = base + '/' + baseDirComponent;
      if (!await this.utilService.directoryExists(datArchive, base))
        return false
    }
    for (const tableName of this.TABLES_NAMES)
      if (!await this.utilService.directoryExists(datArchive, base + '/' + tableName))
        return false
    return true
  }

  async migrateDB(datArchive: DatArchive): Promise<void> {
    // TODO: May actually take longer. Perhaps calculate it depends on the number of rows?
    const lockSecret = await this.lockerService.acquireLock(Lock.MigrateDB, 5 * 60 * 1000)
    try {
      let i = this.migrations.length - 1
      while(i > 0 && !this.migrations[i].postCheck(datArchive))
        --i
      while(i < this.migrations.length) {
        if (this.migrations[i].preCheck(datArchive))
          throw new Error(`migrations preCheck failed for the ${i} migration. Perhaps the archive has been used by another website?`)
        this.migrations[i].migrate(datArchive)
        if (!this.migrations[i].postCheck(datArchive))
          throw new Error(`migrations postCheck failed for the ${i} migration although the migrations has just been run. That's probably a bug.`)
      }
    }
    catch(e) {
      throw e
    }
    finally {
      this.lockerService.releaseLock(Lock.MigrateDB, lockSecret)
    }
  }

  async isDBInitialized(datArchive: DatArchive): Promise<boolean> {
    try {
      const tables = await datArchive.readdir(this.BASE_DIR)
      if (tables.length !== this.TABLES_NAMES.length)
        return false
      for (const tableName of this.TABLES_NAMES)
        if (!tables.includes(tableName))
          return false
      return true
    }
    catch (e) {
      return false;
    }
  }

  async initDB(datArchive: DatArchive): Promise<void> {
    let base = ''
    for (const baseDirComponent of this.BASE_DIR_COMPONENTS) {
      base = base + '/' + baseDirComponent;
      await datArchive.mkdir(base)
    }
    for (const tableName of this.TABLES_NAMES)
      await datArchive.mkdir(base + '/' + tableName)
  }

  /**
   * Will JSON.stringify(...) on whatever jsonStringifiable is sent.
   *
   * Mainly used for adding a row. There's a tiny, _tiny_ probability of overriding a row due to uuid collision.
   */
  async putRow<T>(datArchive: DatArchive, tableName: string, jsonStringifiable: T): Promise<DBRow<T>> {
    return await this.putRow2(datArchive, tableName, jsonStringifiable, uuid())
  }

  /**
   * Mainly used to updating an existing row. Wouldn't complain if given a non-existing uuid, though.
   */
  async putRow2<T>(datArchive: DatArchive, tableName: string, jsonStringifiable: T, uuid: string): Promise<DBRow<T>> {
    const row = new DBRow(uuid, jsonStringifiable)
    await datArchive.writeFile(this.wp(tableName + "/" + row.uuid + ".json"), JSON.stringify(row.dbRowData))
    return row
  }

  async readRow<T>(datArchive: DatArchive, tableName: string, uuid: string): Promise<DBRow<T>> {
    return new DBRow<T>(uuid, JSON.parse(await datArchive.readFile(this.wp(tableName + "/" + uuid + ".json"))))
  }

  async deleteRow<T>(datArchive: DatArchive, tableName: string, uuid: string): Promise<void> {
    return await datArchive.unlink(this.wp(tableName + "/" + uuid + ".json"))
  }

  async getRowsUuids(datArchive: DatArchive, tableName: string): Promise<Array<string>> {
    const filesNames = await datArchive.readdir(this.wp(tableName))
    // thanks to https://stackoverflow.com/a/45165923/6690391
    const uuids = filesNames.map(fileName => fileName.slice(0, -5))
    return uuids
  }

  /**
   * wrap path
   *
   * Note: if `path` doesn't begin with "/", will append it. E.g.,:
   * wp("abc") = wp("/abc") = /60c.../version/545/abc
   *
   * Do NOT think of any relative-url handling at all! If you want `abc` to be a relative path, what will it be
   * relative to?!
   */
  private wp(path: string) : string {
    return this.BASE_DIR + (path.startsWith("/") ? "" : "/") + path;
  }
}
