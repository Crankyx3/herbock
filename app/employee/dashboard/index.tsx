import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { DashboardHeader } from '../../../components/employee/DashboardHeader';
import { LiveTimeTracking } from '../../../components/employee/LiveTimeTracking';
import { NotificationCenter } from '../../../components/employee/NotificationCenter';
import { WeeklyStats } from '../../../components/employee/WeeklyStats';
import { QuickAccessMenu } from '../../../components/employee/QuickAccessMenu';
import { Colors } from '../../../constants';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <DashboardHeader />
      <LiveTimeTracking />
      <NotificationCenter />
      <WeeklyStats />
      <QuickAccessMenu />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
});
