import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, List, Divider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProjectStore } from '../../store/projectStore';
import { Colors, Sizes } from '../../constants';

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { projects, selectedProject, setSelectedProject, loadProjects } = useProjectStore();

  useEffect(() => {
    if (projects.length === 0) {
      loadProjects();
    }
  }, []);

  if (!selectedProject) {
    return (
      <View style={styles.container}>
        <Text>Projekt wird geladen...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            {selectedProject.name}
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            {selectedProject.description}
          </Text>
          {selectedProject.rooms && (
            <Text variant="bodySmall" style={styles.meta}>
              {selectedProject.rooms.length} Räume
            </Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.menuCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Projekt-Bereiche
          </Text>

          <List.Item
            title="Chat"
            description="Projekt-Kommunikation"
            left={(props) => <List.Icon {...props} icon="chat" />}
            right={(props) => (
              selectedProject.unreadMessages > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{selectedProject.unreadMessages}</Text>
                </View>
              ) : (
                <List.Icon {...props} icon="chevron-right" />
              )
            )}
            onPress={() => router.push('/project/chat/index')}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Mängel & Restarbeiten"
            description={`${selectedProject.openDefects} offene Mängel`}
            left={(props) => <List.Icon {...props} icon="alert-circle" color={selectedProject.openDefects > 0 ? Colors.warning : undefined} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/project/defects/index')}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Aufmaß"
            description="Messungen und Aufmaße"
            left={(props) => <List.Icon {...props} icon="ruler" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/project/measurement/index')}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Dokumentation"
            description="Pläne und Dokumente"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/project/documentation/index')}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  headerCard: {
    margin: Sizes.md,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Sizes.xs,
  },
  description: {
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  meta: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  menuCard: {
    margin: Sizes.md,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Sizes.sm,
  },
  listItem: {
    paddingHorizontal: 0,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
