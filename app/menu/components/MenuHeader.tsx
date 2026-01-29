import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { isHQ } from "../../../config/accessControl";
import { SeasonalMenu } from "../../../config/config";
import { withOpacity } from "../../../utils/colorUtils";

interface MenuHeaderProps {
  currentSeasonalMenu: SeasonalMenu | null;
  user: { address?: string } | null;
  isLoggedIn: boolean;
  theme: {
    text: string;
    muted: string;
    primary: string;
  };
  resolvedMode: "light" | "dark";
  onToggleTheme?: () => void;
}

/**
 * Menu header component with user info and actions
 */
export function MenuHeader({
  currentSeasonalMenu,
  user,
  isLoggedIn,
  theme,
  resolvedMode,
  onToggleTheme,
}: MenuHeaderProps) {
  const isHQUser = useMemo(() => isHQ(), []);

  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {currentSeasonalMenu ? currentSeasonalMenu.name : "Our Menu"}
          </Text>
          {user?.address && (
            <Text style={[styles.locationText, { color: withOpacity(theme.text, 0.5) }]}>
              📍 {user.address}
            </Text>
          )}
          <Text style={[styles.headerSubtitle, { color: withOpacity(theme.text, 0.5) }]}>
            {isLoggedIn
              ? `Welcome, ${isHQUser ? "HQ Admin" : "Customer"}!`
              : "Please sign in to order"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: 16, marginBottom: 8 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerTitle: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  headerSubtitle: { fontSize: 16 },
  locationText: { fontSize: 14, marginBottom: 4 },
});

