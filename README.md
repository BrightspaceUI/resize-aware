# resize-aware
A Polymer 3 compatible solution to reacting to changes in an element's size and/or position.
Contains a polyfill for `ResizeObserver` that is able to detect changes inside of webcomponents on all supported browsers (Firefox, Chrome/Chromium, Edge, IE11, and Safari).

### Polyfill

#### Global Polyfill
To use the polyfill, simply import `resize-observer-polyfill.js` into the page:
```javascript
import 'd2l-resize-aware/resize-observer-polyfill.js';
```
or
```html
<script type="module" src="d2l-resize-aware/resize-observer-polyfill.js"></script>
```

#### Module Import
Alternatively, if you do not wish to alter or define `window.ResizeObserver`, you can instead import the polyfill as an es6 module:
```javascript
import { ResizeObserver } from 'd2l-resize-aware/resize-observer-module.js';
```

Additionally, a separate class is provided that is capable to detecting changes in position as well as size, and checks the client bounding box (as returned by `getBoundingClientRect()`) rather than its content box.
```javascript
import { BoundingBoxObserver } from 'd2l-resize-aware/resize-observer-module.js';
```

### Web Component
This repo also includes a webcomponent implementing the polyfill for convenience:
```html
<d2l-resize-aware>
  ...
</d2l-resize-aware>
```

#### Properties

 - `position-aware` (flag) - Also fires a `d2l-resize-aware-resized` event when the component's position changes (by default this event is only fired on a size change)

#### Events

 - `d2l-resize-aware-resized`
   Fired when the component's size (or position if the `position-aware` flag is specified) changes. This event is also fired once when the component is attached to the DOM.

   **Bubbles:** no
   **Properties:**
    - `target` (Node) - The `<d2l-resize-aware>` element that fired the event
    - `detail.previous` (DomRect) - The previous bounding box of the element before the size changed
    - `detail.current` (DomRect) - The new bounding box of the element (equal to the result of `target.getBoundingClientRect()`)

### Browser Support

The latest version of all major browsers (including Internet Explorer) are supported.

There are 3 different implemenations that will be used depending on the browser, plus an additional workaround for Safari:
  - **Browser natively supports ResizeObserver _(Chrome, Chromium)_**
    Simply use the native ResizeObserver, unless `position-aware` is specified, in which case use the 3rd implementation
  - **Browser supports neither ResizeObserver nor native Shadow DOM, using the Shady DOM polyfill instead _(Edge, IE11)_**
    Uses a single MutationObserver plus a `resize` and `transitionend` event handler on the window, and relies on the shady DOM polyfill to detect changes in the shady DOM of webcomponents
  - **Browser supports native Shadow DOM, but not ResizeObserver _(Firefox, Safari)_**
    Like above, but also recursively adds a MutationObserver and `transitionend` event listener to the shadow root of all webcomponents so that changes within the shadow DOM of webcomponents can be detected. As webcomponents are added and removed, the tree of mutation observers is automatically updated.

Safari has a browser bug that prevents the resizing of a textarea using the native resize handle from being detected by mutation observers. To work around this bug, if the browser is detected as Safari, and a textarea element whose `resize` styling does not resolve to `none` (that is, it has a drag handle) is found on the page, this component will poll for changes in size whenever the mouse is moving or a moving touch event occurs.

### Limitations

The polyfill and component are unable to detect changes in position or size that occur as a result of CSS pseudo-class styling (eg. `:hover`) unless said syling has a transition.

If the browser natively supports `ResizeObserver`, the `BoundingBoxObserver` class will use both the native ResizeObserver and the polyfill together to cover each other's limitations. A CSS pseudo-class that causes another element to move but not change size will still not be detected, however, as neither the native implementation nor the polyfill can handle this case.

## Versioning & Releasing

> TL;DR: Commits prefixed with `fix:` and `feat:` will trigger patch and minor releases when merged to `main`. Read on for more details...

The [semantic-release GitHub Action](https://github.com/BrightspaceUI/actions/tree/main/semantic-release) is called from the `release.yml` GitHub Action workflow to handle version changes and releasing.

### Version Changes

All version changes should obey [semantic versioning](https://semver.org/) rules:
1. **MAJOR** version when you make incompatible API changes,
2. **MINOR** version when you add functionality in a backwards compatible manner, and
3. **PATCH** version when you make backwards compatible bug fixes.

The next version number will be determined from the commit messages since the previous release. Our semantic-release configuration uses the [Angular convention](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular) when analyzing commits:
* Commits which are prefixed with `fix:` or `perf:` will trigger a `patch` release. Example: `fix: validate input before using`
* Commits which are prefixed with `feat:` will trigger a `minor` release. Example: `feat: add toggle() method`
* To trigger a MAJOR release, include `BREAKING CHANGE:` with a space or two newlines in the footer of the commit message
* Other suggested prefixes which will **NOT** trigger a release: `build:`, `ci:`, `docs:`, `style:`, `refactor:` and `test:`. Example: `docs: adding README for new component`

To revert a change, add the `revert:` prefix to the original commit message. This will cause the reverted change to be omitted from the release notes. Example: `revert: fix: validate input before using`.

### Releases

When a release is triggered, it will:
* Update the version in `package.json`
* Tag the commit
* Create a GitHub release (including release notes)
* Deploy a new package to NPM

### Releasing from Maintenance Branches

Occasionally you'll want to backport a feature or bug fix to an older release. `semantic-release` refers to these as [maintenance branches](https://semantic-release.gitbook.io/semantic-release/usage/workflow-configuration#maintenance-branches).

Maintenance branch names should be of the form: `+([0-9])?(.{+([0-9]),x}).x`.

Regular expressions are complicated, but this essentially means branch names should look like:
* `1.15.x` for patch releases on top of the `1.15` release (after version `1.16` exists)
* `2.x` for feature releases on top of the `2` release (after version `3` exists)
