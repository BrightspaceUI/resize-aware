import ShadowMutationObserver from './shadow-mutation-observer.js';

let _shadyObserver = null;
let _shadowObserver = null;
let _safariWorkaroundActive = false;
const _watchedNodes = new Map();

const _isSafari =
	window.navigator.userAgent.indexOf( 'Safari/' ) >= 0 &&
	window.navigator.userAgent.indexOf( 'Chrome/' ) === -1;
	
/* Safari's MutationObserver does not detect resizes on native textareas
 * that occur as a result of the user dragging the resizer, so we just
 * have to poll for changes in this case, But we can at least only do a
 * resize check when the mouse is moving instead of on every frame.
 *
 * This workaround is only used if there is a textarea element somewhere
 * on the page that does not have 'resize: none' in its styling, and only
 * if the browser is Safari.
 */
const updateSafariWorkaroundStatus = function( hasResizableTextArea ) {
	hasResizableTextArea = !!hasResizableTextArea;
	if( !_isSafari || _safariWorkaroundActive === hasResizableTextArea ) return;
	
	_safariWorkaroundActive = hasResizableTextArea;
	if( hasResizableTextArea ) {
		window.addEventListener( 'mousemove', onPossibleResize );
		window.addEventListener( 'touchmove', onPossibleResize );
	} else {
		window.removeEventListener( 'mousemove', onPossibleResize );
		window.removeEventListener( 'touchmove', onPossibleResize );
	}
};

const destroy = function() {
	if( _shadyObserver ) {
		_shadyObserver.disconnect();
		_shadyObserver = null;
	}
	
	if( _shadowObserver ) {
		_shadowObserver.destroy();
		_shadowObserver = null;
	}
	
	updateSafariWorkaroundStatus( false );
	window.removeEventListener( 'resize', onPossibleResize );
	document.removeEventListener( 'transitionend', onPossibleResize );
	_watchedNodes.clear();
};

const onPossibleResize = function() {
	const observerMap = new Map();
	_watchedNodes.forEach( ( nodeInfo, node ) => {
		const newSize = node.getBoundingClientRect();
		const lastSize = nodeInfo.lastSize;
		nodeInfo.lastSize = newSize;
		const sizeChanged = ( newSize.width !== lastSize.width || newSize.height !== lastSize.height );
		const posnChanged = ( newSize.left !== lastSize.left || newSize.top !== lastSize.top );
		
		if( !sizeChanged && !posnChanged ) {
			return;
		}
		
		nodeInfo.observers.forEach( observer => {
			if( sizeChanged || observer.__positionAware !== false ) {
				const resizeEntry = new ResizeObserverEntryPolyfill();
				resizeEntry.__target = node;
				resizeEntry.__contentRect = newSize;
				
				if( observerMap.has( observer ) ) {
					observerMap.get( observer ).push( resizeEntry );
				} else {
					observerMap.set( observer, [resizeEntry] );
				}
			}
		});
	});
	
	observerMap.forEach( ( resizeEntries, observer ) => {
		observer.__callback( resizeEntries );
	});
};

const initCommon = function() {
	window.addEventListener( 'resize', onPossibleResize );
	document.addEventListener( 'transitionend', onPossibleResize );
};

const initShadyObserver = function() {
	if( _shadyObserver || _shadowObserver ) {
		return;
	}
	
	_shadyObserver = new MutationObserver( onPossibleResize );
	_shadyObserver.observe( document.documentElement, {
		attributes: true,
		childList: true,
		characterData: true,
		subtree: true
	});
	
	initCommon();
};

const initShadowObserver = function() {
	if( _shadowObserver ) {
		return;
	}
	
	if( _shadyObserver ) {
		// switch to shadow observer
		destroy();
	}
	
	_shadowObserver = new ShadowMutationObserver( document.documentElement, onPossibleResize );
	_shadowObserver.onHasTextareaChanged = updateSafariWorkaroundStatus;
	_shadowObserver.onTransitionEnd = onPossibleResize;
	
	initCommon();
};

const lazyInit = function() {
	if( document.documentElement.__shady ) {
		initShadyObserver();
	} else {
		initShadowObserver();
	}
};

const addListener = function( node, observer ) {
	let watchedNode = _watchedNodes.get( node );
	if( watchedNode ) {
		watchedNode.observers.add( observer );
	} else {
		watchedNode = {
			lastSize: node.getBoundingClientRect(),
			observers: new Set()
		};
		watchedNode.observers.add( observer );
		_watchedNodes.set( node, watchedNode );
	}
};

const removeListener = function( node, observer ) {
	const watchedNode = _watchedNodes.get( node );
	if( watchedNode ) {
		watchedNode.observers.delete( observer );
		if( watchedNode.observers.size <= 0 ) {
			_watchedNodes.delete( watchedNode );
		}
		if( _watchedNodes.size <= 0 ) {
			destroy();
		}
	}
};

class ResizeObserverEntryPolyfill {
	get contentRect() { return this.__contentRect; }
	get target() { return this.__target; }
}

class ResizeObserverPolyfill {
	
	constructor( callback ) {
		this.__callback = callback;
		this.__watchedElements = new Set();
	}
	
	observe( node ) {
		if( this.__watchedElements.has( node ) ) {
			return;
		}
		
		lazyInit();
		this.__watchedElements.add( node );
		addListener( node, this );
		const resizeEntry = new ResizeObserverEntryPolyfill();
		resizeEntry.__target = node;
		resizeEntry.__contentRect = node.getBoundingClientRect();
		this.__callback( [resizeEntry] );
	}
	
	unobserve( node ) {
		if( !this.__watchedElements.has( node ) ) {
			return;
		}
		
		removeListener( node, this );
		this.__watchedElements.delete( node );
	}
	
	disconnect() {
		this.__watchedElements.forEach( node => removeListener( node, this ) );
		this.__watchedElements.clear();
	}
}

class ExtendedResizeObserver extends ResizeObserverPolyfill {
	
	constructor( callback, positionAware ) {
		super( callback );
		this.__positionAware = !!positionAware;
	}
	
}

export {
	ResizeObserverPolyfill,
	ExtendedResizeObserver,
	ResizeObserverEntryPolyfill
};
