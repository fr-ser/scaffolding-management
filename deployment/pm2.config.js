module.exports = {
  apps: [
    {
      name: "scaffolding",
      script: "./dist/src/index.js",
      cwd: "../scaffolding/",
      error_file: "~/apps/scaffolding/app.log",
      out_file: "~/apps/scaffolding/app.log",
    },
  ],
};
