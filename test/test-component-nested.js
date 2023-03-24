import './test-component-simple.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { html, PolymerElement } from '@polymer/polymer';

const _testComponents = [];

class NestedTestComponent extends PolymerElement {

	static get properties() {
		return {
			'_hasChild1': {
				type: Boolean,
				value: true
			},
			'_hasChild2': {
				type: Boolean,
				value: false
			}
		};
	}

	static get is() {
		return 'test-component-nested';
	}

	static get template() {
		const template = html`
			<template is="dom-if" if="[[_hasChild1]]" restamp>
				<test-component-simple></test-component-simple>
			</template>
			<template is="dom-if" if="[[_hasChild2]]" restamp>
				<test-component-simple></test-component-simple>
			</template>
		`;
		template.setAttribute('strip-whitespace', true);
		return template;
	}

	connectedCallback() {
		super.connectedCallback();
		_testComponents.push(this);
	}

	disconnectedCallback() {
		const i = _testComponents.indexOf(this);
		if (i >= 0) {
			_testComponents.splice(i, 1);
		}
	}

	addChildComponent() {
		this.set('_hasChild2', true);
	}

	removeChildComponent() {
		this.set('_hasChild1', false);
	}

}

customElements.define(NestedTestComponent.is, NestedTestComponent);

export default _testComponents;
