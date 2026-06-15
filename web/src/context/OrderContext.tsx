import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Order, OrderLineItem, OrderStatus, SellerNotification } from "../types";
import type { CheckoutFormData } from "../utils/checkout";
import { generateDeliveryOtp, getExpectedRecipientName, recipientNamesMatch, type ConfirmDeliveryResult } from "../utils/deliveryOtp";
import { allSellerItemsDropped, buildShippingAddress, sortOrdersForRouting } from "../utils/orderShipping";
import { getUsersByRole, createDeliveryDriver } from "../data/users";

const ORDERS_KEY = "door2door_orders";
const NOTIFICATIONS_KEY = "door2door_notifications";

function loadOrders(): Order[] {
  try {
    const stored = localStorage.getItem(ORDERS_KEY);
    return stored ? (JSON.parse(stored) as Order[]) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function loadNotifications(): SellerNotification[] {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? (JSON.parse(stored) as SellerNotification[]) : [];
  } catch {
    return [];
  }
}

function saveNotifications(notifications: SellerNotification[]) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

interface PlaceOrderInput {
  userId: string;
  userName: string;
  items: CartItem[];
  total: number;
  shipping: CheckoutFormData;
}

interface DeliveryDriverSummary {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AddDriverInput {
  name: string;
  email: string;
  phone?: string;
  password?: string;
}

interface OrderContextValue {
  orders: Order[];
  placeOrder: (input: PlaceOrderInput) => string;
  getOrdersForUser: (userId: string) => Order[];
  getOrdersForSeller: (sellerId: string) => Order[];
  getOrdersForShipping: () => Order[];
  getOrdersForDriver: (driverId: string) => Order[];
  deliveryDrivers: DeliveryDriverSummary[];
  addDeliveryDriver: (input: AddDriverInput) => DeliveryDriverSummary;
  getDeliveryDrivers: () => DeliveryDriverSummary[];
  markPostalDropOff: (orderId: string, productId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => void;
  assignDriver: (orderId: string, driverId: string, driverName: string) => void;
  assignOrdersToDriver: (orderIds: string[], driverId: string, driverName: string) => void;
  confirmDelivery: (
    orderId: string,
    driverId: string,
    recipientName: string,
    code: string
  ) => ConfirmDeliveryResult;
  requestReturn: (orderId: string, productId: string, userId: string) => void;
  notifications: SellerNotification[];
  getNotificationsForSeller: (sellerId: string) => SellerNotification[];
  unreadNotificationCount: (sellerId: string) => number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (sellerId: string) => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<SellerNotification[]>([]);
  const [deliveryDrivers, setDeliveryDrivers] = useState<DeliveryDriverSummary[]>([]);

  const refreshDrivers = useCallback(() => {
    setDeliveryDrivers(
      getUsersByRole("delivery_driver").map((d) => ({
        id: d.id,
        name: d.name,
        email: d.email,
        phone: d.phone,
      }))
    );
  }, []);

  useEffect(() => {
    setOrders(loadOrders());
    setNotifications(loadNotifications());
    refreshDrivers();
  }, [refreshDrivers]);

  const patchOrder = useCallback(
    (orderId: string, updater: (order: Order) => Order) => {
      setOrders((prev) => {
        const next = prev.map((o) => (o.id === orderId ? updater(o) : o));
        saveOrders(next);
        return next;
      });
    },
    []
  );

  const placeOrder = useCallback((input: PlaceOrderInput): string => {
    const orderId = `D2D-${Date.now().toString(36).toUpperCase()}`;
    const lineItems: OrderLineItem[] = input.items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      sellerId: item.product.sellerId ?? "platform",
      sellerName: item.product.sellerName ?? "Door 2 Door",
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: item.product.price,
      costPrice: item.product.costPrice,
      image: item.product.image,
      postalDroppedOff: false,
      returnStatus: "none",
    }));

    const now = new Date().toISOString();
    const order: Order = {
      id: orderId,
      userId: input.userId,
      userName: input.userName,
      items: lineItems,
      total: input.total,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      shippingAddress: buildShippingAddress(input.shipping),
      shippingMethod: input.shipping.shippingMethod,
    };

    setOrders((prev) => {
      const next = [order, ...prev];
      saveOrders(next);
      return next;
    });

    const sellerIds = new Set(
      lineItems.filter((i) => i.sellerId !== "platform").map((i) => i.sellerId)
    );
    if (sellerIds.size > 0) {
      setNotifications((prev) => {
        const newNotifs: SellerNotification[] = [];
        for (const item of lineItems) {
          if (item.sellerId === "platform") continue;
          newNotifs.push({
            id: `notif-${Date.now()}-${item.productId}`,
            sellerId: item.sellerId,
            type: "new_order",
            orderId,
            productId: item.productId,
            productName: item.productName,
            customerName: input.userName,
            read: false,
            createdAt: now,
          });
        }
        const next = [...newNotifs, ...prev];
        saveNotifications(next);
        return next;
      });
    }

    return orderId;
  }, []);

  const getOrdersForUser = useCallback(
    (userId: string) => orders.filter((o) => o.userId === userId),
    [orders]
  );

  const getOrdersForSeller = useCallback(
    (sellerId: string) =>
      orders.filter((o) => o.items.some((i) => i.sellerId === sellerId)),
    [orders]
  );

  const getOrdersForShipping = useCallback(
    () => sortOrdersForRouting(orders),
    [orders]
  );

  const getOrdersForDriver = useCallback(
    (driverId: string) =>
      sortOrdersForRouting(
        orders.filter(
          (o) =>
            o.assignedDriverId === driverId &&
            o.status !== "delivered" &&
            o.status !== "shipped"
        )
      ),
    [orders]
  );

  const getDeliveryDrivers = useCallback(
    () => deliveryDrivers,
    [deliveryDrivers]
  );

  const addDeliveryDriver = useCallback(
    (input: AddDriverInput): DeliveryDriverSummary => {
      const user = createDeliveryDriver(input);
      const summary: DeliveryDriverSummary = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      };
      refreshDrivers();
      return summary;
    },
    [refreshDrivers]
  );

  const markPostalDropOff = useCallback(
    (orderId: string, productId: string) => {
      patchOrder(orderId, (order) => {
        const items = order.items.map((item) =>
          item.productId === productId ? { ...item, postalDroppedOff: true } : item
        );
        let status = order.status;
        if (order.status === "pending") status = "processing";
        if (allSellerItemsDropped({ ...order, items })) {
          status = "ready_for_pickup";
        }
        return {
          ...order,
          items,
          status,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [patchOrder]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus, notes?: string) => {
      patchOrder(orderId, (order) => ({
        ...order,
        status,
        shippingNotes: notes ?? order.shippingNotes,
        updatedAt: new Date().toISOString(),
      }));
    },
    [patchOrder]
  );

  const assignDriver = useCallback(
    (orderId: string, driverId: string, driverName: string) => {
      const now = new Date().toISOString();
      patchOrder(orderId, (order) => ({
        ...order,
        assignedDriverId: driverId,
        assignedDriverName: driverName,
        status: "assigned",
        deliveryOtp: generateDeliveryOtp(),
        deliveryOtpGeneratedAt: now,
        updatedAt: now,
      }));
    },
    [patchOrder]
  );

  const assignOrdersToDriver = useCallback(
    (orderIds: string[], driverId: string, driverName: string) => {
      const idSet = new Set(orderIds);
      const now = new Date().toISOString();
      setOrders((prev) => {
        const next = prev.map((order) => {
          if (!idSet.has(order.id)) return order;
          return {
            ...order,
            assignedDriverId: driverId,
            assignedDriverName: driverName,
            status: "assigned" as OrderStatus,
            deliveryOtp: generateDeliveryOtp(),
            deliveryOtpGeneratedAt: now,
            updatedAt: now,
          };
        });
        saveOrders(next);
        return next;
      });
    },
    []
  );

  const confirmDelivery = useCallback(
    (
      orderId: string,
      driverId: string,
      recipientName: string,
      code: string
    ): ConfirmDeliveryResult => {
      let result: ConfirmDeliveryResult = "not_found";
      const trimmedCode = code.trim();

      setOrders((prev) => {
        const order = prev.find((o) => o.id === orderId);
        if (!order) return prev;
        if (order.assignedDriverId !== driverId) {
          result = "wrong_driver";
          return prev;
        }
        if (order.status !== "out_for_delivery") {
          result = "wrong_status";
          return prev;
        }
        if (!order.deliveryOtp) {
          result = "no_otp";
          return prev;
        }
        const expectedName = getExpectedRecipientName(order);
        if (!recipientNamesMatch(expectedName, recipientName)) {
          result = "wrong_name";
          return prev;
        }
        if (trimmedCode !== order.deliveryOtp) {
          result = "wrong_code";
          return prev;
        }

        result = "ok";
        const now = new Date().toISOString();
        const next = prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: "delivered" as OrderStatus,
                deliveredAt: now,
                deliveryConfirmedRecipientName: recipientName.trim(),
                updatedAt: now,
              }
            : o
        );
        saveOrders(next);
        return next;
      });

      return result;
    },
    []
  );

  const requestReturn = useCallback(
    (orderId: string, productId: string, userId: string) => {
      let sellerId = "";
      let productName = "";
      let customerName = "";

      setOrders((prev) => {
        const next = prev.map((order) => {
          if (order.id !== orderId || order.userId !== userId) return order;
          customerName = order.userName;
          return {
            ...order,
            items: order.items.map((item) => {
              if (item.productId !== productId) return item;
              sellerId = item.sellerId;
              productName = item.productName;
              return { ...item, returnStatus: "requested" as const };
            }),
            updatedAt: new Date().toISOString(),
          };
        });
        saveOrders(next);
        return next;
      });

      if (sellerId && sellerId !== "platform") {
        setNotifications((prev) => {
          const notif: SellerNotification = {
            id: `notif-return-${Date.now()}`,
            sellerId,
            type: "return_requested",
            orderId,
            productId,
            productName,
            customerName,
            read: false,
            createdAt: new Date().toISOString(),
          };
          const next = [notif, ...prev];
          saveNotifications(next);
          return next;
        });
      }
    },
    []
  );

  const getNotificationsForSeller = useCallback(
    (sellerId: string) =>
      notifications
        .filter((n) => n.sellerId === sellerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notifications]
  );

  const unreadNotificationCount = useCallback(
    (sellerId: string) =>
      notifications.filter((n) => n.sellerId === sellerId && !n.read).length,
    [notifications]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(next);
      return next;
    });
  }, []);

  const markAllNotificationsRead = useCallback((sellerId: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) =>
        n.sellerId === sellerId ? { ...n, read: true } : n
      );
      saveNotifications(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      orders,
      placeOrder,
      getOrdersForUser,
      getOrdersForSeller,
      getOrdersForShipping,
      getOrdersForDriver,
      deliveryDrivers,
      addDeliveryDriver,
      getDeliveryDrivers,
      markPostalDropOff,
      updateOrderStatus,
      assignDriver,
      assignOrdersToDriver,
      confirmDelivery,
      requestReturn,
      notifications,
      getNotificationsForSeller,
      unreadNotificationCount,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      orders,
      placeOrder,
      getOrdersForUser,
      getOrdersForSeller,
      getOrdersForShipping,
      getOrdersForDriver,
      deliveryDrivers,
      addDeliveryDriver,
      getDeliveryDrivers,
      markPostalDropOff,
      updateOrderStatus,
      assignDriver,
      assignOrdersToDriver,
      confirmDelivery,
      requestReturn,
      notifications,
      getNotificationsForSeller,
      unreadNotificationCount,
      markNotificationRead,
      markAllNotificationsRead,
    ]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}
