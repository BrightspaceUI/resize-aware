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
		
		_destructor: Function,
		_lastSize: Object
	},
	
	attached: function() {
		this._lastSize = this.getBoundingClientRect();
		this._usingSafariWorkaround = false;
		
		this._onPossibleResize = this._onPossibleResize.bind( this );
		
		const hasNativeResizeObserver = window.ResizeObserver && window.ResizeObserver.toString().indexOf( '[native code]' ) >= 0;
		const usingShadyDomPolyfill = !!this.__shady;
		
		if( hasNativeResizeObserver ) {
			/* Use native ResizeObserver */
			const observer = new window.ResizeObserver( this._onPossibleResize );
			observer.observe( this );
			this._destructor = observer.unobserve.bind( observer, this );
		} else if ( usingShadyDomPolyfill ) {
			/* Use a mutation observer and rely on the Shady DOM polyfill to make it work */
			const callback = this._onPossibleResize;
			window.addEventListener( 'resize', callback );
			document.addEventListener( 'transitionend', callback );
			
			const mutationObserver = new MutationObserver( callback );
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
			const callback = this._onPossibleResize;
			window.addEventListener( 'resize', callback );
			document.addEventListener( 'transitionend', callback );
			
			const isSafari =
				window.navigator.userAgent.indexOf( 'Safari/' ) >= 0 &&
				window.navigator.userAgent.indexOf( 'Chrome/' ) === -1;
			
			let mutationObservers = [];
			
			const checkIfSafariWorkaroundIsRequired = function() {
				if( !isSafari ) return;
				this._changeSafariWorkaroundStatus(
					mutationObservers.some( o => o.hasTextarea )
				);
			}.bind( this );
			
			const onSlotChanged = function() {
				mutationObservers.forEach( observer => observer.destroy() );
				
				mutationObservers = this.$.slot.assignedNodes({ flatten: true }).map( function( child ) {
					const shadowObserver = new ShadowMutationObserver( child, callback );
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
		const newSize = this.getBoundingClientRect();
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
		const newSize = this.getBoundingClientRect();
		this.dispatchEvent(
			new CustomEvent(
				'd2l-resize-aware-resized',
				{
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
	
	_changeSafariWorkaroundStatus: function( useWorkaround ) {
		if( this._usingSafariWorkaround === !!useWorkaround ) {
			return;
		}
		
		/* Safari's MutationObserver does not detect resizes on native textareas
		 * that occur as a result of the user dragging the resizer, so we just
		 * have to poll for changes in this case, but only on frames where the
		 * user could be resizing the textbox. Putting a mousemove event
		 * listener on this element won't work because the textbox lags behind
		 * the cursor, but we can at least only do a resize check when the mouse
		 * is moving instead of on every frame.
		 *
		 * This workaround is only used if there is a textarea element somewhere
		 * inside this element that does not have 'resize: none' in its styling,
		 * and only if the browser is Safari.
		 */
		if( useWorkaround ) {
			window.addEventListener( 'mousemove', this._onPossibleResize );
			window.addEventListener( 'touchmove', this._onPossibleResize );
		} else {
			window.removeEventListener( 'mousemove', this._onPossibleResize );
			window.removeEventListener( 'touchmove', this._onPossibleResize );
		}
		this._usingSafariWorkaround = !!useWorkaround;
	}
	
});
