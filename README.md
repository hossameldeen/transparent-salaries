# Salary Transparency

A Beaker-browser website for sharing salaries.

**Still work in progress, including the README**

## Development setup

### Prerequisites

- Install [Yarn](https://yarnpkg.com).
- Install [Beaker Browser](https://beakerbrowser.com/).
- Create an empty Beaker-browser website.
- Set its local directory to `<some-path>`.
- In its `dat.json`, add `"fallback_page": "/index.html"`

### Auto-reload

You can have auto build & reload on changes. However, it'll keep whole files between each change, so it'll take a lot of disk space. So, use in a throw-away Beaker-browser website.

- In the project root, run `yarn install`.
- In the project root, run `yarn run watch --output-path=<some-path>`.
- In Beaker Browser, from the menu: open `Library`. Go to the website you've created. Open its url from the topright.
- From the 3 dots in the url bar, `Toggle live reloading`.

Note#1: This doesn't delete unused old output files. But it's okay, that's good enough for now since it doesn't affect the behaviour.  
Note#2: This doesn't use production mode.

### Deploy

**TODO: Not done yet!!! Currently only dev mode is supported.**

- In the project root, run `yarn install`.
- In the project root, run `yarn run build --prod`. **Don't forget the `--prod`!**
- Manually copy the build artifacts under `dist/salary-transparency` to `<some-path>`.
- In Beaker Browser, from the menu: open `Library`. Go to the website you've created. Open its url from the topright.

### IDE

You can use any IDE, but I'm using Visual Studio Code. I'm also using [Local History extension](https://marketplace.visualstudio.com/items?itemName=xyz.local-history).

Update: I'm using WebStorm. Not perfect, but much _much_ better, and I'm happier.

## Docs

You're, obviously, using [Angular Framework](https://angular.io/). You're also using [Angular Material](https://material.angular.io) and [Angular Flex-layout](https://github.com/angular/flex-layout/wiki/Declarative-API-Overview).

- The code structure is pretty much by-file-type. For now, one module, with `components`, `models`, `services`, and `typings` directories.

- Components are either meant as generic components or top-level page/routing components. The latter should only be used in `routes`. Their name end with `-page` and `Page`, and its `selector` could have more words as a reminder it shouldn't be used that way.

- Only page components should access the url.

## TODOs

There're TODOs in the code. Beside them, there're TODOs here.

Next free TODO number: 20

### Not Resolved Yet

1) Log errors caught & suggest the user to check the Console if they are a programmer.

2) On login, try to write a random string in a file & read it to see if the user really has chosen an archive which they own.

3) Automate the step of adding `"fallback_page": "/index.html"` to `dat.json`.

4) Make a `Home` button in the toolbar.

5) Persist & read `Trustees`.

6) Make `Add Trustee` button on profiles not owned by the user.

7) Remove add/edit/delete buttons from profiles not owner by the user.

9) Shared state & concurrency in one tab.  
An example problem: A user opens a profile-1 -> SPA/Angular-navigates to profile-2 -> profile-2 loading succeeds -> profile-1 loading fails -> a snack shown "Loading profile failed".  
The problem is that profile-1 had promises that weren't cancelled in `onDestory()`. Had the effect of these promises been only changing the state of the component, there'd have been no problem (or a slight problem). But the problem that is it changes a _shared state_ which is the snackbar here in this case.  
There're other sources of shared state: `DatArchive.createArchive`/`selectArchive`, most prominently.  
Ummm ... as a quick solution: could make a wrapper around `snackBar` that takes a boolean `show` and doesn't show the snack bar if false. And have a boolean `isAlive` in each component that's set to `false` in `onDestroy()` and sent to `snackBar`. Same for DatArchive & any other APIs.
But very not clean & no guarantee it'll solve all our problems. It's just a temporary hack. The _right_ solution is to make the component aware of its lifecycle & aware of that it may receive an _onDestroy()_ signal while some promise is pending. But this basically means getting rid of `async/await`, and, probably as an advantage, preferably have a single `update` function like Elm or the actor model's `receive`.

10) Probably need something like `ngrx` to handle state consistency between the components. For example, what if 2 components ask about the login status, but the two receive 2 different answers due to change in time?

11) Enable TSLint from Settings -> TSLint -> Enable

12) Perhaps allow using an archive that has other data as a Transparent-Salaries archive. Perhaps just show a warning?  
**Update:** Currently, I only care about the files in the public-key (root) folder. Probably should show a warning if detected the archive has files outside of this root folder.

13) Handle reading from profiles that haven't upgraded yet. Will probably handle only when I go live isA & it's worth it. Also, handle making the new structure compatible with the old one or showing a warning somehow to an old reader of a new archive.

14) Perhaps factor out the migration code in DBService if you're gonna stick with the directory & version thing.

15) Make a `SnackBarService` that can deal with multiple messages, probably using `afterDismissed`. Check [this](https://stackoverflow.com/questions/47409869/angular-2-4-material-design-snackbars-multiple-message-in-sequence).

16) To avoid concurrency errors of async update & then retrieval, probably it'd be a good idea to separate updating & reading. Perhaps you should `watch` on the state directly & not trigger re-retrieval on updates.

17) Consider running stuff like retrieving salaries & trustees and migrating db, outside of Angular Zone. Check this: https://blog.angularindepth.com/do-you-still-think-that-ngzone-zone-js-is-required-for-change-detection-in-angular-16f7a575afef

18) Perhaps use GitLab for issues instead of this TODO list (& trello board). It has free private repos!

19) Solve the `ExpressionChangedAfterChecked` error. Basically, you have 2 possible solutions:  
Either, just wrap the change in a `BehaviorSubject` to add asynchronity in it.  
Or, review your application to make sure it follows the unidirectional-flow stuff linked in [this article](https://blog.angularindepth.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4) and see how to re-structure it to make sure it doesn't break it.  
Either way, definitely read the linked article.

### Resolved

8) Currently, `shared-worker` is compiled & pasted into assets by hand.  
Also, to use Angular's compilation/optimization goodness, I may be adding unnecessary stuff.  
**A**: I've moved away from this idea.
