import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { DefectsList } from '../../../components/project/DefectsList';
import { useDefectsStore } from '../../../store/defectsStore';
import { useProjectStore } from '../../../store/projectStore';
import { Colors } from '../../../constants';

export default function DefectsScreen() {
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  const { loadDefects, loadRooms } = useDefectsStore();
  const { selectedProject } = useProjectStore();

  useEffect(() => {
    if (selectedProject) {
      loadDefects(selectedProject.id);
      loadRooms(selectedProject.id);
    }
  }, [selectedProject]);

  return (
    <View style={styles.container}>
      <DefectsList roomId={roomId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  tabContainer: {
    padding: Sizes.md,
    backgroundColor: Colors.background,
    elevation: 2,
  },
});
