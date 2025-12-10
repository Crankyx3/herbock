import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, ProgressBar } from 'react-native-paper';
import { Colors, Sizes } from '../../constants';

export const WeeklyStats = () => {
  const currentHours = 32;
  const targetHours = 40;
  const progress = currentHours / targetHours;
  const weekNumber = Math.ceil(new Date().getDate() / 7);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Deine Woche
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          KW {weekNumber}
        </Text>

        <View style={styles.statsContainer}>
          <Text variant="displaySmall" style={styles.hours}>
            {currentHours}
          </Text>
          <Text variant="bodyLarge" style={styles.hoursLabel}>
            / {targetHours} Std
          </Text>
        </View>

        <ProgressBar
          progress={progress}
          color={progress >= 1 ? Colors.success : Colors.primary}
          style={styles.progressBar}
        />

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.infoText}>
            {targetHours - currentHours} Std verbleibend
          </Text>
          <Text variant="bodySmall" style={styles.percentage}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: Sizes.md,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginBottom: Sizes.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: Sizes.md,
  },
  hours: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  hoursLabel: {
    marginLeft: Sizes.sm,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 8,
    borderRadius: Sizes.borderRadius.sm,
    marginVertical: Sizes.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoText: {
    color: Colors.textSecondary,
  },
  percentage: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
