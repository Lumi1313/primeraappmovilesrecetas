import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { KEYS, getItem, removeItem, setItem } from '../utils/storage';

// ---------- Types ----------
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

export type Recipe = {
  id: string;
  userId: string;
  title: string;
  ingredients: string[];
  steps: string[];
  description?: string;
  groupIds: string[];
  createdAt: string;
};

export type Group = {
  id: string;
  userId: string;
  name: string;
  recipeIds: string[];
  createdAt: string;
};

type RegisterInput = { name: string; email: string; password: string };
type LoginInput = { email: string; password: string };
type UpdateInput = Partial<Pick<User, 'name' | 'email' | 'password'>>;
type Result = { success: true } | { success: false; error: string };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  register: (input: RegisterInput) => Promise<Result>;
  login: (input: LoginInput) => Promise<Result>;
  logout: () => Promise<void>;
  updateProfile: (updates: UpdateInput) => Promise<Result>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// ---------- Provider ----------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const session = await getItem<User>(KEYS.SESSION);
      if (session) setUser(session);
      setLoading(false);
    })();
  }, []);

  const register = async ({ name, email, password }: RegisterInput): Promise<Result> => {
    const users = (await getItem<User[]>(KEYS.USERS)) || [];

    const exists = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) return { success: false, error: 'Este correo ya está registrado.' };

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    await setItem(KEYS.USERS, [...users, newUser]);
    await setItem(KEYS.SESSION, newUser);
    setUser(newUser);
    return { success: true };
  };

  const login = async ({ email, password }: LoginInput): Promise<Result> => {
    const users = (await getItem<User[]>(KEYS.USERS)) || [];
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    );
    if (!found) return { success: false, error: 'Credenciales incorrectas.' };

    await setItem(KEYS.SESSION, found);
    setUser(found);
    return { success: true };
  };

  const logout = async () => {
    await removeItem(KEYS.SESSION);
    setUser(null);
  };

  const updateProfile = async (updates: UpdateInput): Promise<Result> => {
    if (!user) return { success: false, error: 'No hay sesión activa.' };

    const users = (await getItem<User[]>(KEYS.USERS)) || [];
    const updated: User = { ...user, ...updates };

    const emailTaken = users.some(
      (u) =>
        u.id !== user.id &&
        u.email.toLowerCase() === updated.email.toLowerCase()
    );
    if (emailTaken) return { success: false, error: 'Ese correo ya está en uso.' };

    const newUsers = users.map((u) => (u.id === user.id ? updated : u));
    await setItem(KEYS.USERS, newUsers);
    await setItem(KEYS.SESSION, updated);
    setUser(updated);
    return { success: true };
  };

  const deleteAccount = async () => {
    if (!user) return;

    const users = (await getItem<User[]>(KEYS.USERS)) || [];
    await setItem(KEYS.USERS, users.filter((u) => u.id !== user.id));

    const recipes = (await getItem<Recipe[]>(KEYS.RECIPES)) || [];
    await setItem(KEYS.RECIPES, recipes.filter((r) => r.userId !== user.id));

    const groups = (await getItem<Group[]>(KEYS.GROUPS)) || [];
    await setItem(KEYS.GROUPS, groups.filter((g) => g.userId !== user.id));

    await removeItem(KEYS.SESSION);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout, updateProfile, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}