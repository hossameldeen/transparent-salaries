import {Injectable} from '@angular/core';
import {Lock, LockerService} from './locker.service';
import {DBRow} from '../models/db-row.model';
import {UtilService} from './util.service';

@Injectable({
  providedIn: 'root'
})
export class OldMigrationService {

  private readonly migrations = [
    {
      migrate: async (datArchive: DatArchive) => await this.migrateNewArchiveTo545(datArchive),
      check: async (datArchive: DatArchive) => await this.check545(datArchive),
      idempotentCleanup: async (datArchive: DatArchive) => await this.idempotentCleanup(datArchive, '545')
    },
    {
      migrate: async (datArchive: DatArchive) => await this.migrate545To752(datArchive),
      check: async (datArchive: DatArchive) => await this.check752(datArchive),
      idempotentCleanup: async (datArchive: DatArchive) => await this.idempotentCleanup(datArchive, '752')
    },
    {
      migrate: async (datArchive: DatArchive) => await this.migrate752To753(datArchive),
      check: async (datArchive: DatArchive) => await this.check753(datArchive),
      idempotentCleanup: async (datArchive: DatArchive) => await this.idempotentCleanup(datArchive, '753')
    },
    {
      migrate: async (datArchive: DatArchive) => await this.migrate753To754(datArchive),
      check: async (datArchive: DatArchive) => await this.check754(datArchive),
      idempotentCleanup: async (datArchive: DatArchive) => await this.idempotentCleanup(datArchive, '754')
    },
    {
      migrate: async (datArchive: DatArchive) => await this.migrate754To0(datArchive),
      check: async (datArchive: DatArchive) => await this.check0(datArchive),
      idempotentCleanup: async (datArchive: DatArchive) => await this.idempotentCleanup(datArchive, '0')
    }
  ];

  constructor(private readonly lockerService: LockerService) {
  }

  async migrateDB(datArchive: DatArchive): Promise<void> {
    // TODO: May actually take longer. Perhaps calculate it depending on the number of rows?
    const lockSecret = await this.lockerService.acquireLock(Lock.MigrateDB, 5 * 60 * 1000);
    try {
      let biggestCheckedMigration = -1;
      for (let i = this.migrations.length - 1; i >= 0; --i)
        if (await this.migrations[i].check(datArchive)) {
          biggestCheckedMigration = i;
          break;
        }

      if (biggestCheckedMigration - 1 >= 0)
        await this.migrations[biggestCheckedMigration - 1].idempotentCleanup(datArchive);

      for (let i = biggestCheckedMigration + 1; i < this.migrations.length; ++i) {
        await this.migrations[i].migrate(datArchive);
        if (i - 1 >= 0)
          await this.migrations[i - 1].idempotentCleanup(datArchive);
      }
    }
    finally {
      this.lockerService.releaseLock(Lock.MigrateDB, lockSecret);
    }
  }

  async idempotentCleanup(datArchive: DatArchive, version: string): Promise<void> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6';
    const baseDirComponents = [root, 'version', version];
    const baseDir = '/' + baseDirComponents.join('/');

    try {
      await datArchive.rmdir(baseDir, {recursive: true});
    }
    catch (e) {
      // It's ok if it doesn't exist. TODO: check the error is actually a doesn't-exist error.
    }
  }

  // MIGRATION HELPERS======================================================================================================================
  // Any migration helper is postfixed with the `nextVersion` it was written for. It can be used by other future migrations, but should
  // never be changed again, and same for migrations' code.

  async putRow2_753<T>(datArchive: DatArchive, parentPath: string, jsonStringifiable: T, uuid: string): Promise<DBRow<T>> {
    const row = new DBRow(uuid, jsonStringifiable);
    await datArchive.writeFile(parentPath + '/' + row.uuid + '.json', JSON.stringify(row.dbRowData));
    return row;
  }

  async readRow_754<T>(datArchive: DatArchive, parentPath: string, uuid: string): Promise<DBRow<T>> {
    return new DBRow<T>(uuid, JSON.parse(await datArchive.readFile(parentPath + '/' + uuid + '.json')));
  }

  // MIGRATIONS=============================================================================================================================

  // OLD MIGRATIONS=========================================================================================================================

  /**
   * salaries/
   * trustees/
   */
  async migrateNewArchiveTo545(datArchive: DatArchive): Promise<void> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6';
    const baseDirComponents = [root, 'version', '545'];
    const tablesNames = ['salaries', 'trustees'];

    // 1- remove previous in-progress migrations
    try {
      // just in case a migration had already started and stopped in the middle
      await datArchive.rmdir('/' + root, {recursive: true});
    }
    catch (e) {
      // It's ok if it doesn't exist
    }

    // 2- migrate
    // create /root/version/545
    let base = '';
    for (const baseDirComponent of baseDirComponents) {
      base = base + '/' + baseDirComponent;
      await datArchive.mkdir(base);
    }
    // create /root/version/545/salaries and /root/version/545/trustees
    for (const tableName of tablesNames)
      await datArchive.mkdir(base + '/' + tableName);
  }

  /**
   * salaries/
   * trustees/
   * migration-done-752
   */
  async migrate545To752(datArchive: DatArchive): Promise<void> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6';
    const baseDirComponents = [root, 'version', '752'];
    const newBaseDir = '/' + baseDirComponents.join('/');
    const oldBaseDir = '/' + [root, 'version', '545'].join('/');

    // 1- remove previous in-progress migrations
    try {
      // just in case a migration had already started and stopped in the middle
      await datArchive.rmdir(newBaseDir, {recursive: true});
    }
    catch (e) {
      // It's ok if it doesn't exist. TODO: check the error is actually a doesn't-exist error.
    }

    // 2- migrate
    await datArchive.copy(oldBaseDir, newBaseDir);
    await datArchive.writeFile(newBaseDir + '/migration-done-752', 'Migration to 752 done.');
  }

  /**
   * salaries/
   * trustees/
   * profiles/
   *   - profile.json { displayName: null }
   * migration-done-753
   */
  async migrate752To753(datArchive: DatArchive): Promise<void> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6';
    const oldBaseDir = '/' + [root, 'version', '752'].join('/');
    const newBaseDir = '/' + [root, 'version', '753'].join('/');
    const profileRowUuid = 'profile';

    // 1- remove previous in-progress migrations
    try {
      // just in case a migration had already started and stopped in the middle
      await datArchive.rmdir(newBaseDir, {recursive: true});
    }
    catch (e) {
      // It's ok if it doesn't exist. TODO: check the error is actually a doesn't-exist error.
    }

    // 2- migrate
    await datArchive.copy(oldBaseDir, newBaseDir);
    await datArchive.unlink(newBaseDir + '/migration-done-752');

    await datArchive.mkdir(newBaseDir + '/profiles');
    await this.putRow2_753<{ displayName: string | null }>(datArchive, newBaseDir + '/profiles', {displayName: null}, profileRowUuid);

    await datArchive.writeFile(newBaseDir + '/migration-done-753', 'Migration to 753 done.');
  }

  /**
   * salaries/
   * trustees/
   * profiles/
   *   - profile.json if displayName === null => displayName <- ""
   * migration-done-754
   */
  async migrate753To754(datArchive: DatArchive): Promise<void> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6';
    const oldBaseDir = '/' + [root, 'version', '753'].join('/');
    const newBaseDir = '/' + [root, 'version', '754'].join('/');
    const profileRowUuid = 'profile';

    // 1- remove previous in-progress migrations
    try {
      // just in case a migration had already started and stopped in the middle
      await datArchive.rmdir(newBaseDir, {recursive: true});
    }
    catch (e) {
      // It's ok if it doesn't exist. TODO: check the error is actually a doesn't-exist error.
    }

    // 2- migrate
    await datArchive.copy(oldBaseDir, newBaseDir);
    await datArchive.unlink(newBaseDir + '/migration-done-753');

    const oldDisplayName = (await this.readRow_754<{ displayName: string | null }>(datArchive, newBaseDir + '/profiles', profileRowUuid)).dbRowData.displayName;
    const newProfile = {displayName: oldDisplayName ? oldDisplayName : ''};
    await this.putRow2_753<{ displayName: string }>(datArchive, newBaseDir + '/profiles', newProfile, profileRowUuid);

    await datArchive.writeFile(newBaseDir + '/migration-done-754', 'Migration to 754 done.');
  }

  /**
   * salaries/
   * trustees/
   * profiles/
   *   - profile.json
   * /PUB_KEY/version/current-version { version: '0' }
   *
   * I.e., same as previous but just following the `current-version.json` pattern.
   */
  async migrate754To0(datArchive: DatArchive): Promise<void> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6';
    const oldBaseDir = '/' + [root, 'version', '754'].join('/');
    const newBaseDir = '/' + [root, 'version', '0'].join('/');

    // 1- remove previous in-progress migrations
    try {
      // just in case a migration had already started and stopped in the middle
      await datArchive.rmdir(newBaseDir, {recursive: true});
    }
    catch (e) {
      // It's ok if it doesn't exist. TODO: check the error is actually a doesn't-exist error.
    }

    // 2- migrate
    await datArchive.copy(oldBaseDir, newBaseDir);
    await datArchive.unlink(newBaseDir + '/migration-done-754');

    await datArchive.writeFile(`/${root}/version/current-version.json`, '{"version":"0"}');
  }

  async check545(datArchive: DatArchive): Promise<boolean> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6';
    const baseDirComponents = [root, 'version', '545'];
    const tablesNames = ['salaries', 'trustees'];
    let base = '';
    for (const baseDirComponent of baseDirComponents) {
      base = base + '/' + baseDirComponent;
      if (!await UtilService.directoryExists(datArchive, base))
        return false;
    }
    for (const tableName of tablesNames)
      if (!await UtilService.directoryExists(datArchive, base + '/' + tableName))
        return false;
    return true;
  }

  async check752(datArchive: DatArchive): Promise<boolean> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6';
    const baseDirComponents = [root, 'version', '752'];
    const baseDir = '/' + baseDirComponents.join('/');
    const tablesNames = ['salaries', 'trustees'];
    let base = '';
    for (const baseDirComponent of baseDirComponents) {
      base = base + '/' + baseDirComponent;
      if (!await UtilService.directoryExists(datArchive, base))
        return false;
    }
    for (const tableName of tablesNames)
      if (!await UtilService.directoryExists(datArchive, base + '/' + tableName))
        return false;
    return await UtilService.fileExists(datArchive, baseDir + '/migration-done-752');
  }

  async check753(datArchive: DatArchive): Promise<boolean> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6';
    const baseDirComponents = [root, 'version', '753'];
    const baseDir = '/' + baseDirComponents.join('/');
    const tablesNames = ['salaries', 'trustees', 'profiles'];
    const profileRowUuid = 'profile';
    let base = '';
    for (const baseDirComponent of baseDirComponents) {
      base = base + '/' + baseDirComponent;
      if (!await UtilService.directoryExists(datArchive, base))
        return false;
    }
    for (const tableName of tablesNames)
      if (!await UtilService.directoryExists(datArchive, base + '/' + tableName))
        return false;
    if (!await UtilService.fileExists(datArchive, baseDir + '/profiles/' + profileRowUuid + '.json'))
      return false;
    return await UtilService.fileExists(datArchive, baseDir + '/migration-done-753');
  }

  async check754(datArchive: DatArchive): Promise<boolean> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6';
    const baseDirComponents = [root, 'version', '754'];
    const baseDir = '/' + baseDirComponents.join('/');
    const tablesNames = ['salaries', 'trustees', 'profiles'];
    const profileRowUuid = 'profile';
    let base = '';
    for (const baseDirComponent of baseDirComponents) {
      base = base + '/' + baseDirComponent;
      if (!await UtilService.directoryExists(datArchive, base))
        return false;
    }
    for (const tableName of tablesNames)
      if (!await UtilService.directoryExists(datArchive, base + '/' + tableName))
        return false;
    if (!await UtilService.fileExists(datArchive, baseDir + '/profiles/' + profileRowUuid + '.json'))
      return false;
    return await UtilService.fileExists(datArchive, baseDir + '/migration-done-754');
  }

  async check0(datArchive: DatArchive): Promise<boolean> {
    const root = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6';
    const baseDirComponents = [root, 'version', '0'];
    const baseDir = '/' + baseDirComponents.join('/');
    const baseDirUpToVersion = '/' + [root, 'version'].join('/');
    const tablesNames = ['salaries', 'trustees', 'profiles'];
    const profileRowUuid = 'profile';
    let base = '';
    for (const baseDirComponent of baseDirComponents) {
      base = base + '/' + baseDirComponent;
      if (!await UtilService.directoryExists(datArchive, base))
        return false;
    }
    for (const tableName of tablesNames)
      if (!await UtilService.directoryExists(datArchive, base + '/' + tableName))
        return false;
    if (!await UtilService.fileExists(datArchive, baseDir + '/profiles/' + profileRowUuid + '.json'))
      return false;
    if (!(await UtilService.fileExists(datArchive, baseDirUpToVersion + '/current-version.json')))
      return false;
    // Probably, needn't try-catch. But anyway.
    try {
      const currentVersionJson = JSON.parse(await datArchive.readFile(`/${baseDirUpToVersion}/current-version.json`)) as { version: string };
      return currentVersionJson.version === '0';
    }
    catch (e) {
      return false;
    }
  }
}
