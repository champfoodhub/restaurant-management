import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { CATEGORY_ICONS } from "../utils/menuConstants";

const styles = StyleSheet.create({
  categoryContainer: {
    maxHeight: 48,
    marginBottom: 8,
  },
  categoryContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    gap: 4,
    minWidth: 70,
  },
  icon: {
    marginBottom: -1,
  },
  chipText: {
    fontWeight: "600",
    fontSize: 12,
  },
});

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  theme: {
    primary: string;
    muted: string;
    text: string;
  };
}

// Memoized category chip component to prevent unnecessary re-renders
const CategoryChip = memo(function CategoryChip({
  category,
  isSelected,
  onPress,
  theme,
}: {
  category: string;
  isSelected: boolean;
  onPress: () => void;
  theme: CategoryFilterProps["theme"];
}) {
  const backgroundColor = isSelected ? theme.primary : theme.muted;
  const textColor = isSelected ? "#FFF" : theme.text;
  const iconName = CATEGORY_ICONS[category] || "restaurant";

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor },
      ]}
    >
      <Ionicons
        name={iconName as any}
        size={16}
        color={textColor}
        style={styles.icon}
      />
      <Text style={[styles.chipText, { color: textColor }]}>
        {category}
      </Text>
    </Pressable>
  );
});

export const CategoryFilter = memo(function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  theme,
}: CategoryFilterProps) {
  // Early return if no categories
  const handleSelectAll = useCallback(() => {
    onSelectCategory(null);
  }, [onSelectCategory]);

  if (categories.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {/* All category */}
      <CategoryChip
        category="All"
        isSelected={selectedCategory === null}
        onPress={handleSelectAll}
        theme={theme}
      />

      {/* Category chips */}
      {categories.map((category) => (
        <CategoryChip
          key={category}
          category={category}
          isSelected={selectedCategory === category}
          onPress={() => onSelectCategory(category)}
          theme={theme}
        />
      ))}
    </ScrollView>
  );
});

