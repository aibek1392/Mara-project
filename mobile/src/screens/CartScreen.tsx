import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../App";
import { useCart } from "../context/CartContext";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CartScreen() {
  const navigation = useNavigation<Nav>();
  const { items, subtotal, count } = useCart();

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Text style={styles.logo}>PULSE</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Your bag is empty</Text>
          <Text style={styles.emptySub}>Add items from the shop.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const shipping = subtotal >= 150 ? 0 : 8;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.logo}>PULSE</Text>
      <Text style={styles.title}>Bag ({count})</Text>
      <ScrollView style={styles.list}>
        {items.map((item) => (
          <View
            key={`${item.product.id}-${item.size}-${item.color}`}
            style={styles.item}
          >
            <Image source={{ uri: item.product.image }} style={styles.thumb} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemMeta}>
                {item.color} · {item.size} · Qty {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                ${(item.product.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.summary}>
        <View style={styles.row}>
          <Text>Subtotal</Text>
          <Text>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Shipping</Text>
          <Text>{shipping === 0 ? "Free" : `$${shipping}`}</Text>
        </View>
        <Text style={styles.total}>
          Total ${(subtotal + shipping).toFixed(2)}
        </Text>
        <Pressable
          style={styles.checkout}
          onPress={() => navigation.navigate("Checkout")}
        >
          <Text style={styles.checkoutText}>Checkout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  logo: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 4,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: { fontSize: 22, fontWeight: "700", paddingHorizontal: 20, marginBottom: 12 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "600" },
  emptySub: { color: "#757575", marginTop: 8 },
  list: { flex: 1, paddingHorizontal: 20 },
  item: {
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  thumb: { width: 80, height: 80, borderRadius: 4, backgroundColor: "#f5f5f5" },
  itemInfo: { flex: 1, marginLeft: 16 },
  itemName: { fontSize: 15, fontWeight: "500" },
  itemMeta: { fontSize: 13, color: "#757575", marginTop: 4 },
  itemPrice: { fontSize: 14, fontWeight: "600", marginTop: 6 },
  summary: {
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: "#111",
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  total: { fontSize: 18, fontWeight: "700", marginVertical: 12 },
  checkout: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontWeight: "600" },
});
