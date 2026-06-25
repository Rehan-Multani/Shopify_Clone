module.exports = {
  apps: [
    {
      name: "storify-gateway",
      script: "./src/server.js",
      cwd: "./services/gateway",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    },
    {
      name: "storify-auth-service",
      script: "./src/server.js",
      cwd: "./services/auth-service",
      env: {
        NODE_ENV: "production",
        PORT: 5001
      }
    },
    {
      name: "storify-merchant-admin-service",
      script: "./src/server.js",
      cwd: "./services/merchant-admin-service",
      env: {
        NODE_ENV: "production",
        PORT: 5002
      }
    },
    {
      name: "storify-catalog-service",
      script: "./src/server.js",
      cwd: "./services/catalog-service",
      env: {
        NODE_ENV: "production",
        PORT: 5003
      }
    },
    {
      name: "storify-store-service",
      script: "./src/server.js",
      cwd: "./services/store-service",
      env: {
        NODE_ENV: "production",
        PORT: 5004
      }
    },
    {
      name: "storify-billing-service",
      script: "./src/server.js",
      cwd: "./services/billing-service",
      env: {
        NODE_ENV: "production",
        PORT: 5005
      }
    }
  ]
};
