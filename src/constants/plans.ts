export const SUBSCRIPTION_PLANS = {
  ATELIER: "atelier",
  STUDIO: "studio",
  DOMUS: "domus",
} as const;

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
    },
  },
};

export const PLAN_NAMES: Record<SubscriptionPlan, string> = {
  atelier: "Atelier",
  studio: "Studio",
  domus: "Domus",
};

export const PLAN_PRICES: Record<SubscriptionPlan, { monthly: number; yearly: number }> = {
  atelier: { monthly: 0, yearly: 0 },
  studio: { monthly: 149, yearly: 1610 },
  domus: { monthly: 399, yearly: 4310 },
};

export const STRIPE_PRICE_IDS: Record<Exclude<SubscriptionPlan, 'atelier'>, { monthly: string; yearly: string }> = {
  studio: {
    monthly: "price_1SJo9VR2sSXsKMlD3JF3b9ti",
    yearly: "price_1SJoJpR2sSXsKMlDgwa3VuZ9",
  },
  domus: {
    monthly: "price_1SJo9VR2sSXsKMlDMXxkrEAE",
    yearly: "price_1SJoKdR2sSXsKMlDb1Vu6m6F",
  },
};
