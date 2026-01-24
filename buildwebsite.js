const fs = require('fs/promises');
const path = require('path');

// Metadata extraction patterns
const PATTERNS = {
    title: /<h2>(.*?)<\/h2>/,
    excerpt: /<p>(.*?)<\/p>/,
    date: /<meta name="date" content="(.*?)">/,
    author: /<meta name="author" content="(.*?)">/
};

async function build() {
    const srcDir = './src';
    const distDir = './dist';
    
    try {
        // Clean dist dir
        await fs.rm(distDir, { recursive: true, force: true });
        await fs.mkdir(distDir, { recursive: true });

        // Copy top level index.html
        await fs.cp(path.join(srcDir, "index.html"), path.join(distDir, "index.html"));

        // Copy CNAME file if it exists (for custom domain)
        await fs.access("./CNAME").then(() => {
                fs.copyFile("./CNAME", path.join(distDir, "CNAME"))
            });

        // Copy folders
        await fs.cp(path.join(srcDir, 'assets'), path.join(distDir, 'assets'), { recursive: true });
        await fs.cp(path.join(srcDir, 'components'), path.join(distDir, 'components'), { recursive: true });  
        await fs.cp(path.join(srcDir, 'styles'), path.join(distDir, 'styles'), { recursive: true });        
        await fs.cp(path.join(srcDir, 'sketches'), path.join(distDir, 'sketches'), { recursive: true });
                
        // Handle pages directory
        const pagesSrcDir = path.join(srcDir, 'pages');
        const pageFiles = await fs.readdir(pagesSrcDir);  // get all pages

        // Iterate over every page
        for (const file of pageFiles) {
            if (file.endsWith('.html')) {
                // Get filename without extension
                const pageName = path.basename(file, '.html');
                
                // Create folder for this page
                const pageDir = path.join(distDir, pageName);
                await fs.mkdir(pageDir, { recursive: true });
                
                // Copy HTML as index.html
                await fs.copyFile(
                    path.join(pagesSrcDir, file),
                    path.join(pageDir, 'index.html')
                );
            }
        }
        
        // Process blog posts - each gets its own folder with index.html
        const blogSrcDir = path.join(srcDir, 'blog');
        const blogDistDir = path.join(distDir, 'blog');
        await fs.mkdir(blogDistDir, { recursive: true });
        
        // Get a list of blog posts
        const blogFiles = await fs.readdir(blogSrcDir);
        const posts = [];  // allocate memory
        
        for (const file of blogFiles) {
            if (file.endsWith('.html')) {       
                // File name without extension
                const postName = path.basename(file, ".html");

                // Get file content
                const content = await fs.readFile(path.join(blogSrcDir, file), 'utf8');
                
                // Extract title from h2
                const titleMatch = content.match(PATTERNS.title);
                if (!titleMatch) {
                    throw new Error(`Missing title in ${file}. Add ${PATTERNS.title}.`);
                }
                const title = titleMatch[1];
                
                // Extract first paragraph as excerpt
                const excerptMatch = content.match(PATTERNS.excerpt);
                const excerpt = excerptMatch ? excerptMatch[1].substring(0, 150) + '...' : '';
                
                // Extract date from meta tag
                const dateMatch = content.match(PATTERNS.date);
                if (!dateMatch) {
                    throw new Error(`Missing date in ${file}. Add ${PATTERNS.date}.`);
                }
                const date = dateMatch[1];
                
                // Add to posts array
                const postData = {
                    title,
                    url: `/blog/${postName}/`,
                    excerpt,
                    date
                };
                
                posts.push(postData);
                
                // Create folder for post
                const postDir = path.join(blogDistDir, postName);
                await fs.mkdir(postDir, { recursive: true });
                
                // Copy HTML as index.html
                await fs.copyFile(
                    path.join(blogSrcDir, file),
                    path.join(postDir, 'index.html')
                );
            }
        }
        
        // Sort posts by date
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Write posts.json
        await fs.writeFile(
            path.join(blogDistDir, 'posts.json'),
            JSON.stringify(posts, null, 2)
        );
        
    } catch (err) {
        console.error('Build failed:', err);
        process.exit(1);
    }
}

build();