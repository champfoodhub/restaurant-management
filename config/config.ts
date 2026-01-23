export type Flavor = "HQ" | "USER" | "BRANCH";

export const AppConfig = {
  flavor: "BRANCH" as Flavor,

  appName: "Restaurant Management",

  roles: {
    HQ: {
      designation: "Headquarters",
    },
    USER: {
      designation: "Customer",
    },
    BRANCH: {
      designation: "Branch Admin",
    },
  },
};
