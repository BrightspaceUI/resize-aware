import ShadowMutationObserver from './shadow-mutation-observer.js';

let _shadyObserver = null;
let _shadowObserver = null;
const _watchedNodes = new Map();

const destroy = function() {
	if( _shadyObserver ) {
		_shadyObserver.disconnect();
		_shadyObserver = null;
	}
	
	if( _shadowObserver ) {
		_shadowObserver.destroy();
		_shadowObserver = null;
	}
	
	window.removeEventListener( 'resize', onPossibleResize );
	document.removeEventListener( 'transitionend', onPossibleResize );
};

const onPossibleResize = function() {
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
			if( sizeChanged || ( posnChanged && observer.positionAware ) ) {
				observer.callback( node, lastSize, newSize );
			}
		});
	});
};

const onHasTextAreaChanged = function( hasTextArea ) {
	_watchedNodes.forEach( nodeInfo => {
		nodeInfo.observers.forEach( observer => {
			if( observer.hasTextAreaCallback ) {
				observer.hasTextAreaCallback( hasTextArea );
			}
		});
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
	_shadowObserver.onHasTextareaChanged = onHasTextAreaChanged;
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

// TODO: maybe make this into a proper polyfill of ResizeObserver in next version?
class D2LResizeObserver {
	
	constructor( callback, positionAware, hasTextAreaCallback ) {
		this.callback = callback;
		this.hasTextAreaCallback = hasTextAreaCallback;
		this.positionAware = !!positionAware;
		this._watchedElements = new Set();
	}
	
	observe( node ) {
		if( this._watchedElements.has( node ) ) {
			return;
		}
		
		lazyInit();
		this._watchedElements.add( node );
		addListener( node, this );
		const size = node.getBoundingClientRect();
		this.callback( node, size, size );
	}
	
	unobserve( node ) {
		if( !this._watchedElements.has( node ) ) {
			return;
		}
		
		removeListener( node, this );
		this._watchedElements.delete( node );
	}
	
	disconnect() {
		this._watchedElements.forEach( node => removeListener( node, this ) );
		this._watchedElements.clear();
	}
	
}

export default D2LResizeObserver;
