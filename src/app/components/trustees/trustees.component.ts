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
      const trusteesOrFailures = await this.dbService.readAllRows<Trustee>(this.profileDatArchive, 'trustees', decodeTrustee)

      let atLeastOneFailed = false
      for (const ret of trusteesOrFailures) {
        if (ret.status === "succeeded") {
          const trusteeObject: TrusteeEntry = { dbRow: ret.row, removing: false, displayNameState: { kind: "loading"} } // making it like that to use closures with mutability. Yuck!

          this.trustees.push(trusteeObject)
          this.progressBarService.pushLoading()
          DatArchive.load(ret.row.dbRowData.datUrl)
            .then(trusteeArchive => this.dbService.readRow<Profile>(trusteeArchive, 'profiles', this.dbService.PROFILE_ROW_UUID, decodeProfile))
            .then(profileRow => {
              trusteeObject.displayNameState = { kind: 'loaded', displayName: profileRow.dbRowData.displayName }
              this.progressBarService.popLoading()
            })
            .catch(e => {
              trusteeObject.displayNameState = { kind: 'errored', err: e }
              this.progressBarService.popLoading()
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
