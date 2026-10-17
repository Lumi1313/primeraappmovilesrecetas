import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <DataProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </DataProvider>
    </AuthProvider>
  );
}