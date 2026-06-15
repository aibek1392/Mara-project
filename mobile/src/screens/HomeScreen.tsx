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
import { ProductCard } from "../components/ProductCard";
import { products } from "../data/products";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const featured = products.slice(0, 4);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.logo}>PULSE</Text>
        <View style={styles.hero}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&q=80",
            }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Just Do More.</Text>
            <Text style={styles.heroSub}>
              Performance footwear for every move.
            </Text>
            <Pressable
              style={styles.heroBtn}
              onPress={() =>
                navigation.navigate("Tabs", { screen: "Shop" } as never)
              }
            >
              <Text style={styles.heroBtnText}>Shop Now</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.editorialRow}>
          <Pressable
            style={styles.editorialCard}
            onPress={() =>
              navigation.navigate("Tabs", { screen: "Shop", params: { category: "men" } } as never)
            }
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
              }}
              style={styles.editorialImage}
            />
            <View style={styles.editorialOverlay}>
              <Text style={styles.editorialTitle}>Run the City</Text>
            </View>
          </Pressable>
          <Pressable
            style={styles.editorialCard}
            onPress={() =>
              navigation.navigate("Tabs", { screen: "Shop", params: { category: "women" } } as never)
            }
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1571907480496-05006152d4fc?w=800&q=80",
              }}
              style={styles.editorialImage}
            />
            <View style={styles.editorialOverlay}>
              <Text style={styles.editorialTitle}>Train in Style</Text>
            </View>
          </Pressable>
        </View>

        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80",
          }}
          style={styles.bannerImage}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending</Text>
          <View style={styles.grid}>
            {featured.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onPress={() => navigation.navigate("Product", { id: p.id })}
              />
            ))}
          </View>
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
  hero: { height: 420, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
    padding: 24,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -1,
  },
  heroSub: { color: "#fff", fontSize: 15, marginTop: 8, opacity: 0.9 },
  heroBtn: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 20,
  },
  heroBtnText: { fontWeight: "600", fontSize: 14 },
  section: { padding: 14 },
  sectionTitle: { fontSize: 22, fontWeight: "700", marginBottom: 12, paddingHorizontal: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  editorialRow: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  editorialCard: {
    flex: 1,
    height: 160,
    overflow: "hidden",
    borderRadius: 2,
  },
  editorialImage: { width: "100%", height: "100%" },
  editorialOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    padding: 12,
  },
  editorialTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  bannerImage: {
    width: "100%",
    height: 200,
    marginTop: 4,
    backgroundColor: "#f5f5f5",
  },
});
