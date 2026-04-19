const { spawnSync } = require('child_process');

const vars = {
    "NEXT_PUBLIC_SANITY_PROJECT_ID": "o2gcr94x",
    "NEXT_PUBLIC_SANITY_DATASET": "production",
    "SANITY_TOKEN": "skfWLbZwPZMMFyu1NVzFlV6t9914hY2W2ZYf39uwhqlyxUwslmPVXZ7ARsF7vHsE452ja5IPBL6opXUJfB9kBmCMhQtSHzKW4ulMeEg0rryZvaeDOO3dYIe5bcamKmmXyUWNY1eZRz0QyD1r8BODpAvZB12F6zeqjouBXU3sVvq4k5mxVjv4",
    "NEXT_PUBLIC_SUPABASE_URL": "https://kxkvanzkzhmtlkxfeldt.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "sb_publishable_Hr3QcGSVU31XYB4vdBzAHg_q70vDhjK",
    "RESEND_API_KEY": "re_UZjLp5Tq_5QNiwn2ZjzuKRmTVLAtL8mX2",
    "ADMIN_EMAIL": "mhmmdahmd052@gmail.com"
};

for (const [name, value] of Object.entries(vars)) {
    console.log(`> Updating ${name}...`);
    // Remove if exists
    spawnSync('npx.cmd', ['vercel', 'env', 'rm', name, 'production', '-y'], { shell: true });
    
    // Add new value
    const child = require('child_process').spawn('npx.cmd', ['vercel', 'env', 'add', name, 'production'], {
        shell: true,
        stdio: ['pipe', 'inherit', 'inherit']
    });
    
    child.stdin.write(value);
    child.stdin.end();
}
