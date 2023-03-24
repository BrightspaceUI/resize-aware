import { html, PolymerElement } from '@polymer/polymer';

class SlottedTestComponent extends PolymerElement {

	static get template() {
		return html`<slot></slot>`;
	}

}

customElements.define('test-polymer-component-slotted', SlottedTestComponent);
