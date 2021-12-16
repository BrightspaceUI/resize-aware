import { ResizeObserverPolyfill, ResizeObserverEntryPolyfill } from './internal/d2l-resize-observer';
import hasNativeResizeObserver from './internal/has-native-resize-observer.js';

if (!hasNativeResizeObserver) {
	window.ResizeObserver = ResizeObserverPolyfill;
	window.ResizeObserverEntry = ResizeObserverEntryPolyfill;
}
