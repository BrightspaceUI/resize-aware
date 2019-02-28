# resize-aware
A Polymer 3 compatible solution to reacting to changes in an element's size and/or position. This component is able to detect changes inside of webcomponents on all supported browsers (Firefox, Chrome/Chromium, Edge, IE11, and Safari).

```html
<d2l-resize-aware>
  ...
</d2l-resize-aware>
```

#### Properties

 - `position-aware` (flag) - Also fires a `d2lresize` event when the component's position changes (by default this event is only fired on a size change)
 
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
    Simply use the native ResizeObserver.
  - **Browser supports neither ResizeObserver nor native Shadow DOM, using the Shady DOM polyfill instead _(Edge, IE11)_**  
    Uses a single MutationObserver plus a `resize` and `transitionend` event handler on the window, and relies on the shady DOM polyfill to detect changes in the shady DOM of child webcomponents
  - **Browser supports native Shadow DOM, but not ResizeObserver _(Firefox, Safari)_**  
    Like above, but also recursively adds a MutationObserver and `transitionend` event listener to the shadow root of all child webcomponents so that changes within the shadow DOM of webcomponents can be detected. As webcomponents are added and removed, the tree of mutation observers is automatically updated.

Safari has a browser bug that prevents the resizing of a textarea using the native resize handle from being detected by mutation observers. To work around this bug, if the browser is detected as Safari, and a textarea element whose `resize` styling does not resolve to `none` (that is, it has a drag handle) is found within the observed subtree, this component will poll for changes in size whenever the mouse is moving or a moving touch event occurs. 
