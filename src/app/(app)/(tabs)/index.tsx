import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';

export default function AppHome() {
  const { user } = useAuth();
  const { recipes } = useData();
  const router = useRouter();

  // Personal recipes: this user's, alphabetically sorted
  const personalRecipes = recipes
    .filter((r) => r.userId === user?.id)
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Recetas</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/(app)/(tabs)/profile')}
        >
          <Text style={styles.profileButtonText}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {personalRecipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aún no tienes recetas.</Text>
          <Text style={styles.emptySubtext}>Toca "Nueva Receta" para empezar.</Text>
        </View>
      ) : (
        <FlatList
          data={personalRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(app)/recipe/${item.id}`)}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(app)/recipe/new')}
      >
        <Text style={styles.fabText}>+ Nueva Receta</Text>
      </TouchableOpacity>
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
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#666' },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: 6 },
  card: {
    backgroundColor: '#f7f7f7', borderRadius: 12, padding: 16, marginHorizontal: 20, marginBottom: 12,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#666' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    backgroundColor: '#e67e22', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 30,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});