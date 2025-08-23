module.exports = {
  apps: [
    {
      interpreter: "/root/.nvm/versions/node/v22.18.0/bin/node",
      name: "scaffolding",
      script: "./dist/src/index.js",
      cwd: "../scaffolding/",
      error_file: "~/apps/scaffolding/app.log",
      out_file: "~/apps/scaffolding/app.log",
    },
  ],
};
