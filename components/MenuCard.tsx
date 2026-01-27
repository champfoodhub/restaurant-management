import { Pressable, Text, View } from "react-native";
import { addItem, removeItem } from "../store/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

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
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
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
          onPress={() => dispatch(removeItem(id))}
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
          onPress={() => dispatch(addItem({ id, name, price }))}
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
