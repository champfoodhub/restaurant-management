import { Pressable, Text, View } from "react-native";
import { useCart } from "../context/CartContext";

export function MenuCard({
  id,
  name,
  price,
  theme,
}: {
  id: string;
  name: string;
  price: number;
  theme: any;
}) {
  const { items, addItem, removeItem } = useCart();
  const item = items.find((i) => i.id === id);
  const qty = item?.quantity ?? 0;

  return (
    <View
      style={{
        backgroundColor: theme.background,
        borderWidth: 1,
        borderColor: theme.primary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <Text style={{ color: theme.text, fontSize: 18 }}>{name}</Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <Pressable
          onPress={() => removeItem(id)}
          style={{
            padding: 8,
            borderRadius: 8,
            backgroundColor: theme.primary,
            opacity: qty === 0 ? 0.4 : 1,
          }}
        >
          <Text style={{ color: theme.text }}>−</Text>
        </Pressable>

        <Text
          style={{
            color: theme.text,
            marginHorizontal: 16,
            fontSize: 16,
          }}
        >
          {qty}
        </Text>

        <Pressable
          onPress={() => addItem({ id, name, price })}
          style={{
            padding: 8,
            borderRadius: 8,
            backgroundColor: theme.primary,
          }}
        >
          <Text style={{ color: theme.text }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}
