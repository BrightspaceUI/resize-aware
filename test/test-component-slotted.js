import { html, PolymerElement } from '@polymer/polymer';

class SlottedTestComponent extends PolymerElement {

	static get properties() {
		return {};
	}

	static get is() {
		return 'test-component-slotted';
	}

	static get template() {
		return html`<slot></slot>`;
	}

}

customElements.define(SlottedTestComponent.is, SlottedTestComponent);
