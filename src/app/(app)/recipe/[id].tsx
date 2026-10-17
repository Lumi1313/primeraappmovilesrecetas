import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useData } from '../../../context/DataContext';
import { confirm } from '../../../utils/alert';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getRecipeById, deleteRecipe, groups } = useData();
  const recipe = getRecipeById(id);

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Receta no encontrada.</Text>
      </View>
    );
  }

  const inGroups = groups.filter((g) => g.recipeIds.includes(recipe.id));

  const handleDelete = () => {
    confirm(
      'Borrar receta',
      `¿Borrar "${recipe.title}"? Esta acción no se puede deshacer.`,
      async () => {
        await deleteRecipe(recipe.id);
        router.back();
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{recipe.title}</Text>
      {recipe.description ? (
        <Text style={styles.description}>{recipe.description}</Text>
      ) : null}

      {inGroups.length > 0 && (
        <View style={styles.groupsBox}>
          <Text style={styles.groupsLabel}>Grupos:</Text>
          <Text style={styles.groupsValue}>
            {inGroups.map((g) => g.name).join(', ')}
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Ingredientes</Text>
      {recipe.ingredients.map((ing, i) => (
        <Text key={i} style={styles.item}>• {ing}</Text>
      ))}

      <Text style={styles.sectionTitle}>Pasos</Text>
      {recipe.steps.map((step, i) => (
        <View key={i} style={styles.stepRow}>
          <Text style={styles.stepNumber}>{i + 1}.</Text>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.button, styles.editButton]}
        onPress={() => router.push(`/(app)/recipe/edit/${recipe.id}`)}
      >
        <Text style={styles.buttonText}>Editar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={handleDelete}
      >
        <Text style={styles.buttonText}>Borrar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancel} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, paddingBottom: 60, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 15, color: '#555', marginBottom: 16, fontStyle: 'italic' },
  groupsBox: {
    backgroundColor: '#f0f7ff', padding: 12, borderRadius: 8, marginBottom: 16,
  },
  groupsLabel: { fontSize: 13, color: '#888' },
  groupsValue: { fontSize: 15, fontWeight: '500', color: '#2c6fbb' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  item: { fontSize: 15, marginBottom: 4 },
  stepRow: { flexDirection: 'row', marginBottom: 8 },
  stepNumber: { fontWeight: 'bold', marginRight: 8, color: '#e67e22' },
  stepText: { flex: 1, fontSize: 15, lineHeight: 20 },
  error: { fontSize: 16, textAlign: 'center', marginTop: 40, color: '#666' },
  button: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  editButton: { backgroundColor: '#e67e22' },
  deleteButton: { backgroundColor: '#c0392b' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancel: { alignItems: 'center', marginTop: 16, padding: 12 },
  cancelText: { color: '#666' },
});