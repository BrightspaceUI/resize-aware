import '@polymer/polymer/polymer-legacy.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import ShadowMutationObserver from './shadow-mutation-observer.js';

const $_documentContainer = document.createElement('template');
$_documentContainer.innerHTML = `<dom-module id="d2l-resize-aware">
	<template strip-whitespace="">
		<style>
			:host {
				display: inline-block;
			}
		</style>
		<slot id="slot"></slot>
	</template>
	
</dom-module>`;

document.head.appendChild($_documentContainer.content);

Polymer({
	
	is:'d2l-resize-aware',
	
	properties: {
		positionAware: {
			type: Boolean,
			value: false
		},
		bubbleEvent: {
			type: Boolean,
			value: false
		},
		
		_destructor: Function,
		_lastSize: Object
	},
	
	attached: function() {
		this._lastSize = this.getBoundingClientRect();
		this._usingSafariWorkaround = false;
		
		let hasNativeResizeObserver = window.ResizeObserver && window.ResizeObserver.toString().indexOf( '[native code]' ) >= 0;
		let usingShadyDomPolyfill = !!this.__shady;
		
		if( hasNativeResizeObserver ) {
			/* Use native ResizeObserver */
			let observer = new window.ResizeObserver( this._onPossibleResize.bind( this ) );
			observer.observe( this );
			this._destructor = observer.unobserve.bind( observer, this );
		} else if ( usingShadyDomPolyfill ) {
			/* Use a mutation observer and rely on the Shady DOM polyfill to make it work */
			let callback = this._onPossibleResize.bind( this );
			window.addEventListener( 'resize', callback );
			document.addEventListener( 'transitionend', callback );
			
			let mutationObserver = new MutationObserver( callback );
			mutationObserver.observe( this, {
				attributes: true,
				childList: true,
				characterData: true,
				subtree: true
			});
			
			this._destructor = function() {
				window.removeEventListener( 'resize', callback );
				document.removeEventListener( 'transitionend', callback );
				mutationObserver.disconnect();
			}.bind( this );
		} else {
			/* Monitor all webcomponents in the subtree for changes */
			let callback = this._onPossibleResize.bind( this );
			window.addEventListener( 'resize', callback );
			document.addEventListener( 'transitionend', callback );
			
			let isSafari =
				window.navigator.userAgent.indexOf( 'Safari/' ) >= 0 &&
				window.navigator.userAgent.indexOf( 'Chrome/' ) === -1;
			
			let mutationObservers = [];
			
			const checkIfSafariWorkaroundIsRequired = function() {
				if( !isSafari ) return;
				this._changeSafariWorkaroundStatus(
					mutationObservers.some( o => o.hasTextarea )
				);
			}.bind( this );
			
			let onSlotChanged = function() {
				mutationObservers.forEach( observer => observer.destroy() );
				
				mutationObservers = this.$.slot.assignedNodes({ flatten: true }).map( function( child ) {
					let shadowObserver = new ShadowMutationObserver( child, callback );
					shadowObserver.onHasTextareaChanged = checkIfSafariWorkaroundIsRequired.bind( this );
					shadowObserver.onTransitionEnd = callback;
					return shadowObserver;
				}.bind( this ));
				
				this._onPossibleResize();
				checkIfSafariWorkaroundIsRequired();
			}.bind( this );
			
			this.$.slot.addEventListener( 'slotchange', onSlotChanged );
			onSlotChanged(); // Safari needs this
			
			this._destructor = function() {
				window.removeEventListener( 'resize', callback );
				document.removeEventListener( 'transitionend', callback );
				this.$.slot.removeEventListener( 'slotchange', onSlotChanged );
				mutationObservers.forEach( observer => observer.destroy() );
			}.bind( this );
		}
		
		this._onResize();
	},
	
	detached: function() {
		if( this._destructor ) {
			this._destructor();
		}
	},
	
	_onPossibleResize: function() {
		let newSize = this.getBoundingClientRect();
		if(
			newSize.width !== this._lastSize.width ||
			newSize.height !== this._lastSize.height ||
			this.positionAware && (
				newSize.x !== this._lastSize.x ||
				newSize.y !== this._lastSize.y
			)
		) {
			this._onResize();
		}
	},
	
	_onResize: function() {
		let newSize = this.getBoundingClientRect();
		this.dispatchEvent(
			new CustomEvent(
				'd2lresize',
				{
					composed: true,
					bubbles: !!this.bubbleEvent,
					target: this,
					detail: {
						previous: this._lastSize,
						current: newSize
					}
				}
			)
		);
		this._lastSize = newSize;
	},
	
	/* Safari's MutationObserver does not detect textarea resizes that
	 * occur as a result of the user dragging the resizer, so we just
	 * have to poll for changes in this case :(
	 */
	_safariTextareaWorkaround: function() {
		if( this._usingSafariWorkaround ) {
			this._onPossibleResize();
			window.requestAnimationFrame( this._safariTextareaWorkaround.bind( this ) );
		}
	},
	
	_changeSafariWorkaroundStatus: function( useWorkaround ) {
		if( useWorkaround && !this._usingSafariWorkaround ) {
			this._usingSafariWorkaround = useWorkaround;
			this._safariTextareaWorkaround();
		} else {
			this._usingSafariWorkaround = useWorkaround;
		}
	}
	
});
