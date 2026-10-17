import { notify } from '@/utils/alert';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      notify('Error', 'Nombre y correo son obligatorios.');
      return;
    }

        const updates: { name: string; email: string; password?: string } = {
      name: name.trim(),
      email: email.trim(),
    };

    // Only update password if the user typed something
    if (password || confirm) {
      if (password !== confirm) {
        notify('Error', 'Las contraseñas no coinciden.');
        return;
      }
      if (password.length < 6) {
        notify('Error', 'La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      updates.password = password;
    }

    setLoading(true);
    const result = await updateProfile(updates);
    setLoading(false);

    if (!result.success) {
      notify('Error', result.error);
      return;
    }

    notify('Éxito', 'Perfil actualizado correctamente.');
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Correo</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.sectionTitle}>Cambiar contraseña (opcional)</Text>

      <Text style={styles.label}>Nueva contraseña</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Dejar vacío para no cambiar"
      />

      <Text style={styles.label}>Confirmar nueva contraseña</Text>
      <TextInput
        style={styles.input}
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar Cambios</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancel} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 24 },
  label: { fontSize: 14, color: '#666', marginTop: 12, marginBottom: 4 },
  sectionTitle: {
    fontSize: 16, fontWeight: '600',
    marginTop: 28, marginBottom: 4, color: '#333',
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, fontSize: 16,
  },
  button: {
    backgroundColor: '#e67e22', padding: 14, borderRadius: 8,
    alignItems: 'center', marginTop: 32,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancel: { alignItems: 'center', marginTop: 16, padding: 12 },
  cancelText: { color: '#666', fontSize: 15 },
});