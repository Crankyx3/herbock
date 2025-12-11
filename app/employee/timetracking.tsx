import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { useTimeTrackingStore } from '../../store/timeTrackingStore';
import { LiveTimeTrackingDetail } from '../../components/employee/LiveTimeTrackingDetail';
import { ManualTimeEntry } from '../../components/employee/ManualTimeEntry';
import { TimeEntryHistory } from '../../components/employee/TimeEntryHistory';
import { WeeklyReport } from '../../components/employee/WeeklyReport';
import { Colors, Sizes } from '../../constants';

export default function TimeTrackingScreen() {
  const loadEntries = useTimeTrackingStore((state) => state.loadEntries);
  const [activeTab, setActiveTab] = useState('live');

  useEffect(() => {
    loadEntries();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'live':
        return <LiveTimeTrackingDetail />;
      case 'manual':
        return <ManualTimeEntry />;
      case 'history':
        return <TimeEntryHistory />;
      case 'report':
        return <WeeklyReport />;
      default:
        return <LiveTimeTrackingDetail />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Zeiterfassung
        </Text>
      </View>

      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={[
          {
            value: 'live',
            label: 'Live',
            icon: 'play-circle',
          },
          {
            value: 'manual',
            label: 'Nachtrag',
            icon: 'pencil',
          },
          {
            value: 'history',
            label: 'Historie',
            icon: 'history',
          },
          {
            value: 'report',
            label: 'Bericht',
            icon: 'chart-line',
          },
        ]}
        style={styles.segmentedButtons}
      />

      <ScrollView style={styles.content}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    padding: Sizes.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  segmentedButtons: {
    margin: Sizes.md,
  },
  content: {
    flex: 1,
  },
});
