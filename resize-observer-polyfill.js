import { ResizeObserverPolyfill, ResizeObserverEntryPolyfill } from './internal/d2l-resize-observer';

if(
	!window.ResizeObserver ||
	!/^\s*function ResizeObserver\(\) \{\s+\[native code\]\s+\}\s*$/.test( window.ResizeObserver.toString() )
) {
	window.ResizeObserver = ResizeObserverPolyfill;
	window.ResizeObserverEntry = ResizeObserverEntryPolyfill;
}
