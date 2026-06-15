import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const REVIEW_COUNT = 19;

const sections = [
  {
    id: "shipping",
    title: "Shipping",
    body:
      "Standard Shipping — Arrives in 4–7 business days. Free on orders $150+.\n\nExpress Shipping — Arrives in 2–3 business days. $15 flat rate.\n\nPick Up — Available at select PULSE locations within 2 hours.",
  },
  {
    id: "size-fit",
    title: "Size & Fit",
    body:
      "Fit: True to size. We recommend ordering your usual size.\n\nModel details: 6'0\" (183 cm), chest 38\", wearing size M and size 10 shoe.",
  },
  {
    id: "shipping-returns",
    title: "Shipping & Returns",
    body:
      "Free standard shipping and returns on qualifying orders. Items must be unworn with original tags.\n\nReturns: 60 days from delivery.\n\nExchanges: Free size and color exchanges within 60 days.",
  },
  {
    id: "reviews",
    title: `Reviews (${REVIEW_COUNT})`,
    body: null as string | null,
  },
];

export function ProductDetailSections() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <View style={styles.wrap}>
      {sections.map((section) => {
        const isOpen = openId === section.id;
        return (
          <View key={section.id} style={styles.row}>
            <Pressable
              style={styles.trigger}
              onPress={() =>
                setOpenId((prev) => (prev === section.id ? null : section.id))
              }
            >
              <Text style={styles.triggerText}>{section.title}</Text>
              <Text style={[styles.chevron, isOpen && styles.chevronOpen]}>
                ›
              </Text>
            </Pressable>
            {isOpen && section.id === "reviews" ? (
              <View style={styles.panel}>
                <View style={styles.reviewSummary}>
                  <Text style={styles.reviewScore}>4.8</Text>
                  <View>
                    <Text style={styles.reviewStars}>★★★★★</Text>
                    <Text style={styles.reviewCount}>{REVIEW_COUNT} reviews</Text>
                  </View>
                </View>
                <Text style={styles.reviewTitle}>Runs true to size</Text>
                <Text style={styles.reviewBody}>
                  Comfortable right out of the box. Great for daily wear.
                </Text>
                <Text style={styles.reviewMeta}>— Alex M. · Verified</Text>
                <Text style={[styles.reviewTitle, { marginTop: 12 }]}>
                  Quality build
                </Text>
                <Text style={styles.reviewBody}>
                  Materials feel premium. Exactly what I expected.
                </Text>
                <Text style={styles.reviewMeta}>— Jordan K. · Verified</Text>
              </View>
            ) : null}
            {isOpen && section.body ? (
              <Text style={styles.panel}>{section.body}</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 28, borderTopWidth: 1, borderTopColor: "#e5e5e5" },
  row: { borderBottomWidth: 1, borderBottomColor: "#e5e5e5" },
  trigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  triggerText: { fontSize: 15, fontWeight: "500" },
  chevron: { fontSize: 20, color: "#757575", transform: [{ rotate: "90deg" }] },
  chevronOpen: { transform: [{ rotate: "-90deg" }] },
  panel: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
    paddingBottom: 16,
  },
  reviewSummary: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  reviewScore: { fontSize: 32, fontWeight: "700" },
  reviewStars: { letterSpacing: 2, fontSize: 14 },
  reviewCount: { fontSize: 13, color: "#757575", marginTop: 2 },
  reviewTitle: { fontWeight: "600", fontSize: 14, marginBottom: 4 },
  reviewBody: { fontSize: 14, color: "#444", lineHeight: 20 },
  reviewMeta: { fontSize: 12, color: "#757575", marginTop: 4, marginBottom: 8 },
});
