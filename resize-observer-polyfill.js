import { ResizeObserverEntryPolyfill, ResizeObserverPolyfill } from './src/helpers/resize-observer.js';
import { hasNativeResizeObserver } from './src/helpers/has-native-resize-observer.js';

if (!hasNativeResizeObserver) {
	window.ResizeObserver = ResizeObserverPolyfill;
	window.ResizeObserverEntry = ResizeObserverEntryPolyfill;
}
