import { ConfigProps } from "./types/config";

const config = {
  // REQUIRED
  appName: "Lynx",
  appDescription:
    "A powerful link shortening and analytics tool for modern web users.",
  domainName: "bea.li",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (mailgun.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    plans: [
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_dev_id"
            : "price_prod_id",
        name: "Basic",
        description: "Perfect for personal use",
        price: 9,
        features: [
          { name: "Create up to 100 short links" },
          { name: "Basic analytics" },
          { name: "Custom short codes" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1Nk4AbAxyNprDp7iXEPBvXju"
            : "price_456",
        // This plan will look different on the pricing page, it will be highlighted. You can only have one plan with isFeatured: true
        isFeatured: true,
        name: "Pro",
        description: "For power users and small businesses",
        price: 29,
        features: [
          { name: "Unlimited short links" },
          { name: "Advanced analytics" },
          { name: "Custom domains" },
          { name: "API access" },
        ],
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  mailgun: {
    subdomain: "mg", // if you're using a subdomain for emails
    fromNoReply: `LinkBeacon <noreply@mg.bea.li>`,
    fromAdmin: `LinkBeacon Support <support@mg.bea.li>`,
    supportEmail: "support@bea.li",
    forwardRepliesTo: "your-personal-email@example.com",
  },
  colors: {
    theme: "light",
    main: "#45E561", // You can adjust this color as needed
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/overview",
  },
} as ConfigProps;

export default config;
