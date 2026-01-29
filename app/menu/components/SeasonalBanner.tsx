import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SeasonalMenu } from "../../../config/config";
import { SeasonalMenuManager } from "../../../utils/seasonalMenu";

interface SeasonalBannerProps {
  currentSeasonalMenu: SeasonalMenu | null;
  seasonalMenuManager: SeasonalMenuManager | null;
}

/**
 * Seasonal menu banner component
 */
export function SeasonalBanner({
  currentSeasonalMenu,
  seasonalMenuManager,
}: SeasonalBannerProps) {
  if (!currentSeasonalMenu) return null;

  return (
    <View style={styles.seasonalBanner}>
      <Text style={styles.seasonalBannerTitle}>🎉 {currentSeasonalMenu.name}</Text>
      <Text style={styles.seasonalBannerSubtitle}>{currentSeasonalMenu.description}</Text>
      <Text style={styles.seasonalBannerTime}>
        {seasonalMenuManager?.formatTimeRange(currentSeasonalMenu.startTime, currentSeasonalMenu.endTime)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  seasonalBanner: {
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  seasonalBannerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  seasonalBannerSubtitle: {
    color: "#FFF",
    fontSize: 14,
    opacity: 0.9,
  },
  seasonalBannerTime: {
    color: "#FFF",
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
});

