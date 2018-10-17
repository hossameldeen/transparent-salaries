import {Injectable} from '@angular/core';
import {DBRow} from 'src/app/models/db-row.model';
import {v4 as uuid} from 'uuid';
import {UtilService} from './util.service';
import {Lock, LockerService} from './locker.service';
import {Profile} from 'src/app/models/profile.model';

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

  readonly PROFILE_ROW_UUID = 'profile'

  /**
   * This is the only place my application is allowed to edit. I'll consider other places to belong to other apps.
   *
   * TODO: Of course, change this to the actual PK when publishing isA
   */
  private readonly ROOT = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6';

  private readonly BASE_DIR_COMPONENTS = [ this.ROOT, 'version', '753']
  private readonly BASE_DIR = '/' + this.BASE_DIR_COMPONENTS.join('/')
  private readonly TABLES_NAMES = ['salaries', 'trustees', 'profiles']  // TODO: profiles actually should have only one row

  private readonly migrations = [
    { migrate: async (datArchive: DatArchive) => await DBService.migrateNewArchiveTo545(datArchive),
      check: async (datArchive: DatArchive) => await DBService.check545(datArchive),
      idempotentCleanup: async (datArchive: DatArchive) => await DBService.idempotentCleanup(datArchive, '545')
    },
    { migrate: async (datArchive: DatArchive) => await DBService.migrate545To752(datArchive),
      check: async (datArchive: DatArchive) => await DBService.check752(datArchive),
      idempotentCleanup: async (datArchive: DatArchive) => await DBService.idempotentCleanup(datArchive, '752')
    },
    { migrate: async (datArchive: DatArchive) => await DBService.migrate752To753(datArchive),
      check: async (datArchive: DatArchive) => await DBService.check753(datArchive),
      idempotentCleanup: async (datArchive: DatArchive) => await DBService.idempotentCleanup(datArchive, '753')
    }
  ]

  constructor(
    private readonly lockerService: LockerService
  ) { }

  static async migrateNewArchiveTo545(datArchive: DatArchive): Promise<void> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6'
    const baseDirComponents = [ root, 'version', '545']
    const tablesNames = ['salaries', 'trustees']

    // 1- remove previous in-progress migrations
    try {
      // just in case a migration had already started and stopped in the middle
      await datArchive.rmdir('/' + root, { recursive: true })
    }
    catch (e) {
      // It's ok if it doesn't exist
    }

    // 2- migrate
    // create /root/version/545
    let base = ''
    for (const baseDirComponent of baseDirComponents) {
      base = base + '/' + baseDirComponent;
      await datArchive.mkdir(base)
    }
    // create /root/version/545/salaries and /root/version/545/trustees
    for (const tableName of tablesNames)
      await datArchive.mkdir(base + '/' + tableName)
  }

  static async migrate545To752(datArchive: DatArchive): Promise<void> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6'
    const baseDirComponents = [ root, 'version', '752']
    const newBaseDir = '/' + baseDirComponents.join('/')
    const oldBaseDir = '/' + [root, 'version', '545'].join('/')

    // 1- remove previous in-progress migrations
    try {
      // just in case a migration had already started and stopped in the middle
      await datArchive.rmdir(newBaseDir, { recursive: true })
    }
    catch (e) {
      // It's ok if it doesn't exist. TODO: check the error is actually a doesn't-exist error.
    }

    // 2- migrate
    await datArchive.copy(oldBaseDir, newBaseDir)
    await datArchive.writeFile(newBaseDir + '/migration-done-752', 'Migration to 752 done.')
  }

  static async migrate752To753(datArchive: DatArchive): Promise<void> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6'
    const oldBaseDir = '/' + [root, 'version', '752'].join('/')
    const newBaseDir = '/' + [root, 'version', '753'].join('/')
    const profileRowUuid = 'profile'

    // 1- remove previous in-progress migrations
    try {
      // just in case a migration had already started and stopped in the middle
      await datArchive.rmdir(newBaseDir, { recursive: true })
    }
    catch (e) {
      // It's ok if it doesn't exist. TODO: check the error is actually a doesn't-exist error.
    }

    // 2- migrate
    await datArchive.copy(oldBaseDir, newBaseDir)
    await datArchive.unlink(newBaseDir + '/migration-done-752')

    await datArchive.mkdir(newBaseDir + '/profiles')
    await this.putRow2Static<Profile>(datArchive, newBaseDir + '/profiles', new Profile(null), profileRowUuid)

    await datArchive.writeFile(newBaseDir + '/migration-done-753', 'Migration to 753 done.')
  }

  static async check545(datArchive: DatArchive): Promise<boolean> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6'
    const baseDirComponents = [ root, 'version', '545']
    const tablesNames = ['salaries', 'trustees']
    let base = ''
    for (const baseDirComponent of baseDirComponents) {
      base = base + '/' + baseDirComponent
      if (!await UtilService.directoryExists(datArchive, base))
        return false
    }
    for (const tableName of tablesNames)
      if (!await UtilService.directoryExists(datArchive, base + '/' + tableName))
        return false
    return true
  }

  static async check752(datArchive: DatArchive): Promise<boolean> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6'
    const baseDirComponents = [ root, 'version', '752']
    const baseDir = '/' + baseDirComponents.join('/')
    const tablesNames = ['salaries', 'trustees']
    let base = ''
    for (const baseDirComponent of baseDirComponents) {
      base = base + '/' + baseDirComponent;
      if (!await UtilService.directoryExists(datArchive, base))
        return false
    }
    for (const tableName of tablesNames)
      if (!await UtilService.directoryExists(datArchive, base + '/' + tableName))
        return false
    return await UtilService.fileExists(datArchive, baseDir + '/migration-done-752')
  }

  static async check753(datArchive: DatArchive): Promise<boolean> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6'
    const baseDirComponents = [ root, 'version', '753']
    const baseDir = '/' + baseDirComponents.join('/')
    const tablesNames = ['salaries', 'trustees', 'profiles']
    const profileRowUuid = 'profile'
    let base = ''
    for (const baseDirComponent of baseDirComponents) {
      base = base + '/' + baseDirComponent;
      if (!await UtilService.directoryExists(datArchive, base))
        return false
    }
    for (const tableName of tablesNames)
      if (!await UtilService.directoryExists(datArchive, base + '/' + tableName))
        return false
    if (!await UtilService.fileExists(datArchive, baseDir + '/profiles/' + profileRowUuid + '.json'))
      return false
    return await UtilService.fileExists(datArchive, baseDir + '/migration-done-753')
  }

  static async idempotentCleanup(datArchive: DatArchive, version: string): Promise<void> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6'
    const baseDirComponents = [ root, 'version', version]
    const baseDir = '/' + baseDirComponents.join('/')

    try {
      await datArchive.rmdir(baseDir, { recursive: true })
    }
    catch(e) {
      // It's ok if it doesn't exist. TODO: check the error is actually a doesn't-exist error.
    }
  }

  async migrateDB(datArchive: DatArchive): Promise<void> {
    // TODO: May actually take longer. Perhaps calculate it depends on the number of rows?
    const lockSecret = await this.lockerService.acquireLock(Lock.MigrateDB, 5 * 60 * 1000)
    try {
      {
        // Curly braces to limit the scope of the variable `i`
        let i = this.migrations.length - 1
        while(i >= 0 && !await this.migrations[i].check(datArchive))
          --i
        for (i++; i < this.migrations.length; ++i)
          await this.migrations[i].migrate(datArchive)
      }
      // clean-up all previous versions' files
      for (let i = 0; i < this.migrations.length - 1; ++i)
        await this.migrations[i].idempotentCleanup(datArchive)
    }
    finally {
      this.lockerService.releaseLock(Lock.MigrateDB, lockSecret)
    }
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
   * Update: Actually, currently, correctly, used in a case that creates a new row (or the static version below)
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
   * The difference is that this one shouldn't depend on stuff like the version.
   * TODO: Actually, it could if, e.g., the version was a static property. This needs to be refactored.
   */
  static async putRow2Static<T>(datArchive: DatArchive, parentPath: string, jsonStringifiable: T, uuid: string): Promise<DBRow<T>> {
    const row = new DBRow(uuid, jsonStringifiable)
    await datArchive.writeFile(parentPath + "/" + row.uuid + ".json", JSON.stringify(row.dbRowData))
    return row
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
