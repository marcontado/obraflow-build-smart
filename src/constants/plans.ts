export const SUBSCRIPTION_PLANS = {
  ATELIER: "atelier",
  STUDIO: "studio",
  DOMUS: "domus",
} as const;

export const TRIAL_DAYS = 15;

export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS];

export interface PlanLimits {
  workspaces: number;
  membersPerWorkspace: number;
  activeProjects: number;
  maxClients: number;
  features: {
    basicDashboard: boolean;
    gantt: boolean;
    reports: boolean;
    invites: boolean;
    aiAssist: boolean;
    clientPortal: boolean;
    customization: boolean;
    templates: boolean;
    partners: boolean;
  };
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  atelier: {
    workspaces: 1,
    membersPerWorkspace: 3,
    activeProjects: 2,
    maxClients: 5,
    features: {
      basicDashboard: true,
      gantt: false,
      reports: false,
      invites: false,
      aiAssist: false,
      clientPortal: false,
      customization: false,
      templates: false,
      partners: false,
    },
  },
  studio: {
    workspaces: 2,
    membersPerWorkspace: 10,
    activeProjects: Infinity,
    maxClients: Infinity,
    features: {
      basicDashboard: true,
      gantt: true,
      reports: true,
      invites: true,
      aiAssist: false,
      clientPortal: false,
      customization: false,
      templates: true,
      partners: true,
    },
  },
  domus: {
    workspaces: Infinity,
    membersPerWorkspace: Infinity,
    activeProjects: Infinity,
    maxClients: Infinity,
    features: {
      basicDashboard: true,
      gantt: true,
      reports: true,
      invites: true,
      aiAssist: true,
      clientPortal: true,
      customization: true,
      templates: true,
      partners: true,
    },
  },
};

export const PLAN_NAMES: Record<SubscriptionPlan, string> = {
  atelier: "Atelier",
  studio: "Studio",
  domus: "Domus",
};

export const PLAN_PRICES: Record<SubscriptionPlan, { monthly: number; yearly: number }> = {
  atelier: { monthly: 39.90, yearly: 430.92 },
  studio: { monthly: 149.90, yearly: 1618.92 },
  domus: { monthly: 399.90, yearly: 4318.92 },
};

// Product IDs da nova conta Stripe (Dezembro 2024)
export const STRIPE_PRODUCT_IDS: Record<SubscriptionPlan, { monthly: string; yearly: string }> = {
  atelier: {
    monthly: "prod_TbHT7KF5Vmj9PQ",
    yearly: "prod_TbHSnM4aIpyBdR",
  },
  studio: {
    monthly: "prod_TbHSShzylGhbxH",
    yearly: "prod_TbHRLj1Vdr0Wsm",
  },
  domus: {
    monthly: "prod_TbHRHEWYlIyBNL",
    yearly: "prod_TbHRTAmP6Q96ed",
  },
};

// Price IDs da nova conta Stripe (Dezembro 2024)
export const STRIPE_PRICE_IDS: Record<SubscriptionPlan, { monthly: string; yearly: string }> = {
  atelier: {
    monthly: "price_1Se4u8PESLaxCOeJhmCOQUZs",
    yearly: "price_1Se4ttPESLaxCOeJFdqXi9eV",
  },
  studio: {
    monthly: "price_1Se4tXPESLaxCOeJeHGYgphJ",
    yearly: "price_1Se4szPESLaxCOeJV4Vx173X",
  },
  domus: {
    monthly: "price_1Se4saPESLaxCOeJThrqRZR3",
    yearly: "price_1Se4sJPESLaxCOeJBaJigynl",
  },
};

// Pricing Table IDs para embeds (nova conta Stripe)
export const STRIPE_PRICING_TABLE_IDS: Record<SubscriptionPlan, string> = {
  atelier: "prctbl_1Se55XPESLaxCOeJocFLmJH9",
  studio: "prctbl_1Se53qPESLaxCOeJb0lZTwbH",
  domus: "prctbl_1Se51QPESLaxCOeJ2eyhLJjL",
};
