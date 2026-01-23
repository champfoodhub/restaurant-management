import { Flavor } from "../config/config";
import { BranchTheme } from "./branch";
import { HQTheme } from "./hq";
import { UserTheme } from "./user";

export function getTheme(
  flavor: Flavor,
  scheme: "dark" | "light"
) {
  switch (flavor) {
    case "HQ":
      return HQTheme[scheme];
    case "USER":
      return UserTheme[scheme];
    case "BRANCH":
      return BranchTheme[scheme];
    default:
      return HQTheme[scheme];
  }
}
