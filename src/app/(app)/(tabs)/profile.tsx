import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { confirm } from '../../../utils/alert';

export default function ProfileScreen() {
  const { user, logout, deleteAccount } = useAuth();
  const router = useRouter();

    const handleLogout = () => {
    confirm('Cerrar sesión', '¿Estás seguro?', async () => {
      await logout();
      router.replace('/(auth)/login');
    });
  };

  const handleDeleteAccount = () => {
    confirm(
      'Borrar cuenta',
      'Esta acción eliminará tu cuenta, tus recetas y tus grupos. No se puede deshacer.',
      async () => {
        await deleteAccount();
        router.replace('/(auth)/login');
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Nombre</Text>
        <Text style={styles.value}>{user?.name}</Text>

        <Text style={styles.label}>Correo</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.editButton]}
        onPress={() => router.push('/(app)/edit-profile')}
      >
        <Text style={styles.buttonText}>Editar Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={handleDeleteAccount}
      >
        <Text style={styles.buttonText}>Borrar Cuenta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  card: {
    backgroundColor: '#f7f7f7', borderRadius: 12, padding: 20, marginBottom: 24,
  },
  label: { fontSize: 13, color: '#888', marginTop: 8 },
  value: { fontSize: 18, fontWeight: '500', marginBottom: 8 },
  button: {
    padding: 14, borderRadius: 8,
    alignItems: 'center', marginBottom: 12,
  },
  editButton: { backgroundColor: '#e67e22' },
  logoutButton: { backgroundColor: '#34495e' },
  deleteButton: { backgroundColor: '#c0392b' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});