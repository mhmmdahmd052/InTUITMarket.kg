const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

// Shim the hostname and userInfo to prevent illegal header values
os.hostname = () => 'TiMoN';
const originalUserInfo = os.userInfo;
os.userInfo = () => {
    try {
        const info = originalUserInfo();
        info.username = 'gfdsh';
        return info;
    } catch (e) {
        return { username: 'gfdsh', uid: -1, gid: -1, shell: null, homedir: 'C:\\Users\\gfdsh' };
    }
};

// Also set common env vars
process.env.COMPUTERNAME = 'TiMoN';
process.env.HOSTNAME = 'TiMoN';
process.env.USERNAME = 'gfdsh';

console.log('> Hostname shimmed to:', os.hostname());

async function run() {
    try {
        const pkgPath = require.resolve('vercel/package.json');
        const pkg = require(pkgPath);
        const binRelativePath = pkg.bin.vercel || pkg.bin || 'dist/index.js';
        const binPath = path.resolve(path.dirname(pkgPath), binRelativePath);
        
        console.log('> Loading Vercel CLI from:', binPath);
        
        // Vercel is an ESM package, must use dynamic import
        await import(pathToFileURL(binPath).href);
    } catch (err) {
        console.error('Failed to load Vercel CLI:', err);
        process.exit(1);
    }
}

run();
