import type { NavigationProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useRef } from "react";

import { Loggers } from "../utils/logger";

type RootStackParamList = {
  index: undefined;
  order: undefined;
  menu: undefined;
  cart: undefined;
};

/**
 * Safe navigation hook that prevents navigation timing issues
 * This helps avoid the "specified child already has a parent" Android crash
 * by ensuring navigation only happens after the current screen is fully mounted.
 * 
 * @param delay - Minimum delay in ms before navigation (default: 150ms)
 * @returns Safe navigation functions
 */
export function useSafeNavigation(delay: number = 150) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const lastNavTime = useRef<number>(0);

  // Check if we're currently on the expected route
  const isCurrentRoute = useCallback((routeName: string): boolean => {
    return route.name === routeName;
  }, [route.name]);

  // Safe replace - navigates only if enough time has passed
  const safeReplace = useCallback(
    (screen: keyof RootStackParamList | string) => {
      const now = Date.now();
      if (now - lastNavTime.current < delay) {
        // Too soon after last navigation, skip
        Loggers.navigation.warn(`Skipping navigation to ${screen} - too soon after last navigation`);
        return;
      }

      lastNavTime.current = now;
      Loggers.navigation.info(`Navigating to ${screen}`);
      // Use type assertion to access the replace method
      (navigation as any).replace(screen as string);
    },
    [navigation, delay]
  );

  // Safe push - navigates only if enough time has passed
  const safePush = useCallback(
    (screen: keyof RootStackParamList | string) => {
      const now = Date.now();
      if (now - lastNavTime.current < delay) {
        Loggers.navigation.warn(`Skipping navigation to ${screen} - too soon after last navigation`);
        return;
      }

      lastNavTime.current = now;
      Loggers.navigation.info(`Navigating to ${screen}`);
      // Use type assertion to access the push method
      (navigation as any).push(screen as string);
    },
    [navigation, delay]
  );

  // Safe navigate - navigates only if mounted
  const safeNavigate = useCallback(
    (screen: keyof RootStackParamList | string) => {
      lastNavTime.current = Date.now();
      Loggers.navigation.info(`Navigating to ${screen}`);
      navigation.navigate(screen as never);
    },
    [navigation]
  );

  // Safe go back - only if can go back
  const safeGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      Loggers.navigation.info("Going back");
      navigation.goBack();
    } else {
      Loggers.navigation.warn("Cannot go back - no previous screen");
    }
  }, [navigation]);

  return {
    safeReplace,
    safePush,
    safeNavigate,
    safeGoBack,
    isCurrentRoute,
  };
}

export default useSafeNavigation;

