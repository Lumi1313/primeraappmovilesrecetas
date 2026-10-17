import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useData } from '../../../context/DataContext';
import { confirm, notify } from '../../../utils/alert';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getGroupById, updateGroup, deleteGroup, recipes, removeRecipeFromGroup } = useData();
  const group = getGroupById(id);

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(group?.name ?? '');

  if (!group) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Grupo no encontrado.</Text>
      </View>
    );
  }

  const groupRecipes = recipes
    .filter((r) => group.recipeIds.includes(r.id))
    .sort((a, b) => a.title.localeCompare(b.title));

  const handleRename = async () => {
    if (!newName.trim()) return notify('Error', 'El nombre no puede estar vacío.');
    const result = await updateGroup(group.id, { name: newName });
    if (!result.success) return notify('Error', result.error);
    setEditing(false);
  };

  const handleDelete = () => {
    const count = groupRecipes.length;
    confirm(
      'Borrar grupo',
      count > 0
        ? `Al borrar este grupo se eliminarán también ${count} receta(s) asociada(s). ¿Continuar?`
        : '¿Borrar este grupo?',
      async () => {
        await deleteGroup(group.id);
        router.back();
      }
    );
  };

  const handleRemoveRecipe = (recipeId: string, recipeTitle: string) => {
    confirm(
      'Quitar del grupo',
      `"${recipeTitle}" saldrá del grupo, pero seguirá existiendo en tus recetas. ¿Continuar?`,
      async () => {
        await removeRecipeFromGroup(recipeId, group.id);
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {editing ? (
        <View style={styles.editNameBox}>
          <TextInput style={styles.input} value={newName} onChangeText={setNewName} autoFocus />
          <View style={styles.editButtons}>
            <TouchableOpacity style={styles.smallSave} onPress={handleRename}>
              <Text style={styles.smallSaveText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallCancel}
              onPress={() => { setEditing(false); setNewName(group.name); }}
            >
              <Text style={styles.smallCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.titleRow}>
          <Text style={styles.title}>{group.name}</Text>
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Text style={styles.renameLink}>Renombrar</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>
        Recetas en este grupo ({groupRecipes.length})
      </Text>

      {groupRecipes.length === 0 ? (
        <Text style={styles.empty}>Este grupo no tiene recetas aún.</Text>
      ) : (
        groupRecipes.map((r) => (
          <View key={r.id} style={styles.recipeRow}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => router.push(`/(app)/recipe/${r.id}`)}
            >
              <Text style={styles.recipeTitle}>{r.title}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveRecipe(r.id, r.title)}
            >
              <Text style={styles.removeText}>Quitar</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
        <Text style={styles.buttonText}>Borrar Grupo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancel} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, paddingBottom: 60, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 26, fontWeight: 'bold', flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  renameLink: { color: '#e67e22', fontWeight: '600' },
  editNameBox: { marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, fontSize: 15, marginBottom: 8,
  },
  editButtons: { flexDirection: 'row', gap: 8 },
  smallSave: { backgroundColor: '#e67e22', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  smallSaveText: { color: '#fff', fontWeight: '600' },
  smallCancel: { paddingHorizontal: 14, paddingVertical: 8 },
  smallCancelText: { color: '#666' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#333' },
  empty: { color: '#999', fontStyle: 'italic', marginBottom: 20 },
  recipeRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f7f7f7', borderRadius: 8, padding: 12, marginBottom: 8,
  },
  recipeTitle: { fontSize: 15, fontWeight: '500' },
  removeButton: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#c0392b',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6,
  },
  removeText: { color: '#c0392b', fontWeight: '600', fontSize: 13 },
  button: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  deleteButton: { backgroundColor: '#c0392b' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancel: { alignItems: 'center', marginTop: 16, padding: 12 },
  cancelText: { color: '#666' },
  error: { fontSize: 16, textAlign: 'center', marginTop: 40, color: '#666' },
});