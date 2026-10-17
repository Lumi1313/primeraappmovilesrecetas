import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#e67e22' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mis Recetas',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🍳</Text>,
        }}
      />
      <Tabs.Screen
        name="general"
        options={{
          title: 'General',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🌎</Text>,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Grupos',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📁</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}