/* Mutation observers do not detect subtree changes on webcomponents
 * because they are part of the element's shadow root rather than
 * normal children. So, we must explicitly attach the mutation
 * observer to the shadow root of webcomponents if the browser supports
 * native Shadow DOM but not native ResizeObserver
 */
class ShadowMutationObserver {

	constructor(node, callback) {
		this._hasTextarea = false;
		this._callback = callback;
		this._trackedComponents = new Map();
		this._disposeEvents = () => null;
		this._rootObserver = new MutationObserver(function(mutationRecords) {
			let elementsRemoved = false;

			// Start tracking any new webcomponents in the node's subtree
			mutationRecords.forEach(function(record) {
				for (let i = 0; i < record.addedNodes.length; i++) {
					this._trackWebComponents(record.addedNodes[i]);
				}

				elementsRemoved |= record.removedNodes && record.removedNodes.length > 0;
			}.bind(this));

			if (elementsRemoved) {
				// Stop tracking webcomponents that are no longer descendants of the node
				this._trackedComponents.forEach(function(observer, trackedComponent) {
					if (!node.contains(trackedComponent)) {
						observer.destroy();
						this._trackedComponents.delete(trackedComponent);
					}
				}.bind(this));
			}

			this._checkForTextArea(node);
			callback(mutationRecords);
		}.bind(this));

		this._rootObserver.observe(node, {
			attributes: true,
			childList: true,
			characterData: true,
			subtree: true
		});
		this._trackWebComponents(node);
		this._checkForTextArea(node);

		if (node instanceof ShadowRoot) {
			const transitionEndCallback = event => this.onTransitionEnd(event);
			node.addEventListener('transitionend', transitionEndCallback);
			this._disposeEvents = () => node.removeEventListener('transitionend', transitionEndCallback);
		}
	}

	destroy() {
		this._rootObserver.disconnect();
		this._trackedComponents.forEach(function(observer) {
			observer.destroy();
		});
		this._trackedComponents.clear();
		this._disposeEvents();
	}

	get hasTextarea() {
		return this._hasTextarea;
	}

	onHasTextareaChanged(/* hasTextarea */) {
		/* override */
	}

	onTransitionEnd(/* event */) {
		/* override */
	}

	_trackWebComponents(node) {
		if (node.shadowRoot && !this._trackedComponents.get(node)) {
			const childObserver = new ShadowMutationObserver(node.shadowRoot, this._callback);
			childObserver.onHasTextareaChanged = hasTextarea => this.onHasTextareaChanged(hasTextarea);
			childObserver.onTransitionEnd = event => this.onTransitionEnd(event);

			this._trackedComponents.set(node, childObserver);
		}

		const children = node.children || node.childNodes || [];
		for (var i = 0; i < children.length; i++) {
			this._trackWebComponents(children[i]);
		}
	}

	/* Workaround for Safari >:( */
	_checkForTextArea(node) {
		let hasTextarea = (node.tagName === 'TEXTAREA');

		if (!hasTextarea && node.querySelectorAll) {
			const textareas = node.querySelectorAll('textarea');
			for (let i = 0; i < textareas.length; i++) {
				hasTextarea = hasTextarea || window.getComputedStyle(textareas[i]).resize !== 'none';
				if (hasTextarea) break;
			}
		}

		if (!hasTextarea) {
			this._trackedComponents.forEach(function(observer) {
				hasTextarea = hasTextarea || observer.hasTextarea;
			});
		}

		if (hasTextarea !== this._hasTextarea) {
			this._hasTextarea = hasTextarea;
			this.onHasTextareaChanged(hasTextarea);
		}
	}

}

export default ShadowMutationObserver;
