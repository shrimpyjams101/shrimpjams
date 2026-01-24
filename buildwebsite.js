const fs = require('fs/promises');
const path = require('path');

async function build() {
    const srcDir = './src';
    const distDir = './dist';
    
    try {
        console.log('Cleaning dist...');
        await fs.rm(distDir, { recursive: true, force: true });
        await fs.mkdir(distDir, { recursive: true });
        
        console.log('Copying files...');
        
        // Copy assets
        await fs.cp(path.join(srcDir, 'assets'), path.join(distDir, 'assets'), { recursive: true });
        console.log('  Assets copied');
        
        // Copy components
        await fs.cp(path.join(srcDir, 'components'), path.join(distDir, 'components'), { recursive: true });
        console.log('  Components copied');
        
        // Copy styles
        await fs.cp(path.join(srcDir, 'styles'), path.join(distDir, 'styles'), { recursive: true });
        console.log('  Styles copied');
        
        // Copy sketches
        await fs.cp(path.join(srcDir, 'sketches'), path.join(distDir, 'sketches'), { recursive: true });
        console.log('  Sketches copied');
        
        console.log('\nProcessing pages...');
        
        // Process pages - each gets its own folder with index.html
        const pagesSrcDir = path.join(srcDir, 'pages');
        const pagesDistDir = distDir;
        await fs.mkdir(pagesDistDir, { recursive: true });
        
        const pageFiles = await fs.readdir(pagesSrcDir);
        
        for (const file of pageFiles) {
            if (file.endsWith('.html')) {
                // Get filename without extension
                const pageName = path.basename(file, '.html');
                
                // Create folder for this page
                const pageDir = path.join(pagesDistDir, pageName);
                await fs.mkdir(pageDir, { recursive: true });
                
                // Copy HTML as index.html
                await fs.copyFile(
                    path.join(pagesSrcDir, file),
                    path.join(pageDir, 'index.html')
                );
                
                console.log(`  ${file} -> pages/${pageName}/index.html`);
            }
        }
        
        // Copy index.html to root
        await fs.copyFile(path.join(srcDir, 'index.html'), path.join(distDir, 'index.html'));
        console.log('  Index copied');
        
        // Copy CNAME file if it exists (for custom domain)
        const cnamePath = './CNAME';
        if (await fs.access(cnamePath).then(() => true).catch(() => false)) {
            await fs.copyFile(cnamePath, path.join(distDir, 'CNAME'));
            console.log('  CNAME copied');
        }
        
        console.log('\nProcessing blog posts...');
        
        // Process blog posts - each gets its own folder with index.html
        const blogSrcDir = path.join(srcDir, 'blog');
        const blogDistDir = path.join(distDir, 'blog');
        await fs.mkdir(blogDistDir, { recursive: true });
        
        const blogFiles = await fs.readdir(blogSrcDir);
        const posts = [];
        
        for (const file of blogFiles) {
            if (file.endsWith('.html')) {
                // Get filename without extension
                const postName = path.basename(file, '.html');
                
                // Read file to extract metadata
                const content = await fs.readFile(path.join(blogSrcDir, file), 'utf8');
                
                // Extract title from h2 or title tag
                const titleMatch = content.match(/<h2>(.*?)<\/h2>/) || content.match(/<title>(.*?)<\/title>/);
                const title = titleMatch ? titleMatch[1] : postName;
                
                // Extract first paragraph as excerpt
                const excerptMatch = content.match(/<p>(.*?)<\/p>/);
                const excerpt = excerptMatch ? excerptMatch[1].substring(0, 150) + '...' : '';
                
                // Extract date from meta tag, fallback to file modification time
                const dateMatch = content.match(/<meta name="date" content="(.*?)">/);
                if (!dateMatch) {
                    throw new Error(`Missing date metadata in ${file}. Add <meta name="date" content="YYYY-MM-DD"> to the file.`);
                }
                const date = dateMatch[1];
                
                // Add to posts array
                const postData = {
                    title,
                    slug: postName,
                    url: `/blog/${postName}/`,
                    excerpt,
                    date
                };
                
                posts.push(postData);
                
                // Create folder for this post
                const postDir = path.join(blogDistDir, postName);
                await fs.mkdir(postDir, { recursive: true });
                
                // Copy HTML as index.html
                await fs.copyFile(
                    path.join(blogSrcDir, file),
                    path.join(postDir, 'index.html')
                );
                
                console.log(`  ${file} -> blog/${postName}/index.html`);
            }
        }
        
        // Sort posts by date (newest first)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Write posts.json
        await fs.writeFile(
            path.join(blogDistDir, 'posts.json'),
            JSON.stringify(posts, null, 2)
        );
        console.log(`  Generated posts.json with ${posts.length} posts`);
        
        console.log('\nBuild complete! Files are in ./dist');
        
    } catch (err) {
        console.error('Build failed:', err);
        process.exit(1);
    }
}

build();