export type Role = "HQ" | "USER" | "BRANCH";

export const flavors = {
  hq: {
    appName: "Restaurant HQ",
    role: "HQ" as Role,
  },
  user: {
    appName: "Restaurant User",
    role: "USER" as Role,
  },
  branch: {
    appName: "Restaurant Branch",
    role: "BRANCH" as Role,
  },
};
