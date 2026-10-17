import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { Recipe } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { notify } from '../utils/alert';

type Props = {
  initial?: Recipe;
  onSubmit: (data: {
    title: string;
    description: string;
    ingredients: string[];
    steps: string[];
    groupIds: string[];
  }) => Promise<{ success: boolean; error?: string }>;
  submitLabel: string;
  title: string;
};

export default function RecipeForm({ initial, onSubmit, submitLabel, title }: Props) {
  const router = useRouter();
  const { groups } = useData();
  const [recipeTitle, setRecipeTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [steps, setSteps] = useState<string[]>(['']);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  useEffect(() => {
    if (initial) {
      setRecipeTitle(initial.title);
      setDescription(initial.description ?? '');
      setIngredients(initial.ingredients.length ? initial.ingredients : ['']);
      setSteps(initial.steps.length ? initial.steps : ['']);
      setSelectedGroups(initial.groupIds ?? []);
    }
  }, [initial?.id]);

  const updateItem = (
    list: string[], setList: (v: string[]) => void, i: number, v: string
  ) => {
    const copy = [...list];
    copy[i] = v;
    setList(copy);
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((g) => g !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSave = async () => {
    const cleanIngredients = ingredients.map((s) => s.trim()).filter(Boolean);
    const cleanSteps = steps.map((s) => s.trim()).filter(Boolean);

    if (!recipeTitle.trim()) return notify('Error', 'El título es obligatorio.');
    if (cleanIngredients.length === 0) return notify('Error', 'Añade al menos un ingrediente.');
    if (cleanSteps.length === 0) return notify('Error', 'Añade al menos un paso.');

    const result = await onSubmit({
      title: recipeTitle,
      description,
      ingredients: cleanIngredients,
      steps: cleanSteps,
      groupIds: selectedGroups,
    });

    if (!result.success) {
      notify('Error', result.error ?? 'Error desconocido');
      return;
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.label}>Título</Text>
        <TextInput style={styles.input} value={recipeTitle} onChangeText={setRecipeTitle} />

        <Text style={styles.label}>Descripción (opcional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.sectionTitle}>Ingredientes</Text>
        {ingredients.map((ing, i) => (
          <View key={`ing-${i}`} style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={ing}
              onChangeText={(v) => updateItem(ingredients, setIngredients, i, v)}
              placeholder={`Ingrediente ${i + 1}`}
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => ingredients.length > 1 && setIngredients(ingredients.filter((_, x) => x !== i))}
            >
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={() => setIngredients([...ingredients, ''])}>
          <Text style={styles.addText}>+ Añadir ingrediente</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Pasos</Text>
        {steps.map((step, i) => (
          <View key={`step-${i}`} style={styles.row}>
            <TextInput
              style={[styles.input, styles.multiline, { flex: 1, marginBottom: 0 }]}
              value={step}
              onChangeText={(v) => updateItem(steps, setSteps, i, v)}
              placeholder={`Paso ${i + 1}`}
              multiline
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => steps.length > 1 && setSteps(steps.filter((_, x) => x !== i))}
            >
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={() => setSteps([...steps, ''])}>
          <Text style={styles.addText}>+ Añadir paso</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Grupos</Text>
        {groups.length === 0 ? (
          <Text style={styles.noGroups}>No tienes grupos aún. Puedes crearlos en la pestaña Grupos.</Text>
        ) : (
          groups.map((g) => {
            const checked = selectedGroups.includes(g.id);
            return (
              <TouchableOpacity
                key={g.id}
                style={styles.groupRow}
                onPress={() => toggleGroup(g.id)}
              >
                <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                  {checked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.groupName}>{g.name}</Text>
              </TouchableOpacity>
            );
          })
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>{submitLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancel} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, paddingBottom: 60, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, color: '#666', marginBottom: 4, marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 24, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, fontSize: 15, marginBottom: 8,
  },
  multiline: { minHeight: 60, textAlignVertical: 'top' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  removeButton: {
    backgroundColor: '#eee', width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  removeText: { color: '#c0392b', fontWeight: 'bold' },
  addButton: { paddingVertical: 8 },
  addText: { color: '#e67e22', fontWeight: '600' },
  noGroups: { color: '#999', fontStyle: 'italic', marginBottom: 8 },
  groupRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkbox: {
    width: 22, height: 22, borderWidth: 2, borderColor: '#ccc',
    borderRadius: 4, marginRight: 10, alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#e67e22', borderColor: '#e67e22' },
  checkmark: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  groupName: { fontSize: 15 },
  saveButton: {
    backgroundColor: '#e67e22', padding: 14, borderRadius: 8,
    alignItems: 'center', marginTop: 32,
  },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancel: { alignItems: 'center', marginTop: 14, padding: 12 },
  cancelText: { color: '#666' },
});