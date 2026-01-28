import type { NavigationProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useRef } from "react";

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
 * Also prevents rapid consecutive navigations that can cause screen flickering.
 * 
 * @param delay - Minimum delay in ms before navigation (default: 200ms)
 * @returns Safe navigation functions
 */
export function useSafeNavigation(delay: number = 200) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const lastNavTime = useRef<number>(0);
  const isNavigating = useRef<boolean>(false);
  const navigationQueue = useRef<Array<() => void>>([]);
  const processedRoute = useRef<string>(route.name);

  // Update processed route when it changes
  useEffect(() => {
    processedRoute.current = route.name;
  }, [route.name]);

  // Check if we're currently on the expected route
  const isCurrentRoute = useCallback((routeName: string): boolean => {
    return processedRoute.current === routeName;
  }, []);

  // Process navigation queue with delay to prevent rapid navigation issues
  useEffect(() => {
    if (navigationQueue.current.length > 0 && !isNavigating.current) {
      const processQueue = async () => {
        isNavigating.current = true;
        
        while (navigationQueue.current.length > 0) {
          const navAction = navigationQueue.current.shift();
          if (navAction) {
            const now = Date.now();
            if (now - lastNavTime.current >= delay) {
              lastNavTime.current = now;
              navAction();
              // Wait after each navigation to prevent screen transition issues
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        }
        
        isNavigating.current = false;
      };

      processQueue();
    }
  }, [navigationQueue, delay]);

  // Safe replace - adds to queue to prevent rapid navigation
  const safeReplace = useCallback(
    (screen: keyof RootStackParamList | string) => {
      const now = Date.now();
      
      // If we're already navigating, queue this action
      if (isNavigating.current || now - lastNavTime.current < delay) {
        navigationQueue.current.push(() => {
          Loggers.navigation.info(`Queued replace navigation to ${screen}`);
          (navigation as any).replace(screen as string);
        });
        return;
      }

      lastNavTime.current = now;
      Loggers.navigation.info(`Navigating to ${screen}`);
      // Use type assertion to access the replace method
      (navigation as any).replace(screen as string);
    },
    [navigation, delay]
  );

  // Safe push - adds to queue to prevent rapid navigation
  const safePush = useCallback(
    (screen: keyof RootStackParamList | string) => {
      const now = Date.now();
      
      // If we're already navigating, queue this action
      if (isNavigating.current || now - lastNavTime.current < delay) {
        navigationQueue.current.push(() => {
          Loggers.navigation.info(`Queued push navigation to ${screen}`);
          (navigation as any).push(screen as string);
        });
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
      const now = Date.now();
      
      // If we're already navigating, queue this action
      if (isNavigating.current || now - lastNavTime.current < delay) {
        navigationQueue.current.push(() => {
          Loggers.navigation.info(`Queued navigate to ${screen}`);
          navigation.navigate(screen as never);
        });
        return;
      }

      lastNavTime.current = now;
      Loggers.navigation.info(`Navigating to ${screen}`);
      navigation.navigate(screen as never);
    },
    [navigation, delay]
  );

  // Safe go back - only if can go back
  const safeGoBack = useCallback(() => {
    const now = Date.now();
    
    // Prevent rapid go back actions
    if (now - lastNavTime.current < delay) {
      Loggers.navigation.warn("Skipping go back - too soon after last navigation");
      return;
    }
    
    if (navigation.canGoBack()) {
      lastNavTime.current = now;
      Loggers.navigation.info("Going back");
      navigation.goBack();
    } else {
      Loggers.navigation.warn("Cannot go back - no previous screen");
    }
  }, [navigation, delay]);

  return {
    safeReplace,
    safePush,
    safeNavigate,
    safeGoBack,
    isCurrentRoute,
  };
}

export default useSafeNavigation;

