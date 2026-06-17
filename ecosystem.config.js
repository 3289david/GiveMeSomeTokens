// PM2 ecosystem config
// Usage: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "givemesometokens",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/givemesometokens",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Auto-restart on crash
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      // Log rotation
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "/var/log/gmt/error.log",
      out_file: "/var/log/gmt/out.log",
      merge_logs: true,
    },
  ],
};
