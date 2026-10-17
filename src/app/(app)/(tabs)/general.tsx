import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useData } from '../../../context/DataContext';

export default function GeneralScreen() {
  const { recipes } = useData();
  const router = useRouter();

  const allRecipes = [...recipes].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todas las Recetas</Text>

      {allRecipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aún no hay recetas.</Text>
        </View>
      ) : (
        <FlatList
          data={allRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(app)/recipe/${item.id}`)}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  title: { fontSize: 26, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
  card: {
    backgroundColor: '#f7f7f7', borderRadius: 12, padding: 16,
    marginHorizontal: 20, marginBottom: 12,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#666' },
});