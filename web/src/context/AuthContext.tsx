import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User, UserRole } from "../types";
import {
  loadSession,
  login as doLogin,
  loginWithPhone as doLoginWithPhone,
  logout as doLogout,
  registerUserWithPhone as doRegisterUserWithPhone,
} from "../data/users";
import { emptySellerProfile, saveSellerProfile } from "../utils/sellerProfile";

interface RegisterParams {
  phone: string;
  firstName: string;
  lastName: string;
  role: "user" | "seller";
  email?: string;
  storeName?: string;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => boolean;
  loginWithPhone: (phone: string) => boolean;
  registerWithPhone: (params: RegisterParams) => User;
  logout: () => void;
  isRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(loadSession());
  }, []);

  const login = (email: string, password: string) => {
    const found = doLogin(email, password);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const loginWithPhone = (phone: string) => {
    const found = doLoginWithPhone(phone);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const registerWithPhone = (params: RegisterParams) => {
    const newUser = doRegisterUserWithPhone(params);
    if (newUser.role === "seller") {
      saveSellerProfile(newUser.id, {
        ...emptySellerProfile(),
        firstName: params.firstName.trim(),
        lastName: params.lastName.trim(),
        phone: newUser.phone ?? "",
        email: params.email?.trim() ?? "",
      });
    }
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    doLogout();
    setUser(null);
  };

  const isRole = (role: UserRole) => user?.role === role;

  const value = useMemo(
    () => ({ user, login, loginWithPhone, registerWithPhone, logout, isRole }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
