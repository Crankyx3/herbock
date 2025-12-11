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
        name="list/index"
        options={{
          title: 'Meine Projekte',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Projekt-Details',
        }}
      />
      <Stack.Screen
        name="chat/index"
        options={{
          title: 'Projekt-Chat',
        }}
      />
      <Stack.Screen
        name="defects/index"
        options={{
          title: 'Mängel & Restarbeiten',
        }}
      />
      <Stack.Screen
        name="measurement/index"
        options={{
          title: 'Aufmaß',
        }}
      />
      <Stack.Screen
        name="documentation/index"
        options={{
          title: 'Dokumentation',
        }}
      />
    </Stack>
  );
}
