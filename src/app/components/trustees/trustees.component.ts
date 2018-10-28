import {Component, Input, OnInit} from '@angular/core';
import { Trustee} from 'src/app/models/trustee.model';
import { DBService } from 'src/app/services/db.service';
import { ProgressBarService } from 'src/app/services/progress-bar.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-trustees',
  templateUrl: './trustees.component.html',
  styleUrls: ['./trustees.component.css']
})
export class TrusteesComponent implements OnInit {

  @Input() profileDatArchive: DatArchive;

  trusts: Trustee[];

  constructor(
    private readonly dbService: DBService,
    private readonly progressBarService: ProgressBarService,
    private readonly snackBar: MatSnackBar
  ) {
    this.trusts = []
  }

  async ngOnInit() {
    // Note: waiting wouldn't really make a difference.
    await this.retrieveTrustees()
  }

  private async retrieveTrustees(): Promise<void> {
    this.progressBarService.pushLoading()

    try {
      const trusteesOrFailures = await this.dbService.readAllRows<Trustee>(this.profileDatArchive, 'trustees')

      let atLeastOneFailed = false
      for (const ret of trusteesOrFailures) {
        if (ret.status === "succeeded") {
          this.trusts.push(ret.row.dbRowData)
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

}
