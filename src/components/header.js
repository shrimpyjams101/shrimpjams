class HeaderComponent extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const message = this.getAttribute('message') || 'hello. Am shrimpy.';
        this.innerHTML = `
            <!-- Header -->
            <header>
                <h1>${message}</h1>
            </header>
            <nav>
                <a class="white-link" href="/">Home</a>
                <a class="white-link" href="/pages/blog">Blog</a>
                <a class="white-link" href="https://patreon.com/shrimpjams?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink">Patreon</a>
            </nav>
        `;
    }
}

customElements.define('header-component', HeaderComponent);