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
