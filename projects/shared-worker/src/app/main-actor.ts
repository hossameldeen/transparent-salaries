/**
 * Note: Under the assumption shared-worker is the only one manipulating the dat archive & local storage,
 * I'm free to keep some of the state in memory & to retrieve others from the filesystem directly.
 */

// TODO: Move the assertNever into a library or something
import { Actor, assertNever } from './actor-model';
import { IncomingMessage, IncomingMessageKind, OutgoingMessage, OutgoingMessageKind } from 'worker-message'; // TODO: You need to rebuild everytime you make a change in worker-message
import * as localForage from 'localforage';

//======================================================================================================================
// State

type State = ProfileNotSelected | ProfileSelected

enum ProfileStateKind { ProfileNotSelected, ProfileSelected }

class ProfileNotSelected {
  constructor(
    readonly kind: ProfileStateKind.ProfileNotSelected = ProfileStateKind.ProfileNotSelected
  ) { }
}

class ProfileSelected {
  constructor(
    readonly datArchive: DatArchive,
    readonly kind: ProfileStateKind.ProfileSelected = ProfileStateKind.ProfileSelected
  ) { }
}

//======================================================================================================================
// Main Actor

export class MainActor implements Actor {
  private state: State;

  constructor() {
  }

  async preStart(): Promise<void> {
    const profileUrl = await localForage.getItem<string>('profileUrl')
    if (profileUrl)
      this.state = { kind: ProfileStateKind.ProfileSelected, datArchive: new DatArchive(profileUrl)}
    else
      this.state = { kind: ProfileStateKind.ProfileNotSelected }
  }

  async receive(msg: IncomingMessage): Promise<OutgoingMessage> {
    const msgAsIncomingMessage: IncomingMessage = msg;
    switch(msgAsIncomingMessage.kind) {
      case IncomingMessageKind.GetSelectedProfile:
        return { kind: OutgoingMessageKind.GetSelectedProfileReply, archiveUrl: this.getSelectedProfile() }
      default:
        throw new Error("Not implemented yet.")
    }
  }

  getSelectedProfile(): string | null {
    switch(this.state.kind) {
      case ProfileStateKind.ProfileSelected:
        return this.state.datArchive.url;
      case ProfileStateKind.ProfileNotSelected:
        return null;
      default: return assertNever(this.state)
    }
  }
}
