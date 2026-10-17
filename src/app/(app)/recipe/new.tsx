import RecipeForm from '../../../components/RecipeForm';
import { useData } from '../../../context/DataContext';

export default function NewRecipeScreen() {
  const { createRecipe } = useData();
  return (
    <RecipeForm
      title="Nueva Receta"
      submitLabel="Crear Receta"
      onSubmit={createRecipe}
    />
  );
}