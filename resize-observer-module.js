import { ResizeObserverPolyfill, ExtendedResizeObserver } from './internal/d2l-resize-observer';
import hasNativeResizeObserver from './internal/has-native-resize-observer.js';

const ResizeObserverExport = hasNativeResizeObserver ? window.ResizeObserver : ResizeObserverPolyfill;

class BoundingBoxObserver extends ExtendedResizeObserver {
	constructor( callback ) {
		super( callback, true );
	}
}

export {
	ResizeObserverExport as ResizeObserver,
	BoundingBoxObserver
};
