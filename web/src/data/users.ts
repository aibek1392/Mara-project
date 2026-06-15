import type { User } from "../types";
import { normalizePhone } from "../utils/phone";

export const DEFAULT_USERS: User[] = [
  {
    id: "owner-1",
    email: "owner@door2door.com",
    password: "123456",
    name: "Админ Владелец",
    role: "owner",
  },
  {
    id: "user-1",
    email: "user@door2door.com",
    password: "123456",
    name: "Иван Покупатель",
    role: "user",
    phone: "+996700111111",
  },
  {
    id: "seller-1",
    email: "seller@door2door.com",
    password: "123456",
    name: "Сара Продавец",
    role: "seller",
    phone: "+996700222222",
    storeName: "Магазин Сары Door 2 Door",
  },
  {
    id: "shipping-1",
    email: "shipping@door2door.com",
    password: "123456",
    name: "Айбек Менеджер",
    role: "shipping_manager",
    phone: "+996700333333",
  },
  {
    id: "driver-1",
    email: "driver@door2door.com",
    password: "123456",
    name: "Нурлан Водитель",
    role: "delivery_driver",
    phone: "+996700444444",
  },
];

const USERS_KEY = "door2door_users";
const SESSION_KEY = "door2door_session";

export function loadUsers(): User[] {
  const stored = localStorage.getItem(USERS_KEY);
  let users: User[];
  if (stored) {
    try {
      users = JSON.parse(stored) as User[];
    } catch {
      users = [...DEFAULT_USERS];
    }
  } else {
    users = [...DEFAULT_USERS];
  }
  for (const demo of DEFAULT_USERS) {
    if (!users.some((u) => u.email.toLowerCase() === demo.email.toLowerCase())) {
      users.push(demo);
    }
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return users;
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserByPhone(phone: string): User | null {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return (
    loadUsers().find((u) => u.phone && normalizePhone(u.phone) === normalized) ?? null
  );
}

export function createUser(user: Omit<User, "id"> & { id?: string }): User {
  const users = loadUsers();
  const newUser: User = {
    ...user,
    id: user.id ?? `user-${Date.now()}`,
    phone: user.phone ? normalizePhone(user.phone) : undefined,
  };
  if (users.some((u) => u.email.toLowerCase() === newUser.email.toLowerCase())) {
    throw new Error("EMAIL_EXISTS");
  }
  if (
    newUser.phone &&
    users.some((u) => u.phone && normalizePhone(u.phone) === newUser.phone)
  ) {
    throw new Error("PHONE_EXISTS");
  }
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function registerUserWithPhone(params: {
  phone: string;
  firstName: string;
  lastName: string;
  role: "user" | "seller";
  email?: string;
  storeName?: string;
}): User {
  const normalized = normalizePhone(params.phone);
  if (!normalized) throw new Error("INVALID_PHONE");
  if (findUserByPhone(normalized)) throw new Error("PHONE_EXISTS");

  const name = `${params.firstName} ${params.lastName}`.trim();
  const email =
    params.email?.trim() ||
    `${normalized.replace(/\D/g, "")}@phone.door2door.local`;

  const user = createUser({
    email,
    password: String(Math.floor(100000 + Math.random() * 900000)),
    name,
    role: params.role,
    phone: normalized,
    storeName: params.role === "seller" ? params.storeName?.trim() || name : undefined,
  });
  saveSession(user);
  return user;
}

export function loginWithPhone(phone: string): User | null {
  const user = findUserByPhone(phone);
  if (user) saveSession(user);
  return user ?? null;
}

export function updateUser(userId: string, patch: Partial<User>): User | null {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return null;
  users[idx] = { ...users[idx], ...patch };
  saveUsers(users);
  return users[idx];
}

export function getUsersByRole(role: User["role"]): User[] {
  return loadUsers().filter((u) => u.role === role);
}

export function createDeliveryDriver(params: {
  name: string;
  email: string;
  phone?: string;
  password?: string;
}): User {
  const name = params.name.trim();
  const email = params.email.trim().toLowerCase();
  if (!name) throw new Error("NAME_REQUIRED");
  if (!email || !/\S+@\S+\.\S+/.test(email)) throw new Error("EMAIL_INVALID");

  return createUser({
    email,
    password: params.password?.trim() || "123456",
    name,
    role: "delivery_driver",
    phone: params.phone?.trim(),
  });
}

export function loadSession(): User | null {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    const session = JSON.parse(stored) as { userId: string };
    const users = loadUsers();
    return users.find((u) => u.id === session.userId) ?? null;
  } catch {
    return null;
  }
}

export function saveSession(user: User | null) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function login(email: string, password: string): User | null {
  const users = loadUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (user) saveSession(user);
  return user ?? null;
}

export function logout() {
  saveSession(null);
}
