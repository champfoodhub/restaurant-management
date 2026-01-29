import { useCallback, useEffect, useState } from "react";
import { useAppDispatch } from "../../../store/hooks";
import {
  initializeMenuDatabase,
  loadMenuItems,
  loadSeasonalMenus,
} from "../../../store/menuSlice";
import { Loggers } from "../../../utils/logger";
import { DB_INIT_TIMEOUT } from "../../../utils/menuConstants";

/**
 * Custom hook for managing menu data initialization and loading
 */
export function useMenuData() {
  const dispatch = useAppDispatch();
  const [dbError, setDbError] = useState<string | null>(null);

  const initializeData = useCallback(async () => {
    let isMounted = true;

    try {
      Loggers.menu.info("Initializing menu data...");

      // Create a timeout promise with user-friendly error
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("DB_INIT_TIMEOUT"));
        }, DB_INIT_TIMEOUT);
      });

      // Race between initialization and timeout
      try {
        const result = await Promise.race([
          dispatch(initializeMenuDatabase()).unwrap(),
          timeoutPromise,
        ]);

        if (isMounted) {
          await dispatch(loadMenuItems()).unwrap();
          await dispatch(loadSeasonalMenus()).unwrap();
          Loggers.menu.info("Menu data loaded successfully");
          setDbError(null);
        }
      } catch (initError) {
        if (initError.message === "DB_INIT_TIMEOUT") {
          Loggers.menu.warn("Database initialization timed out, using sample data");
        } else {
          Loggers.menu.error("Failed to initialize menu data", initError);
        }

        if (isMounted) {
          setDbError("Using sample menu data - database unavailable");
          // Still try to load data (it might work or fallback to sample)
          try {
            await dispatch(loadMenuItems()).unwrap();
          } catch {
            Loggers.menu.warn("Could not load menu items, using sample data only");
          }
          try {
            await dispatch(loadSeasonalMenus()).unwrap();
          } catch {
            Loggers.menu.warn("Could not load seasonal menus");
          }
        }
      }
    } catch (error) {
      Loggers.menu.error("Unexpected error during menu initialization", error);
      if (isMounted) {
        setDbError("Using sample menu data");
      }
    }

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    const cleanup = initializeData();
    return () => {
      // Handle cleanup if initializeData returns a cleanup function
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, [initializeData]);

  return { dbError, setDbError };
}

