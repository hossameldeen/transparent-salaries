import {Injectable, NgZone} from '@angular/core';
import {DBRow} from 'src/app/models/db-row.model';
import {v4 as uuid} from 'uuid';
import {MigrationService} from './migration.service';

/**
 * A wrapper around a profile dat archive that is used as a JSON database.
 *
 * Anything written in the archive is written under '07d5ccd35fbdd7c1d2e936f152cb858fa74df824cbf613c7b008e3587a4fa138', the pub-key of the
 * application to make sure no conflicts happen with other applications.
 *
 * All current design files are under `<pub_key>/version/`.
 *
 * We can describe any [TODO: still writing]
 *
 * If a dat-archive has a different BREAKING version, we simply can't deal with it. We could add a layer that does a mapping in the future
 * if such case emerges, isA.
 *
 * TODO: enhance description
 */
@Injectable({
  providedIn: 'root'
})
export class DBService {

  readonly PROFILE_ROW_UUID = 'profile'

  constructor(
    private readonly migrationService: MigrationService,
    private readonly ngZone: NgZone
  ) { }

  /**
   * Mainly used for adding a row. There's a tiny, _tiny_ probability of overriding a row due to uuid collision.
   *
   * Update: Will make the name: `zzzzz-zzzz...-timestampbase36-uuid`. Reasons:
   * (1) I want to sort (desc) files by their creation time. See: https://github.com/beakerbrowser/beaker/issues/959
   * (2) To be backward compatible, I'll just prepend `zzzz-zzzz...` to make files with timestamp come after files without.
   * (3) Will append uuid just in case there's a collision in timestamp.
   */
  async putRow<T>(datArchive: DatArchive, tableName: string, jsonStringifiable: T, encode: (T) => string): Promise<DBRow<T>> {
    // That's the uuid format
    const prefix = `${'z'.repeat(8)}-${'z'.repeat(4)}-${'z'.repeat(4)}-${'z'.repeat(4)}-${'z'.repeat(12)}`
    const timestamp = (new Date()).getTime().toString(36).padStart(10, '0')
    const postfix = uuid()
    return await this.putRow2(datArchive, tableName, jsonStringifiable, `${prefix}-${timestamp}-${postfix}`, encode)
  }

  /**
   * Mainly used to updating an existing row. Wouldn't complain if given a non-existing uuid, though.
   * Update: Actually, currently, correctly, used in a case that creates a new row (or the static version below)
   */
  async putRow2<T>(datArchive: DatArchive, tableName: string, jsonStringifiable: T, uuid: string, encode: (T) => string): Promise<DBRow<T>> {
    const row = new DBRow(uuid, jsonStringifiable)
    await datArchive.writeFile(this.wp(tableName + "/" + row.uuid + ".json"), encode(row.dbRowData))
    return row
  }

  async readRow<T>(datArchive: DatArchive, tableName: string, uuid: string, decode: (string) => T): Promise<DBRow<T>> {
    return new DBRow<T>(uuid, decode(await datArchive.readFile(this.wp(tableName + "/" + uuid + ".json"))))
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

  async readAllRows<T>(datArchive: DatArchive, tableName: string, decode: (string) => T): Promise<Array<{ status: "succeeded", row: DBRow<T> } | { status: "failed", err: any }>> {
    const rowsUuids = await this.getRowsUuids(datArchive, tableName)
    const rowsPromises = rowsUuids.map(rowUuid => this.readRow<T>(datArchive, tableName, rowUuid, decode))
    // thanks to https://stackoverflow.com/a/31424853/6690391
    // Needed to add the type parameter to `then` because ts would just infer the type to be {status: string, ..} | {status: string, ..} instead of {status: "succeeded", ..} | ...
    const rowPromisesNeverFail = rowsPromises.map(p => p.then<{ status: "succeeded", row: DBRow<T> }, { status: "failed", err: any }>(row => ({ status: "succeeded", row: row }), err => ({ status: "failed", err: err })))
    return await Promise.all(rowPromisesNeverFail)
  }

  /**
   * Listen to changes on the rows of a table
   *
   * @param uuid If given, will listen only to changes on that rows. Otherwise, will listen changes of all rows
   *
   * @returns A function that will stop watching if you call it
   */
  async watch<T>(datArchive: DatArchive, tableName: string, cb: (path: string) => void, uuid?: string): Promise<() => void> {
    const evts = await datArchive.watch(this.migrationService.baseDir() + '/' + tableName + '/' + (uuid ? uuid : '*') + '.json')

    // For why I'm using `ngZone.run`, check this: https://stackoverflow.com/q/42971865/6690391
    // If there's a performance issue in the future, I could make each component run `detectChanges` on the callback of `watch` individually.
    // However, right now, app.component uses this and thus detectChanges will run for all components anyway. If you refactor and make toolbar
    // in a component by itself, then you could use detectChanges with a gain. That's according to time of writing.
    evts.addEventListener('invalidated', evt => datArchive.download((<any>evt).path))
    evts.addEventListener('changed', evt => this.ngZone.run(() => cb((<any>evt).path)))


    return () => evts.close()
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
    return this.migrationService.baseDir() + (path.startsWith("/") ? "" : "/") + path;
  }
}
