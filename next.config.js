const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
  staticImages: true,
});

module.exports = withNextra({
  images: {
    unoptimized: true,
  },
});
