import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { KEYS, getItem, setItem } from '../utils/storage';
import { Group, Recipe, useAuth } from './AuthContext';

type RecipeInput = {
  title: string;
  description?: string;
  ingredients: string[];
  steps: string[];
  groupIds?: string[];
};

type GroupInput = {
  name: string;
};

type Result = { success: true } | { success: false; error: string };

type DataContextType = {
  recipes: Recipe[];
  groups: Group[];
  loading: boolean;
  // Recipes
  createRecipe: (input: RecipeInput) => Promise<Result>;
  updateRecipe: (id: string, input: RecipeInput) => Promise<Result>;
  deleteRecipe: (id: string) => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
  // Groups
  createGroup: (input: GroupInput) => Promise<Result>;
  updateGroup: (id: string, input: GroupInput) => Promise<Result>;
  deleteGroup: (id: string) => Promise<void>;
  removeRecipeFromGroup: (recipeId: string, groupId: string) => Promise<void>;
  getGroupById: (id: string) => Group | undefined;
};

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data whenever user changes
  useEffect(() => {
    (async () => {
      setLoading(true);
      const allRecipes = (await getItem<Recipe[]>(KEYS.RECIPES)) || [];
      const allGroups = (await getItem<Group[]>(KEYS.GROUPS)) || [];
      setRecipes(allRecipes);
      setGroups(allGroups);
      setLoading(false);
    })();
  }, [user]);

  // ---------- Recipes ----------

      const createRecipe = useCallback(
    async (input: RecipeInput): Promise<Result> => {
      if (!user) return { success: false, error: 'No hay sesión activa.' };

      const title = input.title.trim();
      if (!title) return { success: false, error: 'El título es obligatorio.' };

      const duplicate = recipes.some(
        (r) => r.userId === user.id && r.title.toLowerCase() === title.toLowerCase()
      );
      if (duplicate) {
        return { success: false, error: 'Ya tienes una receta con ese título.' };
      }

      const newRecipe: Recipe = {
        id: Date.now().toString(),
        userId: user.id,
        title,
        description: input.description?.trim() || '',
        ingredients: input.ingredients,
        steps: input.steps,
        groupIds: input.groupIds ?? [],
        createdAt: new Date().toISOString(),
      };

      // Sync the group side: add this recipe to each selected group
      const updatedGroups = groups.map((g) =>
        (input.groupIds ?? []).includes(g.id)
          ? { ...g, recipeIds: [...g.recipeIds, newRecipe.id] }
          : { ...g, recipeIds: g.recipeIds }
      );

      const updatedRecipes = [...recipes, newRecipe];
      await setItem(KEYS.RECIPES, updatedRecipes);
      await setItem(KEYS.GROUPS, updatedGroups);
      setRecipes(updatedRecipes);
      setGroups(updatedGroups);
      return { success: true };
    },
    [recipes, groups, user]
  );

    const updateRecipe = useCallback(
    async (id: string, input: RecipeInput): Promise<Result> => {
      if (!user) return { success: false, error: 'No hay sesión activa.' };

      const title = input.title.trim();
      if (!title) return { success: false, error: 'El título es obligatorio.' };

      const duplicate = recipes.some(
        (r) =>
          r.id !== id &&
          r.userId === user.id &&
          r.title.toLowerCase() === title.toLowerCase()
      );
      if (duplicate) {
        return { success: false, error: 'Ya tienes una receta con ese título.' };
      }

      const newGroupIds = input.groupIds ?? [];

      const updatedRecipes = recipes.map((r) =>
        r.id === id
          ? {
              ...r,
              title,
              description: input.description?.trim() || '',
              ingredients: input.ingredients,
              steps: input.steps,
              groupIds: newGroupIds,
            }
          : r
      );

      // Sync group membership: add/remove this recipe id per group
      const updatedGroups = groups.map((g) => {
        const shouldBeIn = newGroupIds.includes(g.id);
        const isIn = g.recipeIds.includes(id);
        if (shouldBeIn && !isIn) {
          return { ...g, recipeIds: [...g.recipeIds, id] };
        }
        if (!shouldBeIn && isIn) {
          return { ...g, recipeIds: g.recipeIds.filter((rid) => rid !== id) };
        }
        return g;
      });

      await setItem(KEYS.RECIPES, updatedRecipes);
      await setItem(KEYS.GROUPS, updatedGroups);
      setRecipes(updatedRecipes);
      setGroups(updatedGroups);
      return { success: true };
    },
    [recipes, groups, user]
  );

  const deleteRecipe = useCallback(
    async (id: string) => {
      const updated = recipes.filter((r) => r.id !== id);
      await setItem(KEYS.RECIPES, updated);
      setRecipes(updated);

      // Also remove from any groups that reference it
      const updatedGroups = groups.map((g) => ({
        ...g,
        recipeIds: g.recipeIds.filter((rid) => rid !== id),
      }));
      await setItem(KEYS.GROUPS, updatedGroups);
      setGroups(updatedGroups);
    },
    [recipes, groups]
  );

  const getRecipeById = useCallback(
    (id: string) => recipes.find((r) => r.id === id),
    [recipes]
  );

  // ---------- Groups ----------

  const createGroup = useCallback(
    async (input: GroupInput): Promise<Result> => {
      if (!user) return { success: false, error: 'No hay sesión activa.' };

      const name = input.name.trim();
      if (!name) return { success: false, error: 'El nombre es obligatorio.' };

      const duplicate = groups.some(
        (g) => g.userId === user.id && g.name.toLowerCase() === name.toLowerCase()
      );
      if (duplicate) {
        return { success: false, error: 'Ya tienes un grupo con ese nombre.' };
      }

      const newGroup: Group = {
        id: Date.now().toString(),
        userId: user.id,
        name,
        recipeIds: [],
        createdAt: new Date().toISOString(),
      };

      const updated = [...groups, newGroup];
      await setItem(KEYS.GROUPS, updated);
      setGroups(updated);
      return { success: true };
    },
    [groups, user]
  );

  const updateGroup = useCallback(
    async (id: string, input: GroupInput): Promise<Result> => {
      if (!user) return { success: false, error: 'No hay sesión activa.' };

      const name = input.name.trim();
      if (!name) return { success: false, error: 'El nombre es obligatorio.' };

      const duplicate = groups.some(
        (g) =>
          g.id !== id &&
          g.userId === user.id &&
          g.name.toLowerCase() === name.toLowerCase()
      );
      if (duplicate) {
        return { success: false, error: 'Ya tienes un grupo con ese nombre.' };
      }

      const updated = groups.map((g) => (g.id === id ? { ...g, name } : g));
      await setItem(KEYS.GROUPS, updated);
      setGroups(updated);
      return { success: true };
    },
    [groups, user]
  );

  const deleteGroup = useCallback(
    async (id: string) => {
      // Per spec: deleting a group deletes its recipes too
      const group = groups.find((g) => g.id === id);
      if (!group) return;

      const recipeIdsToDelete = group.recipeIds;

      const updatedRecipes = recipes.filter((r) => !recipeIdsToDelete.includes(r.id));
      const updatedGroups = groups.filter((g) => g.id !== id);

      // Also remove deleted recipes from any *other* group's recipeIds
      const cleanedGroups = updatedGroups.map((g) => ({
        ...g,
        recipeIds: g.recipeIds.filter((rid) => !recipeIdsToDelete.includes(rid)),
      }));

      await setItem(KEYS.RECIPES, updatedRecipes);
      await setItem(KEYS.GROUPS, cleanedGroups);
      setRecipes(updatedRecipes);
      setGroups(cleanedGroups);
    },
    [recipes, groups]
  );

  const removeRecipeFromGroup = useCallback(
    async (recipeId: string, groupId: string) => {
      const updatedGroups = groups.map((g) =>
        g.id === groupId
          ? { ...g, recipeIds: g.recipeIds.filter((rid) => rid !== recipeId) }
          : g
      );
      await setItem(KEYS.GROUPS, updatedGroups);
      setGroups(updatedGroups);

      const updatedRecipes = recipes.map((r) =>
        r.id === recipeId
          ? { ...r, groupIds: r.groupIds.filter((gid) => gid !== groupId) }
          : r
      );
      await setItem(KEYS.RECIPES, updatedRecipes);
      setRecipes(updatedRecipes);
    },
    [recipes, groups]
  );

  const getGroupById = useCallback(
    (id: string) => groups.find((g) => g.id === id),
    [groups]
  );

  return (
    <DataContext.Provider
      value={{
        recipes,
        groups,
        loading,
        createRecipe,
        updateRecipe,
        deleteRecipe,
        getRecipeById,
        createGroup,
        updateGroup,
        deleteGroup,
        removeRecipeFromGroup,
        getGroupById,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}