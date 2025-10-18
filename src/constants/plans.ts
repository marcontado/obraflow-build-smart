export const SUBSCRIPTION_PLANS = {
  ATELIER: "atelier",
  STUDIO: "studio",
  DOMMUS: "dommus",
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
  dommus: {
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
  dommus: "Dommus",
};

export const PLAN_PRICES: Record<SubscriptionPlan, { monthly: number; yearly: number }> = {
  atelier: { monthly: 0, yearly: 0 },
  studio: { monthly: 149, yearly: 1490 },
  dommus: { monthly: 399, yearly: 3990 },
};
