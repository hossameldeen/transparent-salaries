import { Injectable } from '@angular/core';
import { ProgressBarService } from './progress-bar.service';
import { MatSnackBar } from '@angular/material';
import { UtilService } from './util.service';
import { DBService } from './db.service';
import { WMResponse, WMResponseKind, OutgoingMessage, IncomingMessage, IncomingMessageKind, OutgoingMessageKind, createWmRequest } from 'worker-message'; // IMPORTANT TODO: move the below imports above & uncomment the below

// TODO: Move them somewhere else
type ResolveFunction<T> = (value?: T | PromiseLike<T>) => void
type RejectFunction = (reason?: any) => void

/**
 * Made this service because there's common logic between the toolbar in app-component & home-component in home-page-component
 * 
 * The extraction worked because the common logic uses services. I might would've needed to make a component or something. 
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  // state: ProfileState; // old code

  readonly worker: SharedWorker.SharedWorker;
  readonly outstanding: Map<string, { resolve: ResolveFunction<OutgoingMessage>, reject: RejectFunction }> = new Map();

  constructor(
    private readonly dbService: DBService,
    private readonly progressBarService: ProgressBarService,
    private readonly snackBar: MatSnackBar,
    private readonly utilService: UtilService
  ) {
    this.worker = new SharedWorker('assets/shared-worker/main.js')
    this.worker.port.onmessage = msgEvt => this.handleWorkerMessage(msgEvt) // TODO: onmessage has `this` in its definition. Review & make sure this doesn't mess with profileService's this

    // const profileUrl = localStorage.getItem('profileUrl')
    // if (profileUrl)
    //   this.state = { kind: ProfileStateKind.ProfileSelected, datArchive: new DatArchive(profileUrl)}
    // else
    //   this.state = { kind: ProfileStateKind.ProfileNotSelected }
  }

  handleWorkerMessage(msgEvt: MessageEvent) {
    const wmResponse = msgEvt.data as WMResponse  // TODO: Should I make a check here or just let it fail later on?
    
    const handler = this.outstanding.get(wmResponse.requestUuid.uuid)
    if (handler === undefined)
      throw new Error(`Didn't find element with requestId=${wmResponse.requestUuid.uuid}`)
    
    this.outstanding.delete(wmResponse.requestUuid.uuid)
    
    // Now that we know the message is intended for this handler, we'll reject if anything wrong happens
    try {
      switch(wmResponse.kind) {
        case WMResponseKind.Response:
            handler.resolve(wmResponse.payload)
          break;
        case WMResponseKind.InternalError:
          handler.reject(wmResponse.err)
        break;
        default: this.utilService.assertNever(wmResponse)
      }
    }
    catch(e) {
      // Should never come here? .. For now, added only because we're type-asserting in the beginning
      handler.reject(e)
    }
  }

  sendRequest(msg: IncomingMessage): Promise<OutgoingMessage> {
    return new Promise((resolve, reject) => {
      const req = createWmRequest(msg)

      if (this.outstanding.has(req.requestUuid.uuid))
        throw new Error("Duplicate request id generated!?")
      
      this.outstanding.set(req.requestUuid.uuid, { resolve: resolve, reject: reject })

      this.worker.port.postMessage(req)
    })
  }

  async getSelectedProfile(): Promise<ProfileState> {
    const resp = await this.sendRequest({ kind: IncomingMessageKind.GetSelectedProfile })
    if (resp.kind === OutgoingMessageKind.GetSelectedProfileReply)
      return resp.archiveUrl === null ? new ProfileNotSelected() : new ProfileSelected(new DatArchive(resp.archiveUrl))
    throw new Error("SharedWorker's response to GetSelectedProfile wasn't of kind GetSelectedProfileReply")
  }

  async createProfile() {
    throw new Error("createProfile not implemented yet!!")
    // const profile = await this.utilService.datArchiveCreate({
    //   title: `Salary-Transparency Profile: <Replace with profile name>`,
    //   buttonLabel: 'Select profile',
    //   filters: {
    //     isOwner: true
    //   }
    // })

    // if (profile === null)
    //   return
    
    // try {
    //   this.progressBarService.pushLoading()
    //   await this.dbService.initDB(profile)
    //   this.state = { kind: ProfileStateKind.ProfileSelected, datArchive: profile }
    //   localStorage.setItem('profileUrl', profile.url)
    //   location.reload()
    // }
    // catch (e) {
    //   this.snackBar.open("Couldn't initialize your profile and that's all I know :(", "Dismiss")
    // }
    // this.progressBarService.popLoading()
  }

  async selectProfile() {
    throw new Error("selectProfile not implemented yet!!")
    // const profile = await this.utilService.datArchiveSelectArchive({
    //   title: 'Select an archive to use as your user profile',
    //   buttonLabel: 'Select profile',
    //   filters: {
    //     isOwner: true
    //   }
    // })

    // if (profile === null)
    //   return

    // this.progressBarService.pushLoading()

    // if (await this.dbService.isDBInitialized(profile)) {
    //   this.state = { kind: ProfileStateKind.ProfileSelected, datArchive: profile }
    //   localStorage.setItem('profileUrl', profile.url)
    //   location.reload()
    //   this.progressBarService.popLoading()
    //   return
    // }

    // if (await this.utilService.isNewArchive(profile)) {
    //   await this.dbService.initDB(profile)
    //   this.state = { kind: ProfileStateKind.ProfileSelected, datArchive: profile }
    //   localStorage.setItem('profileUrl', profile.url)
    //   location.reload()
    //   this.progressBarService.popLoading()
    //   return
    // }

    // this.snackBar.open(`The archive you've selected doesn't seem to be a valid Transparent-Salaries profile.
    //   Are you sure you've used it as a profile before?
    //   If you haven't created a profile, you can create a new one!
    // `, "Dismiss")

    // this.progressBarService.popLoading()
  }

  logout() {
    throw new Error("logout not implemented yet!!")
    // this.state = { kind: ProfileStateKind.ProfileNotSelected }
    // localStorage.removeItem('profileUrl')
    // location.reload()
  }
}

export type ProfileState = ProfileNotSelected | ProfileSelected

export enum ProfileStateKind { ProfileNotSelected, ProfileSelected }

export class ProfileNotSelected {
  constructor(
    readonly kind: ProfileStateKind.ProfileNotSelected = ProfileStateKind.ProfileNotSelected
  ) { }
}

export class ProfileSelected {
  constructor(
    readonly datArchive: DatArchive,
    readonly kind: ProfileStateKind.ProfileSelected = ProfileStateKind.ProfileSelected
  ) { }
}
