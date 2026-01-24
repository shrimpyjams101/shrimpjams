class FooterComponent extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const message = this.getAttribute('message') || 'hello. Am shrimpy.';
        this.innerHTML = `
            <!-- Footer -->
            <footer>
                <h6><em>Shrimpin' into the Distance</em></h6>
            </footer>
        `;
    }
}

customElements.define('footer-component', FooterComponent);