const fs = require('fs/promises');
const path = require('path');

async function build() {
    const srcDir = './src';
    const distDir = './dist';
    
    try {
        console.log('🧹 Cleaning dist...');
        await fs.rm(distDir, { recursive: true, force: true });
        await fs.mkdir(distDir, { recursive: true });
        
        console.log('📁 Copying files...');
        
        // Copy assets
        await fs.cp(path.join(srcDir, 'assets'), path.join(distDir, 'assets'), { recursive: true });
        console.log('  ✓ Assets copied');
        
        // Copy components
        await fs.cp(path.join(srcDir, 'components'), path.join(distDir, 'components'), { recursive: true });
        console.log('  ✓ Components copied');
        
        // Copy styles
        await fs.cp(path.join(srcDir, 'styles'), path.join(distDir, 'styles'), { recursive: true });
        console.log('  ✓ Styles copied');
        
        // Copy sketches
        await fs.cp(path.join(srcDir, 'sketches'), path.join(distDir, 'sketches'), { recursive: true });
        console.log('  ✓ Sketches copied');
        
        console.log('\n📝 Processing pages...');
        
        // Process pages - each gets its own folder with index.html
        const pagesSrcDir = path.join(srcDir, 'pages');
        const pagesDistDir = path.join(distDir, 'pages');
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
                
                console.log(`  ✓ ${file} → pages/${pageName}/index.html`);
            }
        }
        
        // Copy index.html to root
        await fs.copyFile(path.join(srcDir, 'index.html'), path.join(distDir, 'index.html'));
        console.log('  ✓ Index copied');
        
        console.log('\n📝 Processing blog posts...');
        
        // Process blog posts - each gets its own folder with index.html
        const blogSrcDir = path.join(srcDir, 'blog');
        const blogDistDir = path.join(distDir, 'blog');
        await fs.mkdir(blogDistDir, { recursive: true });
        
        const blogFiles = await fs.readdir(blogSrcDir);
        
        for (const file of blogFiles) {
            if (file.endsWith('.html') && file !== 'index.html') {
                // Get filename without extension
                const postName = path.basename(file, '.html');
                
                // Create folder for this post
                const postDir = path.join(blogDistDir, postName);
                await fs.mkdir(postDir, { recursive: true });
                
                // Copy HTML as index.html
                await fs.copyFile(
                    path.join(blogSrcDir, file),
                    path.join(postDir, 'index.html')
                );
                
                console.log(`  ✓ ${file} → blog/${postName}/index.html`);
            } else if (file === 'index.html' || file === 'posts.json') {
                // Copy blog listing and posts.json to root blog folder
                await fs.copyFile(
                    path.join(blogSrcDir, file),
                    path.join(blogDistDir, file)
                );
                console.log(`  ✓ ${file} copied to blog/`);
            }
        }
        
        console.log('\n✅ Build complete! Files are in ./dist');
        console.log('\n📦 Structure:');
        console.log('   dist/');
        console.log('   ├── index.html (only HTML file in root)');
        console.log('   ├── pages/');
        console.log('   │   ├── blog/');
        console.log('   │   │   └── index.html');
        console.log('   │   └── about/');
        console.log('   │       └── index.html');
        console.log('   ├── blog/');
        console.log('   │   ├── index.html (listing)');
        console.log('   │   ├── post-name/');
        console.log('   │   │   └── index.html');
        console.log('   ├── assets/');
        console.log('   ├── components/');
        console.log('   ├── styles/');
        console.log('   └── sketches/');
        
    } catch (err) {
        console.error('❌ Build failed:', err);
        process.exit(1);
    }
}

build();