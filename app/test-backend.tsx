import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import BackendTest from '../components/BackendTest';

export default function TestBackend() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Backend Connection Test
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Teste die Verbindung zum Windows Backend
        </Text>
      </View>

      <BackendTest />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
  },
});
