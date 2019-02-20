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
			
			let mutationObservers = [];
			let onSlotChanged = function() {
				mutationObservers.forEach( function( observer ) {
					observer.destroy();
				});
				
				mutationObservers = this.$.slot.assignedNodes({ flatten: true }).map( function( child ) {
					return new ShadowMutationObserver( child, callback );
				});
				
				this._onPossibleResize();
			}.bind( this );
			
			this.$.slot.addEventListener( 'slotchange', onSlotChanged );
			onSlotChanged(); // Safari needs this
			
			this._destructor = function() {
				window.removeEventListener( 'resize', callback );
				document.removeEventListener( 'transitionend', callback );
				this.$.slot.removeEventListener( 'slotchange', onSlotChanged );
				mutationObservers.forEach( function( observer ) {
					observer.destroy();
				});
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
	}
	
});
