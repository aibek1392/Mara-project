import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList, TabParamList } from "../../App";
import { ProductCard } from "../components/ProductCard";
import { getByCategory } from "../data/products";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type ShopRoute = RouteProp<TabParamList, "Shop">;

const filters = [
  { key: "all", label: "All" },
  { key: "men", label: "Men" },
  { key: "women", label: "Women" },
  { key: "kids", label: "Kids" },
];

export function ShopScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ShopRoute>();
  const category = route.params?.category ?? "all";
  const items = getByCategory(category === "all" ? undefined : category);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.logo}>PULSE</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((f) => (
          <Pressable
            key={f.key}
            style={[styles.filter, category === f.key && styles.filterActive]}
            onPress={() =>
              navigation.navigate("Tabs", {
                screen: "Shop",
                params: { category: f.key },
              } as never)
            }
          >
            <Text
              style={[
                styles.filterText,
                category === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.grid}>
        <View style={styles.gridInner}>
          {items.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onPress={() => navigation.navigate("Product", { id: p.id })}
            />
          ))}
        </View>
      </ScrollView>
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
  filters: { maxHeight: 48, marginBottom: 8 },
  filtersContent: { paddingHorizontal: 16, gap: 8 },
  filter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e5e5e5",
    marginRight: 8,
  },
  filterActive: { backgroundColor: "#111", borderColor: "#111" },
  filterText: { fontSize: 13, fontWeight: "500" },
  filterTextActive: { color: "#fff" },
  grid: { paddingBottom: 24 },
  gridInner: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 10 },
});
