import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { CATEGORY_ICONS } from "../utils/menuConstants";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  theme: any;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  theme,
}: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {/* All category */}
      <Pressable
        onPress={() => onSelectCategory(null)}
        style={[
          styles.categoryChip,
          {
            backgroundColor:
              selectedCategory === null ? theme.primary : theme.muted,
          },
        ]}
      >
        <Ionicons
          name={CATEGORY_ICONS["All"] as any}
          size={16}
          color={selectedCategory === null ? "#FFF" : theme.text}
          style={styles.categoryIcon}
        />
        <Text
          style={[
            styles.categoryText,
            { color: selectedCategory === null ? "#FFF" : theme.text },
          ]}
        >
          All
        </Text>
      </Pressable>

      {/* Category chips */}
      {categories.map((category) => (
        <Pressable
          key={category}
          onPress={() => onSelectCategory(category)}
          style={[
            styles.categoryChip,
            {
              backgroundColor:
                selectedCategory === category ? theme.primary : theme.muted,
            },
          ]}
        >
          <Ionicons
            name={(CATEGORY_ICONS[category] || "restaurant") as any}
            size={16}
            color={selectedCategory === category ? "#FFF" : theme.text}
            style={styles.categoryIcon}
          />
          <Text
            style={[
              styles.categoryText,
              { color: selectedCategory === category ? "#FFF" : theme.text },
            ]}
          >
            {category}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  categoryContainer: {
    maxHeight: 48,
    marginBottom: 8,
  },
  categoryContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    gap: 4,
  },
  categoryIcon: {
    marginBottom: -1,
  },
  categoryText: {
    fontWeight: "600",
    fontSize: 12,
  },
});
