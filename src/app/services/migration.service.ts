import {Injectable} from '@angular/core';
import {Lock, LockerService} from './locker.service';
import {OldMigrationService} from './old-migration.service';

/**
 * Any class, other than `MigrationService` was written during the migration to some version and its name is postfixed with this
 * version somehow. The pattern is for newer classes to dependency-inject older classes and use their functions freely as helpers, but we
 * should never edit an old class/method.
 *
 * There're `oldMigrations` and `migrations` format. '0' is the version that links both of them.
 *
 * Also, `oldMigrations` used to be numbered according to their dat version. `migrations` will be numbered as an array index.
 *
 * The current format is, simply, to have a `current-version` file holding the version of the last done migration. This invariant should
 * always hold:
 *   - 'current-version' == x implies { 'x/' exists AND ('y/' exists implies y == x || y == x - 1) }
 * Using this invariant, we can optimize our idempotentCleanups to be O(1).
 * When we are at version x and migrating to x + 1, we first delete x - 1. Same thing holds for oldMigrations as well, except a version
 * wasn't +1 of its previous.
 */
@Injectable({
  providedIn: 'root'
})
export class MigrationService {

  private readonly migrations: Array<Migration>;

  private readonly PUB_KEY = '60c4a43ee4ce74eea9faf6c4a4b8de8b50da0b3322fb27f6bc5f76b633762ad6'
  private readonly VERSION = 'version';
  private readonly CURRENT_VERSION = 'current-version';

  private readonly currentVersion = 0;

  constructor(
    private readonly oldMigrationService: OldMigrationService,
    private readonly lockerService: LockerService//,
    // readonly migration1Service: Migration1Service // No migration till now using the new format, but this is an example of usage:
  ) {
    this.migrations = []
  }

  async migrateDB(datArchive: DatArchive): Promise<void> {
    // Will move it to 0
    if (!(await this.isNewFormat(datArchive))) {
      await this.oldMigrationService.migrateDB(datArchive)
      await this.oldMigrationService.idempotentCleanup(datArchive, '754')
    }

    // TODO: May actually take longer. Perhaps calculate it depending on the number of rows?
    const lockSecret = await this.lockerService.acquireLock(Lock.MigrateDB, 5 * 60 * 1000)
    try {
      // A json just in case we want to change something in the future
      const currentVersionJson = JSON.parse(await datArchive.readFile(`/${this.PUB_KEY}/${this.VERSION}/${this.CURRENT_VERSION}.json`)) as { version: string }
      const currentVersion = parseInt(currentVersionJson.version)

      if (currentVersion === 0)
        await this.oldMigrationService.idempotentCleanup(datArchive, '754')
      if (currentVersion - 1 >= 0)
        await this.oldMigrationService.idempotentCleanup(datArchive, (currentVersion - 1).toString())

      for (let i = currentVersion + 1; i < this.migrations.length; ++i) {
        await this.migrations[i].migrate(datArchive)
        await datArchive.writeFile(`/${this.PUB_KEY}/${this.VERSION}/${this.CURRENT_VERSION}.json`, JSON.stringify({ version: i.toString() }))
        await this.idempotentCleanup(datArchive, i - 1)
      }
    }
    finally {
      this.lockerService.releaseLock(Lock.MigrateDB, lockSecret)
    }
  }

  baseDir() {
    return `/${this.PUB_KEY}/${this.VERSION}/${this.currentVersion}`
  }

  private async isNewFormat(datArchive: DatArchive): Promise<boolean> {
    try {
      return (await datArchive.stat(`/${this.PUB_KEY}/${this.VERSION}/${this.CURRENT_VERSION}.json`)).isFile()
    }
    catch (e) {
      return false
    }
  }

  private async idempotentCleanup(datArchive: DatArchive, version: number): Promise<void> {
    await this.oldMigrationService.idempotentCleanup(datArchive, version.toString())
  }
}

interface Migration {
  migrate: (datArchive: DatArchive) => Promise<void>
}
