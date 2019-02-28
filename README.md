# resize-aware
A Polymer 3 compatible solution to reacting to changes in an element's size and/or position

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
