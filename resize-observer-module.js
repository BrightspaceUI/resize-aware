import { ExtendedResizeObserver, ResizeObserverPolyfill } from './src/helpers/d2l-resize-observer.js';
import hasNativeResizeObserver from './src/helpers/has-native-resize-observer.js';

const ResizeObserverExport = hasNativeResizeObserver ? window.ResizeObserver : ResizeObserverPolyfill;

class BoundingBoxObserver extends ExtendedResizeObserver {
	constructor(callback) {
		super(callback, true, true);
	}
}

export {
	ResizeObserverExport as ResizeObserver,
	BoundingBoxObserver
};
