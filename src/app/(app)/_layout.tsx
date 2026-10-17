import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="recipe/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="recipe/[id]" />
      <Stack.Screen name="recipe/edit/[id]" />
      <Stack.Screen name="group/[id]" />
      <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
    </Stack>
  );
}