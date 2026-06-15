import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../App";
import { useCart } from "../context/CartContext";
import {
  generateOrderNumber,
  getEstimatedTax,
  getShippingCost,
  type ShippingMethod,
} from "../utils/checkout";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CheckoutScreen() {
  const navigation = useNavigation<Nav>();
  const { items, subtotal, clearCart } = useCart();
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("standard");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (items.length === 0 && !orderNumber) {
      navigation.navigate("Tabs", { screen: "Home" } as never);
    }
  }, [items.length, orderNumber, navigation]);

  const shipping = getShippingCost(subtotal, shippingMethod);
  const tax = getEstimatedTax(subtotal);
  const total = subtotal + shipping + tax;

  if (items.length === 0 && !orderNumber) {
    return null;
  }

  if (orderNumber) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.confirm}>
          <View style={styles.confirmIcon}>
            <Text style={styles.confirmCheck}>✓</Text>
          </View>
          <Text style={styles.confirmTitle}>Thank you!</Text>
          <Text style={styles.confirmOrder}>Order {orderNumber}</Text>
          <Text style={styles.confirmSub}>
            Confirmation sent to {email || "your email"}
          </Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => navigation.navigate("Tabs")}
          >
            <Text style={styles.primaryBtnText}>Continue Shopping</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const placeOrder = () => {
    if (
      !email ||
      !firstName ||
      !lastName ||
      !address ||
      !city ||
      !state ||
      !zip ||
      !phone ||
      !cardName ||
      cardNumber.length < 16 ||
      !cardExpiry ||
      cardCvc.length < 3
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setOrderNumber(generateOrderNumber());
    clearCart();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Bag</Text>
      </Pressable>
      <Text style={styles.title}>Checkout</Text>
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>ORDER SUMMARY</Text>
        {items.map((item) => (
          <View
            key={`${item.product.id}-${item.size}-${item.color}`}
            style={styles.summaryItem}
          >
            <Image source={{ uri: item.product.image }} style={styles.thumb} />
            <View style={styles.summaryInfo}>
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
        <View style={styles.totals}>
          <View style={styles.row}>
            <Text>Subtotal</Text>
            <Text>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Shipping</Text>
            <Text>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</Text>
          </View>
          <View style={styles.row}>
            <Text>Tax</Text>
            <Text>${tax.toFixed(2)}</Text>
          </View>
          <Text style={styles.totalLine}>Total ${total.toFixed(2)}</Text>
        </View>

        <Text style={styles.sectionTitle}>DELIVERY</Text>
        <TextInput
          style={styles.input}
          placeholder="Email *"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.rowInputs}>
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="First name *"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="Last name *"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Address *"
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="City *"
          value={city}
          onChangeText={setCity}
        />
        <View style={styles.rowInputs}>
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="State *"
            value={state}
            onChangeText={setState}
          />
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="ZIP *"
            value={zip}
            onChangeText={setZip}
            keyboardType="number-pad"
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Phone *"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.sectionTitle}>SHIPPING</Text>
        <Pressable
          style={[
            styles.shipOption,
            shippingMethod === "standard" && styles.shipSelected,
          ]}
          onPress={() => setShippingMethod("standard")}
        >
          <Text style={styles.shipTitle}>Standard — 4–7 days</Text>
          <Text style={styles.shipSub}>
            {subtotal >= 150 ? "Free" : "$8.00"}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.shipOption,
            shippingMethod === "express" && styles.shipSelected,
          ]}
          onPress={() => setShippingMethod("express")}
        >
          <Text style={styles.shipTitle}>Express — 2–3 days</Text>
          <Text style={styles.shipSub}>$15.00</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>PAYMENT</Text>
        <Text style={styles.demoNote}>Demo — no real charges.</Text>
        <TextInput
          style={styles.input}
          placeholder="Name on card *"
          value={cardName}
          onChangeText={setCardName}
        />
        <TextInput
          style={styles.input}
          placeholder="Card number (16 digits) *"
          value={cardNumber}
          onChangeText={(t) => setCardNumber(t.replace(/\D/g, "").slice(0, 16))}
          keyboardType="number-pad"
        />
        <View style={styles.rowInputs}>
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="MM/YY *"
            value={cardExpiry}
            onChangeText={setCardExpiry}
          />
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="CVC *"
            value={cardCvc}
            onChangeText={(t) => setCardCvc(t.replace(/\D/g, "").slice(0, 4))}
            keyboardType="number-pad"
            secureTextEntry
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.primaryBtn} onPress={placeOrder}>
          <Text style={styles.primaryBtnText}>
            Place Order · ${total.toFixed(2)}
          </Text>
        </Pressable>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  back: { paddingHorizontal: 20, paddingTop: 8 },
  backText: { fontSize: 15, fontWeight: "500" },
  title: {
    fontSize: 24,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  scroll: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 10,
    color: "#757575",
  },
  summaryItem: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  thumb: { width: 56, height: 56, borderRadius: 4, backgroundColor: "#f5f5f5" },
  summaryInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: "500" },
  itemMeta: { fontSize: 12, color: "#757575", marginTop: 2 },
  itemPrice: { fontSize: 13, fontWeight: "600", marginTop: 4 },
  totals: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  totalLine: { fontSize: 17, fontWeight: "700", marginTop: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: "#e5e5e5",
    borderRadius: 4,
    padding: 12,
    fontSize: 15,
    marginBottom: 10,
  },
  rowInputs: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  shipOption: {
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#e5e5e5",
    borderRadius: 4,
    marginBottom: 8,
  },
  shipSelected: { borderColor: "#111" },
  shipTitle: { fontWeight: "600", fontSize: 14 },
  shipSub: { fontSize: 13, color: "#757575", marginTop: 2 },
  demoNote: { fontSize: 12, color: "#757575", marginBottom: 8 },
  error: { color: "#c00", fontSize: 13, marginBottom: 8 },
  primaryBtn: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  primaryBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginBottom: 20 },
  confirm: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  confirmIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  confirmCheck: { color: "#fff", fontSize: 28 },
  confirmTitle: { fontSize: 24, fontWeight: "700" },
  confirmOrder: { fontSize: 16, marginTop: 8 },
  confirmSub: { color: "#757575", marginTop: 8, textAlign: "center" },
});
