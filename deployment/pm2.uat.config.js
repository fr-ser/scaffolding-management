module.exports = {
  apps: [
    {
      interpreter: "/root/.nvm/versions/node/v22.18.0/bin/node",
      name: "uat-scaffolding",
      script: "./dist/src/index.js",
      cwd: "../uat-scaffolding/",
      error_file: "~/apps/uat-scaffolding/app.log",
      out_file: "~/apps/uat-scaffolding/app.log",
    },
  ],
};
