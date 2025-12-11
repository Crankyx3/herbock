import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Modal, Portal, Text, List, Button, ActivityIndicator, Searchbar } from 'react-native-paper';
import { useProjectStore } from '../../store/projectStore';
import { Project } from '../../types';
import { Colors, Sizes } from '../../constants';

interface ProjectSelectionModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (project: Project) => void;
}

export const ProjectSelectionModal: React.FC<ProjectSelectionModalProps> = ({
  visible,
  onDismiss,
  onSelect,
}) => {
  const { projects, isLoading, loadProjects } = useProjectStore();
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    if (visible && projects.length === 0) {
      loadProjects();
    }
  }, [visible]);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (project: Project) => {
    onSelect(project);
    setSearchQuery('');
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Projekt wählen
          </Text>
        </View>

        <Searchbar
          placeholder="Projekt suchen..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredProjects}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={item.description}
                left={(props) => <List.Icon {...props} icon="folder" />}
                onPress={() => handleSelect(item)}
                style={styles.listItem}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  {searchQuery
                    ? 'Keine Projekte gefunden'
                    : 'Keine Projekte verfügbar'}
                </Text>
              </View>
            }
          />
        )}

        <Button
          mode="outlined"
          onPress={onDismiss}
          style={styles.cancelButton}
        >
          Abbrechen
        </Button>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: Colors.background,
    margin: Sizes.lg,
    borderRadius: Sizes.borderRadius.lg,
    maxHeight: '80%',
  },
  header: {
    padding: Sizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontWeight: 'bold',
  },
  searchbar: {
    margin: Sizes.md,
    elevation: 0,
    backgroundColor: Colors.surface,
  },
  loadingContainer: {
    padding: Sizes.xxl,
    alignItems: 'center',
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  emptyContainer: {
    padding: Sizes.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
  },
  cancelButton: {
    margin: Sizes.md,
  },
});
