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

export const STRIPE_PRICE_IDS: Record<SubscriptionPlan, { monthly: string; yearly: string }> = {
  atelier: {
    monthly: "price_1SYeZ4R2sSXsKMlDyDN7wd9Y",
    yearly: "price_1SYf24R2sSXsKMlDcmpmY1Cr",
  },
  studio: {
    monthly: "price_1SYf44R2sSXsKMlDglRTiK4z",
    yearly: "price_1SYf4jR2sSXsKMlDvilJvlF3",
  },
  domus: {
    monthly: "price_1SYf6AR2sSXsKMlDd0MIxnK1",
    yearly: "price_1SYf6XR2sSXsKMlDuvSJopzK",
  },
};
