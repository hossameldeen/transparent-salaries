# Documentation

There isn't much documentation, but here's what I'd written for myself anyway.

## Table of contents

- [Process](#processes)
  - [Development setup](#development-setup)
  - [Auto-reload](#auto-reload)
  - [Deploy](#deploy)
    - [Prerequisites if deploying under a new dat](#preqrequisites-if-deploying-under-a-new-dat)
    - [Steps](#steps)
    - [Checklist](#checklist)
  - [Check licenses](#check-licenses)
- [Code structure](#code-structure)

## Processes

### Development setup

- Install [Yarn](https://yarnpkg.com).
- Install [Beaker Browser](https://beakerbrowser.com/).
- Install [WebStorm](https://www.jetbrains.com/webstorm/). Yup, costs money. You could [VSCode](https://code.visualstudio.com/) if you want. I'm just using basic [Angular](https://angular.io/) stuff.
- In WebStorm: `Checkout from Version Control` the project (or `Open` if you've already cloned it).
- In WebStorm: View menu -> Tool Windows -> mark Version Control.
- In WebStorm: Disable TSLint (TODO: re-enable it one day isA).
- Run `yarn install`.

### Auto-reload

- In the project root, run `yarn run start`.
- In Beaker Browser, open `localhost:4200`

Note: I used to `yarn run build --watch --delete-output-path=false --output-path=<some-beaker-project-path>` because I'd thought `DatArchive` wasn't available to http pages.

### Deploy

#### Preqrequisites if deploying under a new dat

**Project setup:**
- Create a new project.
- Make sure `dat.json`'s main content:
```
{
  "title": "Transparent Salaries",
  "fallback_page": "/index.html"
}
```
**Public-key migration:**
- Let public key of the newly-created dat be `pub_key`.
- Let `MigrationService.PUB_KEY` be `old_pub_key`.
- In WebStorm, Ctrl+Shift+R `old_pub_key` -> `pub_key`. (not the words `pub_key`, I mean the values).
- Run ``grep -ir --exclude-dir=node_modules `old_pub_key` `` to make sure there're no missing instances for any reason. (Credit: [SO answer](https://stackoverflow.com/a/49251979/6690391)).

#### Steps

- Go through the checklist below.
- In the project root, run `yarn install`.
- In the project root, run `yarn run build --prod`. **Don't forget the `--prod`!**
- Make sure preview mode is on on your website.
- Delete all old files except `dat.json` and `dat.ignore`.
- Copy-paste all files.
- Test.
- Publish.

#### Checklist

- Check 3rd-party licenses. (See Process: Check licenses).
- Make sure all credits are respected if they are not licenseable. E.g., fair-use design inspiration.

### Check licenses

- Run `yarn run legally > legally-output` (because the output is so big for terminal buffer).
- If there're copyleft licenses (e.g., _GPL_), Ctrl+F and see if the packages are licensed under other licenses.
- If there're packages without licenses, put the code below in a file `temp.js`. run it, and check each package manually:
```javascript
const legally = require('legally');

var done = (function wait () { if (!done) setTimeout(wait, 1000) })();

(async () => {
  const licenses = await legally();
  for (packageName in licenses) {
    const lo = licenses[packageName];
    if (lo.package.length === 0 && lo.copying.length === 0 && lo.readme.length === 0)
      console.log(packageName, lo);
  }
  done = true;
})();
```

## Code structure

I'm, obviously, using [Angular Framework](https://angular.io/). You're also using [Angular Material](https://material.angular.io) and [Angular Flex-layout](https://github.com/angular/flex-layout/wiki/Declarative-API-Overview).

- The code structure is pretty much by-file-type. For now, one module, with `components`, `models`, `services`, and `typings` directories.

- Components are either meant as generic components or top-level page/routing components. The latter should only be used in `routes`. Their name end with `-page` and `Page`, and its `selector` could have more words as a reminder it shouldn't be used that way.

- Only page components should access the url.

**Update:** I'm not happy with the last 2 points and I may have violated them, I don't remember. Actually, after a while, I'm currently not happy with the structure: the components are neither presentation components nor do they contain all the business logic. Needs refactoring. For now, I just do enough work to get what I want done. **Suggestions for re-architecture are most welcome!**.
