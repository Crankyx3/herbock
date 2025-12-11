import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Tabs, FAB } from 'react-native-paper';
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Zeiterfassung
        </Text>
      </View>

      <Tabs.View
        value={activeTab}
        onChange={setActiveTab}
        style={styles.tabs}
      >
        <Tabs.Tab value="live" label="Live-Erfassung">
          <ScrollView style={styles.tabContent}>
            <LiveTimeTrackingDetail />
          </ScrollView>
        </Tabs.Tab>

        <Tabs.Tab value="manual" label="Nacherfassung">
          <ScrollView style={styles.tabContent}>
            <ManualTimeEntry />
          </ScrollView>
        </Tabs.Tab>

        <Tabs.Tab value="history" label="Historie">
          <ScrollView style={styles.tabContent}>
            <TimeEntryHistory />
          </ScrollView>
        </Tabs.Tab>

        <Tabs.Tab value="report" label="Bericht">
          <ScrollView style={styles.tabContent}>
            <WeeklyReport />
          </ScrollView>
        </Tabs.Tab>
      </Tabs.View>
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
  tabs: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
});
