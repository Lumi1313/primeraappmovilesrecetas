import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  USERS: '@recetas_users',
  SESSION: '@recetas_session',
  RECIPES: '@recetas_recipes',
  GROUPS: '@recetas_groups',
} as const;

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return null;
  }
}

export async function setItem(key: string, value: unknown): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    return false;
  }
}

export async function removeItem(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    return false;
  }
}