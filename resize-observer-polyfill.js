import { ResizeObserverPolyfill, ResizeObserverEntryPolyfill } from './internal/d2l-resize-observer';

if( !window.ResizeObserver || window.ResizeObserver.toString().indexOf( '[native code]' ) < 0 ) {
	window.ResizeObserver = ResizeObserverPolyfill;
	window.ResizeObserverEntry = ResizeObserverEntryPolyfill;
}
