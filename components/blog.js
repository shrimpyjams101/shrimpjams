class BlogListComponent extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        this.innerHTML = '<p>Loading posts...</p>';
        await this.loadPosts();
    }

    async loadPosts() {
        try {
            // Try to fetch posts.json (works in dist/)
            const response = await fetch('/blog/posts.json');
            
            if (!response.ok) {
                throw new Error('posts.json not found - run build script first');
            }
            
            const posts = await response.json();
            
            if (posts.length === 0) {
                this.innerHTML = '<p>No blog posts yet. Check back soon!</p>';
                return;
            }
            
            this.innerHTML = posts.map(post => `
                <article class="blog-post">
                    <h3><a href="${post.url}">${post.title}</a></h3>
                    <time>${post.date}</time>
                    <p>${post.excerpt}</p>
                    <a href="${post.url}">Read more →</a>
                </article>
            `).join('');
            
        } catch (error) {
            console.error('Error loading blog posts:', error);
            this.innerHTML = `
                <p style="color: orange;">⚠️ Blog posts not available.</p>
                <p>Run <code>node buildwebsite.js</code> to generate the blog listing, then serve from the <code>dist/</code> directory.</p>
            `;
        }
    }
}

customElements.define('blog-list', BlogListComponent);
