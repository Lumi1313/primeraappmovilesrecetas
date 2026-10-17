import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { notify } from '../../../utils/alert';

export default function GroupsScreen() {
  const { user } = useAuth();
  const { groups, createGroup } = useData();
  const router = useRouter();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const myGroups = groups
    .filter((g) => g.userId === user?.id)
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleCreate = async () => {
    if (!newName.trim()) return notify('Error', 'Escribe un nombre.');
    const result = await createGroup({ name: newName });
    if (!result.success) return notify('Error', result.error);
    setNewName('');
    setCreating(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Grupos</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/(app)/(tabs)/profile')}
        >
          <Text style={styles.profileButtonText}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {creating ? (
        <View style={styles.createBox}>
          <TextInput
            style={styles.input}
            placeholder="Nombre del grupo"
            value={newName}
            onChangeText={setNewName}
            autoFocus
          />
          <View style={styles.createRow}>
            <TouchableOpacity style={styles.saveSmall} onPress={handleCreate}>
              <Text style={styles.saveSmallText}>Crear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelSmall}
              onPress={() => { setCreating(false); setNewName(''); }}
            >
              <Text style={styles.cancelSmallText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.newButton} onPress={() => setCreating(true)}>
          <Text style={styles.newButtonText}>+ Nuevo Grupo</Text>
        </TouchableOpacity>
      )}

      {myGroups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aún no tienes grupos.</Text>
        </View>
      ) : (
        <FlatList
          data={myGroups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(app)/group/${item.id}`)}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardCount}>
                {item.recipeIds.length} receta{item.recipeIds.length !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: 'bold' },
  profileButton: {
    backgroundColor: '#34495e', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6,
  },
  profileButtonText: { color: '#fff', fontWeight: '600' },
  createBox: { paddingHorizontal: 20, marginBottom: 12 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, fontSize: 15, marginBottom: 8,
  },
  createRow: { flexDirection: 'row', gap: 8 },
  saveSmall: {
    backgroundColor: '#e67e22', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6,
  },
  saveSmallText: { color: '#fff', fontWeight: '600' },
  cancelSmall: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelSmallText: { color: '#666' },
  newButton: {
    marginHorizontal: 20, marginBottom: 12, backgroundColor: '#e67e22',
    padding: 12, borderRadius: 8, alignItems: 'center',
  },
  newButtonText: { color: '#fff', fontWeight: 'bold' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
  card: {
    backgroundColor: '#f7f7f7', borderRadius: 12, padding: 16,
    marginHorizontal: 20, marginBottom: 12,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  cardCount: { fontSize: 13, color: '#888' },
});