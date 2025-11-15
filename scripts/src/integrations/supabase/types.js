"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
exports.Constants = {
    public: {
        Enums: {
            platform_role: ["super_admin", "support", "analyst"],
            project_status: [
                "planning",
                "in_progress",
                "review",
                "completed",
                "on_hold",
            ],
            subscription_plan: ["atelier", "studio", "domus"],
            task_priority: ["low", "medium", "high", "urgent"],
            task_status: ["backlog", "todo", "in_progress", "review", "done"],
            user_role: ["admin", "designer", "client", "supplier"],
            workspace_role: ["owner", "admin", "member"],
        },
    },
};
