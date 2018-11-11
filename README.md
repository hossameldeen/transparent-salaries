# Transparent Salaries

A Beaker-browser website for sharing salaries.

## Processes

### Development setup

- Install [Yarn](https://yarnpkg.com).
- Install [Beaker Browser](https://beakerbrowser.com/).
- Install [WebStorm](https://www.jetbrains.com/webstorm/). Yup, costs money. You could [VSCode](https://code.visualstudio.com/) if you want. I'm just using basic [Angular](https://angular.io/) stuff.
- In WebStorm: View menu -> Tool Windows -> mark Version Control.

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

- In the project root, run `yarn install`.
- In the project root, run `yarn run build --prod`. **Don't forget the `--prod`!**
- Make sure preview mode is on on your website.
- Delete all old files except `dat.json` and `dat.ignore`.
- Copy-paste all files.
- Check & publish.

## Code Structure

You're, obviously, using [Angular Framework](https://angular.io/). You're also using [Angular Material](https://material.angular.io) and [Angular Flex-layout](https://github.com/angular/flex-layout/wiki/Declarative-API-Overview).

- The code structure is pretty much by-file-type. For now, one module, with `components`, `models`, `services`, and `typings` directories.

- Components are either meant as generic components or top-level page/routing components. The latter should only be used in `routes`. Their name end with `-page` and `Page`, and its `selector` could have more words as a reminder it shouldn't be used that way.

- Only page components should access the url.
