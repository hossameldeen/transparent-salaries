import { Component, Input, OnInit } from '@angular/core';
import { Trustee, encode as encodeTrustee, decode as decodeTrustee } from 'src/app/models/trustee.model';
import { DBService } from 'src/app/services/db.service';
import { ProgressBarService } from 'src/app/services/progress-bar.service';
import { MatSnackBar } from '@angular/material';
import { Profile, encode as encodeProfile, decode as decodeProfile } from 'src/app/models/profile.model';
import { UtilService } from 'src/app/services/util.service';
import { DBRow } from 'src/app/models/db-row.model';

@Component({
  selector: 'app-trustees',
  templateUrl: './trustees.component.html',
  styleUrls: ['./trustees.component.css']
})
export class TrusteesComponent implements OnInit {

  @Input() profileDatArchive: DatArchive;
  @Input() isOwner: boolean;

  trustees: Array<TrusteeEntry>;
  persistingNewTrustee: boolean;

  constructor(
    readonly utilService: UtilService,
    private readonly dbService: DBService,
    private readonly progressBarService: ProgressBarService,
    private readonly snackBar: MatSnackBar
  ) {
    this.trustees = []
  }

  async ngOnInit() {
    // Note: waiting wouldn't really make a difference.
    await this.retrieveTrustees()
  }

  private async retrieveTrustees(): Promise<void> {
    this.progressBarService.pushLoading()

    try {
      const trusteesOrFailures = (await this.dbService.readAllRows<Trustee>(this.profileDatArchive, 'trustees', decodeTrustee)).entries

      let atLeastOneFailed = false
      for (const ret of trusteesOrFailures) {
        if (ret.status === "succeeded") {
          const trusteeObject: TrusteeEntry = { dbRow: ret.row, removing: false, displayNameState: { kind: "loading"} } // making it like that to use closures with mutability. Yuck!

          this.trustees.push(trusteeObject)
          DatArchive.load(ret.row.dbRowData.datUrl)
            .then(trusteeArchive => this.dbService.readRow<Profile>(trusteeArchive, 'profiles', this.dbService.PROFILE_ROW_UUID, decodeProfile))
            .then(profileRow => {
              trusteeObject.displayNameState = { kind: 'loaded', displayName: profileRow.dbRowData.displayName }
            })
            .catch(e => {
              trusteeObject.displayNameState = { kind: 'errored', err: e }
            })
        }
        else {
          atLeastOneFailed = true
        }
      }
      if (atLeastOneFailed)
        this.snackBar.open("Couldn't retrieve some trustees from the profile. That's all I know :(", "Dismiss")
    }
    catch(e) {
      this.snackBar.open("Couldn't retrieve trustees from the profile. That's all I know :(", "Dismiss")
    }
    finally {
      this.progressBarService.popLoading()
    }
  }

  async addNewTrustee(datUrl: string) {
    if (datUrl.startsWith('dat://')) {
      datUrl = datUrl.substring(3 + 1 + 2)
      if (datUrl.length < 64) {
        this.snackBar.open(`The url you wrote is too short. It should start with "dat://" (without the quotes) followed by 64 characters. Perhaps you didn't paste all characters?`, "Dismiss")
        return
      }
      datUrl = `dat://${datUrl.substring(0, 64)}`
    }
    else if (datUrl.length === 64) {
      datUrl = `dat://${datUrl}`
    }
    else {
      const profileIndex = datUrl.indexOf('profile/')
      if (profileIndex === -1) {
        this.snackBar.open('Failed to add trustee. Your input should start with "dat://" (without the quotes) followed by 64 characters.', "Dismiss")
        return
      }
      datUrl = datUrl.substring(profileIndex + 7 + 1)
      if (datUrl.length < 64) {
        this.snackBar.open(`The url you wrote is too short. The profile identifier (the part after dat:// or profile/) must be 64 characters. Perhaps you didn't paste all characters?`, "Dismiss")
        return
      }
      datUrl = `dat://${datUrl.substring(0, 64)}`
    }

    try {
      this.progressBarService.pushLoading()
      this.persistingNewTrustee = true

      const trusteeDBRow = await this.dbService.putRow<Trustee>(this.profileDatArchive, 'trustees', new Trustee(datUrl), encodeTrustee)

      const trusteeObject: TrusteeEntry = { dbRow: trusteeDBRow, removing: false, displayNameState: { kind: "loading"} } // making it like that to use closures with mutability. Yuck!

      this.trustees.unshift(trusteeObject)
      DatArchive.load(datUrl)
        .then(trusteeArchive => this.dbService.readRow<Profile>(trusteeArchive, 'profiles', this.dbService.PROFILE_ROW_UUID, decodeProfile))
        .then(profileRow => {
          trusteeObject.displayNameState = { kind: 'loaded', displayName: profileRow.dbRowData.displayName }
        })
        .catch(e => {
          trusteeObject.displayNameState = { kind: 'errored', err: e }
        })
    }
    catch (e) {
      this.snackBar.open("Couldn't add new trustee for some reason :(", "Dismiss")
    }
    finally {
      this.persistingNewTrustee = false
      this.progressBarService.popLoading()
    }
  }

  /**
   * The index is just for optimization. In most cases, I shouldn't need to loop over the array.
   */
  async removeTrustee(trusteeEntry: TrusteeEntry, trusteeEntryIndex: number) {
    try {
      this.progressBarService.pushLoading()
      trusteeEntry.removing = true

      await this.dbService.deleteRow<Trustee>(this.profileDatArchive, 'trustees', trusteeEntry.dbRow.uuid)

      if (trusteeEntryIndex < this.trustees.length && this.trustees[trusteeEntryIndex].dbRow.uuid !== trusteeEntry.dbRow.uuid)
        trusteeEntryIndex = this.trustees.findIndex(tdbr => tdbr.dbRow.uuid === trusteeEntry.dbRow.uuid)

      // TODO: Add a check that trusteeEntryIndex !== -1
      this.trustees.splice(trusteeEntryIndex, 1)
    }
    catch (e) {
      this.snackBar.open("Couldn't untrust the trustee for some reason :(", "Dismiss")
      trusteeEntry.removing = false
    }
    finally {
      this.progressBarService.popLoading()
    }
  }
}

type TrusteeEntry = {
  dbRow: DBRow<Trustee>,
  removing: boolean,
  displayNameState: { kind: "loading" } | { kind: "loaded", displayName: string } | { kind: "errored", err: any }
}
