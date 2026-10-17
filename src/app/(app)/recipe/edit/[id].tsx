import { useLocalSearchParams } from 'expo-router';
import RecipeForm from '../../../../components/RecipeForm';
import { useData } from '../../../../context/DataContext';

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRecipeById, updateRecipe } = useData();
  const recipe = getRecipeById(id);

  if (!recipe) return null;

  return (
    <RecipeForm
      title="Editar Receta"
      submitLabel="Guardar Cambios"
      initial={recipe}
      onSubmit={(data) => updateRecipe(recipe.id, data)}
    />
  );
}