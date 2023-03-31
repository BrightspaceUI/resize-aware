import { ExtendedResizeObserver, ResizeObserverPolyfill } from './src/helpers/resize-observer.js';
import { hasNativeResizeObserver } from './src/helpers/has-native-resize-observer.js';

export const ResizeObserver = hasNativeResizeObserver ? window.ResizeObserver : ResizeObserverPolyfill;

export class BoundingBoxObserver extends ExtendedResizeObserver {
	constructor(callback) {
		super(callback, true, true);
	}
}
