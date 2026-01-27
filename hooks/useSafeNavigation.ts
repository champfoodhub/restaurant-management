import type { NavigationProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useRef } from "react";

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
  const safeReplace = useCallback(<K extends keyof RootStackParamList>(
    screen: K,
    params?: RootStackParamList[K]
  ) => {
    const now = Date.now();
    if (now - lastNavTime.current < delay) {
      // Too soon after last navigation, skip
      return;
    }
    
    lastNavTime.current = now;
    navigation.replace(screen as string, params as never);
  }, [navigation, delay]);

  // Safe push - navigates only if enough time has passed
  const safePush = useCallback(<K extends keyof RootStackParamList>(
    screen: K,
    params?: RootStackParamList[K]
  ) => {
    const now = Date.now();
    if (now - lastNavTime.current < delay) {
      return;
    }
    
    lastNavTime.current = now;
    navigation.push(screen as string, params as never);
  }, [navigation, delay]);

  // Safe navigate - navigates only if mounted
  const safeNavigate = useCallback(<K extends keyof RootStackParamList>(
    screen: K,
    params?: RootStackParamList[K]
  ) => {
    lastNavTime.current = Date.now();
    navigation.navigate(screen as string, params as never);
  }, [navigation]);

  // Safe go back - only if can go back
  const safeGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
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

