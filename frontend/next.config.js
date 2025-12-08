const withPWA = require("next-pwa");
const runtimeCaching = require("next-pwa/cache");
module.exports = withPWA({
  reactStrictMode: true,
  pwa: {
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    runtimeCaching,
    register: false,
    skipWaiting: false,
    publicExcludes: ["!icons/*", "!_next/static/*"]
  },
});
