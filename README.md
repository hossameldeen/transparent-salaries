# Salary Transparency

A Beaker-browser website for sharing salaries.

**Still work in progress, including the README**

## Development setup

### Prerequisites

- Install [Yarn](https://yarnpkg.com).
- Install [Beaker Browser](https://beakerbrowser.com/).
- Create an empty Beaker-browser website.
- Set its local directory to `<some-path>`.

### Auto-reload

You can have auto build & reload on changes. However, it'll keep whole files between each change, so it'll take a lot of disk space. So, use in a throw-away Beaker-browser website.

- In the project root, run `yarn install`.
- In the project root, run `yarn run watch --output-path=<some-path>`.
- In Beaker Browser, from the menu: open `Library`. Go to the website you've created. Open its url from the topright.
- From the 3 dots in the url bar, `Toggle live reloading`.

### Deploy

- In the project root, run `yarn install`.
- In the project root, run `yarn run build`.
- Manually copy the build artifacts under `dist/salary-transparency` to `<some-path>`.
- In Beaker Browser, from the menu: open `Library`. Go to the website you've created. Open its url from the topright.

## Docs

You're, obviously, using [Angular Framework](https://angular.io/). You're also using [Angular Material](https://material.angular.io) and [Angular Flex-layout](https://github.com/angular/flex-layout/wiki/Declarative-API-Overview).

The code structure is pretty much by-file-type. For now, one module, with a `components` directory, and if needed, `services` directory, `directives` directory, ... etc.

You haven't decided on the UI yet. The code state is now an example of using Angular Material & Angular Flex-layout.
