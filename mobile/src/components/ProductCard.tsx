import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Product } from "../types";

interface Props {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, margin: 6, maxWidth: "50%" },
  image: {
    aspectRatio: 1,
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  info: { paddingVertical: 10 },
  name: { fontSize: 14, fontWeight: "500" },
  category: { fontSize: 12, color: "#757575", textTransform: "capitalize" },
  price: { fontSize: 13, fontWeight: "500", marginTop: 2 },
});
