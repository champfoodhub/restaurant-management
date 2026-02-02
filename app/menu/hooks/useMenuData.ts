import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../store/hooks";
import {
  loadMenuItems,
  loadSeasonalMenus,
} from "../../../store/menuSlice";
import { Loggers } from "../../../utils/logger";

/**
 * Custom hook for managing menu data initialization and loading from API
 */
export function useMenuData() {
  const dispatch = useAppDispatch();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      try {
        Loggers.menu.info("Loading menu data from API...");

        setIsLoading(true);
        setApiError(null);

        // Load menu items
        await dispatch(loadMenuItems()).unwrap();
        Loggers.menu.info("Menu items loaded");

        // Load seasonal menus
        await dispatch(loadSeasonalMenus()).unwrap();
        Loggers.menu.info("Seasonal menus loaded");

        Loggers.menu.info("Menu data loaded successfully from API");

        if (isMounted) {
          setApiError(null);
        }
      } catch (error: any) {
        Loggers.menu.error("Failed to load menu data from API", error);
        if (isMounted) {
          setApiError(error.message || "Failed to load menu data");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return { apiError, setApiError, isLoading };
}
