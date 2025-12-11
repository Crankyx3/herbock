import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { DefectsList } from '../../../components/project/DefectsList';
import { ManualDefectEntry } from '../../../components/project/ManualDefectEntry';
import { useDefectsStore } from '../../../store/defectsStore';
import { useProjectStore } from '../../../store/projectStore';
import { Colors, Sizes } from '../../../constants';

type TabValue = 'list' | 'add';

export default function DefectsScreen() {
  const [activeTab, setActiveTab] = useState<TabValue>('list');
  const { loadDefects, loadRooms } = useDefectsStore();
  const { selectedProject } = useProjectStore();

  useEffect(() => {
    loadDefects();
    if (selectedProject) {
      loadRooms(selectedProject.id);
    }
  }, [selectedProject]);

  const renderContent = () => {
    switch (activeTab) {
      case 'list':
        return <DefectsList />;
      case 'add':
        return <ManualDefectEntry />;
      default:
        return <DefectsList />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabValue)}
          buttons={[
            {
              value: 'list',
              label: 'Liste',
              icon: 'format-list-bulleted',
            },
            {
              value: 'add',
              label: 'Neu erfassen',
              icon: 'plus',
            },
          ]}
        />
      </View>

      {renderContent()}
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
