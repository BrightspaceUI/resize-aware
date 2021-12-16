import { PolymerElement, html } from '@polymer/polymer';

class SlottedTestComponent extends PolymerElement {
	
	static get is() {
		return 'test-component-slotted';
	}
	
	static get template() {
		return html`<slot></slot>`;
	}
	
	static get properties() {
		return {};
	}
	
}

customElements.define( SlottedTestComponent.is, SlottedTestComponent );
