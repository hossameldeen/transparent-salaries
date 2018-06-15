# Salary Transparency

A Beaker-browser website for sharing salaries.

**Still work in progress, including the README**

## Development setup

### Prerequisites

- Install [Yarn](https://yarnpkg.com).
- Install [Beaker Browser](https://beakerbrowser.com/).
- Create an empty Beaker-browser website.
- Set its local directory to `<some-path>`.

### Build & Run

- In the project root, run `yarn install`.
- In the project root, run `yarn run build`.
- Manually copy the build artifacts under `dist/salary-transparency` to `<some-path>`.
- In Beaker Browser, from the menu: open `Library`. Go to the website you've created. Open its url from the topright.

Yes, unfortunately, it's pretty manual :(. That's because workspace UI is currently being replaced in Beaker Browser.

## Docs

You're, obviously, using [Angular Framework](https://angular.io/). You're also using [Angular Material](https://material.angular.io) and [Angular Flex-layout](https://github.com/angular/flex-layout/wiki/Declarative-API-Overview).

The code structure is pretty much by-file-type. For now, one module, with a `components` directory, and if needed, `services` directory, `directives` directory, ... etc.

You haven't decided on the UI yet. The code state is now an example of using Angular Material & Angular Flex-layout.
