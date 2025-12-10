import { Stack } from 'expo-router';
import { Colors } from '../../constants';

export default function ProjectLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="list"
        options={{
          title: 'Meine Projekte',
        }}
      />
      <Stack.Screen
        name="chat"
        options={{
          title: 'Projekt-Chat',
        }}
      />
      <Stack.Screen
        name="defects"
        options={{
          title: 'Mängel & Restarbeiten',
        }}
      />
      <Stack.Screen
        name="measurement"
        options={{
          title: 'Aufmaß',
        }}
      />
      <Stack.Screen
        name="documentation"
        options={{
          title: 'Dokumentation',
        }}
      />
    </Stack>
  );
}
