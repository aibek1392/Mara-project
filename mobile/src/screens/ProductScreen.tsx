import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { useState } from "react";
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
import { ProductDetailSections } from "../components/ProductDetailSections";
import { getProduct } from "../data/products";
import { useCart } from "../context/CartContext";

type Route = RouteProp<RootStackParamList, "Product">;

export function ProductScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation();
  const product = getProduct(params.id);
  const { addItem } = useCart();
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text>Product not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <ScrollView>
        <Image source={{ uri: product.image }} style={styles.image} />
        <View style={styles.body}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <Text style={styles.desc}>{product.description}</Text>

          <Text style={styles.label}>SELECT SIZE</Text>
          <View style={styles.pills}>
            {product.sizes.map((s) => (
              <Pressable
                key={s}
                style={[styles.pill, size === s && styles.pillActive]}
                onPress={() => setSize(s)}
              >
                <Text style={[styles.pillText, size === s && styles.pillTextActive]}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.shippingNote}>
            Shipping: Free standard shipping on orders $150+. Arrives in 4–7
            business days.
          </Text>

          <Text style={styles.label}>COLOR</Text>
          <View style={styles.pills}>
            {product.colors.map((c) => (
              <Pressable
                key={c}
                style={[styles.pill, color === c && styles.pillActive]}
                onPress={() => setColor(c)}
              >
                <Text style={[styles.pillText, color === c && styles.pillTextActive]}>
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.addBtn, (!size || !color) && styles.addBtnDisabled]}
            disabled={!size || !color}
            onPress={() => {
              addItem(product, size, color);
              navigation.goBack();
            }}
          >
            <Text style={styles.addBtnText}>Add to Bag</Text>
          </Pressable>

          <ProductDetailSections />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  back: { padding: 16 },
  backText: { fontSize: 15, fontWeight: "500" },
  image: { width: "100%", aspectRatio: 1, backgroundColor: "#f5f5f5" },
  body: { padding: 20 },
  category: { textTransform: "capitalize", color: "#757575", fontSize: 13 },
  name: { fontSize: 26, fontWeight: "700", marginTop: 4 },
  price: { fontSize: 18, fontWeight: "500", marginTop: 8 },
  desc: { color: "#444", lineHeight: 22, marginTop: 12 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 20, marginBottom: 8 },
  shippingNote: {
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
    marginTop: 16,
  },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: "#e5e5e5",
    borderRadius: 4,
  },
  pillActive: { backgroundColor: "#111", borderColor: "#111" },
  pillText: { fontSize: 14 },
  pillTextActive: { color: "#fff" },
  addBtn: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 28,
  },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
