import React from "react";
import { DocsThemeConfig, useConfig } from "nextra-theme-docs";
import { useRouter } from "next/router";

const logo = (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
    <img src="/images/landing/rmrk.png" alt="RMRK" width={28} height={28} />
    <span>RMRK EVM Docs</span>
  </span>
);

const config: DocsThemeConfig = {
  project: {
    link: "https://github.com/rmrk-team/evm",
  },
  docsRepositoryBase: "https://github.com/rmrk-team/evm/tree/master",
  footer: {
    text: "RMRK EVM Docs",
  },
  useNextSeoProps() {
    const { asPath } = useRouter();
    if (asPath !== "/") {
      return {
        titleTemplate: "%s | RMRK EVM Docs",
      };
    }
  },
  sidebar: {
    titleComponent({ title, type }) {
      if (type === "separator") {
        return <span>{title}</span>;
      }
      return <span>{title}</span>;
    },
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  logo,
  chat: {
    link: "https://t.me/rmrkimpl",
  },
  head() {
    const { title } = useConfig();
    const { route } = useRouter();
    const socialCard = "https://evm.rmrk.app/images/og.jpg";
    const siteTitle = title ? `${title} | RMRK EVM Docs` : "RMRK EVM Docs";

    return (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content="RMRK EVM documentation and guides." />
        <meta property="og:image" content={socialCard} />
        <meta property="og:url" content={`https://evm.rmrk.app${route}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={socialCard} />
      </>
    );
  },
};

export default config;
