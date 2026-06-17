const fs = require('fs');
const { execSync } = require('child_process');
const TUNNEL_LOG = 'C:\\Users\\skrti\\.pm2\\logs\\tunnel-error.log';
const URL_FILE = 'C:\\Users\\skrti\\AppData\\Local\\Temp\\opencode\\property-maintenance\\tunnel-url.txt';
const REPO_DIR = 'C:\\Users\\skrti\\AppData\\Local\\Temp\\opencode\\property-maintenance';
let lastUrl = '';

function getLatestUrl() {
  try {
    const log = fs.readFileSync(TUNNEL_LOG, 'utf8');
    const match = log.match(/https:\/\/[a-z-]+\.trycloudflare\.com/);
    return match ? match[0] : null;
  } catch { return null; }
}

function gitPush(url) {
  try {
    fs.writeFileSync(URL_FILE, url);
    execSync('git add -f tunnel-url.txt', { cwd: REPO_DIR, stdio: 'pipe' });
    execSync(`git commit -m "Update tunnel URL" --allow-empty`, { cwd: REPO_DIR, stdio: 'pipe' });
    execSync('git push origin main', { cwd: REPO_DIR, stdio: 'pipe' });
    console.log('Pushed URL to GitHub:', url);
  } catch (e) {
    console.error('Git push failed:', e.message);
  }
}

setInterval(() => {
  const url = getLatestUrl();
  if (url && url !== lastUrl) {
    lastUrl = url;
    gitPush(url);
  }
}, 10000);
