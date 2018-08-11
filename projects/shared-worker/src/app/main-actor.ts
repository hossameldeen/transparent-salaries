import { Actor } from './actor-model';
import { IncomingMessage } from 'worker-message'; // TODO: You need to rebuild everytime you make a change in worke-message
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

class MainActor implements Actor {
  private state: State;

  constructor() {
    this.state = new ProfileNotSelected();  // TODO. check localforage first. Probably, in a preStart()
  }

  receive(msg: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
