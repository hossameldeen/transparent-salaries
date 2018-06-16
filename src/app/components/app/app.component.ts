import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  state: State;
  StateKind = StateKind;

  constructor() {
    const profileUrl = localStorage.getItem('profileUrl')
    if (profileUrl)
      this.state = { kind: StateKind.ProfileSelected, datArchive: new DatArchive(profileUrl)}
    else
      this.state = { kind: StateKind.ProfileNotSelected }
  }

  async selectProfile() {
    try {
      const profile = await DatArchive.selectArchive({
        title: 'Select an archive to use as your user profile',
        buttonLabel: 'Select profile',
        filters: {
          isOwner: true
        }
      })
      this.state = { kind: StateKind.ProfileSelected, datArchive: profile }
      localStorage.setItem('profileUrl', profile.url)
    }
    catch (e) {
      // If user clicks 'Cancel', they go here. But can they go here due to other reasons?
    }
  }

  async createProfile() {
    try {
      const profile = await DatArchive.create({
        title: `Salary-Transparency Profile: <Replace this with a name you want to give to the profile>`,
        buttonLabel: 'Select profile',
        filters: {
          isOwner: true
        }
      })
      this.state = { kind: StateKind.ProfileSelected, datArchive: profile }
      localStorage.setItem('profileUrl', profile.url)
    }
    catch (e) {
      // If user clicks 'Cancel', they go here. But can they go here due to other reasons?
    }
  }

  logout() {
    this.state = { kind: StateKind.ProfileNotSelected }
    localStorage.removeItem('profileUrl')
  }
}

type State = ProfileNotSelected | ProfileSelected

enum StateKind { ProfileNotSelected, ProfileSelected }

class ProfileNotSelected {
  constructor(
    readonly kind: StateKind.ProfileNotSelected
  ) { }
}

class ProfileSelected {
  constructor(
    readonly kind: StateKind.ProfileSelected,
    readonly datArchive: DatArchive
  ) { }
}
