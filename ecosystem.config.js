module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: 'C:\\Users\\skrti\\AppData\\Local\\Temp\\opencode\\property-maintenance\\backend',
      script: 'server.js',
      env: { PORT: 5000 },
    },
    {
      name: 'tunnel',
      script: 'C:\\Users\\skrti\\AppData\\Local\\Temp\\cloudflared.exe',
      args: ['tunnel', '--url', 'http://localhost:5000'],
      interpreter: 'none',
    },
    {
      name: 'url-watcher',
      script: 'C:\\Users\\skrti\\AppData\\Local\\Temp\\opencode\\property-maintenance\\monitor-url.js',
    },
  ],
};
