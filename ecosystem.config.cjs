module.exports = {
  apps: [
    {
      name: "app",
      script: "./src/app.js",
      env: {
        DEBUG: "dev",
      },
      cron_restart: "0 0 * * *",
    },
  ],
};
