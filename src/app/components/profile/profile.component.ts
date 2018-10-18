import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DBService} from 'src/app/services/db.service';
import {ProgressBarService} from 'src/app/services/progress-bar.service';
import {MatSnackBar} from '@angular/material';
import {Trustee} from 'src/app/models/trustee.model';
import {Profile} from 'src/app/models/profile.model';
import {ProfileSelected, ProfileService, ProfileStateKind} from 'src/app/services/profile.service';
import {Subscription} from 'rxjs';
import {UtilService} from 'src/app/services/util.service';
import {DBRow} from 'src/app/models/db-row.model';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit, OnDestroy {
  ProfileStateKind = ProfileStateKind;

  @Input() profileDatArchive: DatArchive;
  displayName: string;
  isOwner: boolean;
  alreadyAFriend: boolean;
  stateSubjectSubscription: Subscription;

  trusts: DatArchive[];

  constructor(
    readonly sanitizer: DomSanitizer,
    readonly profileService: ProfileService,
    private readonly dbService: DBService,
    private readonly progressBarService: ProgressBarService,
    private readonly snackBar: MatSnackBar,
    private readonly utilService: UtilService
  ) {
  }

  ngOnInit() {
    this.updateIsOwner()
    this.stateSubjectSubscription = this.profileService.stateSubject.subscribe(() => this.updateIsOwner())

    this.dbService.readRow<Profile>(this.profileDatArchive, 'profiles', this.dbService.PROFILE_ROW_UUID)
      .then(profileRow => this.displayName = profileRow.dbRowData.displayName)

    this.dbService.getRowsUuids(this.profileDatArchive, 'trustees').then(rowsUuids => {
      const readRowsPromises = rowsUuids.map(rowUuid => this.dbService.readRow<Trustee>(this.profileDatArchive, 'trustees', rowUuid))
      // thanks to https://stackoverflow.com/a/31424853/6690391
      const readRowsPromisesCaught = readRowsPromises.map(p => p.then(v => ({ vOrE: v, status: "resolved" }), e => ({ vOrE: e, status: "rejected" })))
      return Promise.all(readRowsPromisesCaught)
    })
      .then(rets => {
        const succeeded = rets.filter(ret => ret.status === 'resolved').map(ret => ret.vOrE)
        this.trusts = succeeded.map(trusteeDBRow => new DatArchive(trusteeDBRow.dbRowData.datUrl))
        this.progressBarService.popLoading()
        if (rets.findIndex(ret => ret.status === 'reject') !== -1)
          this.snackBar.open("Couldn't retrieve some trustees from the profile. That's all I know :(", "Dismiss")
      })
      .catch(() => {
        this.progressBarService.popLoading()
        this.snackBar.open("Couldn't retrieve trustees from the profile. That's all I know :(", "Dismiss")
      })

    if (this.profileService.stateSubject.value.kind === ProfileStateKind.ProfileSelected)
      this.dbService.getRowsUuids(this.profileService.stateSubject.value.datArchive, 'trustees').then(rowsUuids => {
        switch(this.profileService.stateSubject.value.kind) {
          case ProfileStateKind.ProfileNotSelected:
            // TODO: I have no idea why I need to add this type assertion
            return <Promise<Array<{ vOrE: DBRow<Trustee>, status: string; } | { vOrE: any, status: string; }>>>Promise.resolve([])
          case ProfileStateKind.ProfileSelected:
            const readRowsPromises = rowsUuids.map(rowUuid => this.dbService.readRow<Trustee>((<ProfileSelected>this.profileService.stateSubject.value).datArchive, 'trustees', rowUuid))
            // thanks to https://stackoverflow.com/a/31424853/6690391
            const readRowsPromisesCaught = readRowsPromises.map(p => p.then(v => ({ vOrE: v, status: "resolved" }), e => ({ vOrE: e, status: "rejected" })))
            return Promise.all(readRowsPromisesCaught)
          default: return UtilService.assertNever(this.profileService.stateSubject.value)
        }
      })
        .then(rets => {
          const succeeded = rets.filter(ret => ret.status === 'resolved').map(ret => ret.vOrE)
          const trusts = succeeded.map(trusteeDBRow => new DatArchive(trusteeDBRow.dbRowData.datUrl))
          // TODO: optimize this with indexing, of course.
          this.alreadyAFriend =
            this.profileService.stateSubject.value.kind === this.ProfileStateKind.ProfileSelected &&
            trusts.map(datArchive => datArchive.url).includes(this.profileDatArchive.url)
          this.progressBarService.popLoading()
          if (rets.findIndex(ret => ret.status === 'reject') !== -1)
            this.snackBar.open("Couldn't retrieve some trustees from the profile. That's all I know :(", "Dismiss")
        })
        .catch(() => {
          this.progressBarService.popLoading()
          this.snackBar.open("Couldn't retrieve trustees from the profile. That's all I know :(", "Dismiss")
        })
  }

  private updateIsOwner() {
    this.isOwner = (this.profileService.stateSubject.value.kind === ProfileStateKind.ProfileSelected && this.profileDatArchive.url === this.profileService.stateSubject.value.datArchive.url)
  }

  async addTrustee() {
    if (this.profileService.stateSubject.value.kind === ProfileStateKind.ProfileSelected) {
      await this.dbService.putRow<Trustee>(this.profileService.stateSubject.value.datArchive, 'trustees', new Trustee(this.profileDatArchive.url))
      this.alreadyAFriend = true
    }
    else
      this.snackBar.open("You're adding a trustee but you're not logged in. That's a bug. Please, contact the developers.", "Dismiss")
  }

  ngOnDestroy() {
    this.stateSubjectSubscription.unsubscribe()
  }
}
