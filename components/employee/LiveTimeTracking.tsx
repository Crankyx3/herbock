import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, IconButton } from 'react-native-paper';
import { useTimeTrackingStore } from '../../store/timeTrackingStore';
import { Colors, Sizes } from '../../constants';

export const LiveTimeTracking = () => {
  const { currentEntry, startTimer, stopTimer } = useTimeTrackingStore();
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (currentEntry?.isRunning) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - new Date(currentEntry.startTime).getTime();
        const hours = Math.floor(diff / 1000 / 60 / 60);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentEntry]);

  if (!currentEntry) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.inactiveContainer}>
            <Text variant="titleMedium" style={styles.title}>
              Zeiterfassung
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Starten Sie Ihren Arbeitstag
            </Text>
            <Button
              mode="contained"
              onPress={() => startTimer('mock-project-id', 'Arbeit')}
              style={styles.startButton}
              icon="play"
            >
              Arbeitstag starten
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.activeContainer}>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.title}>
              Zeiterfassung läuft
            </Text>
            <View style={styles.statusIndicator} />
          </View>

          <Text variant="displaySmall" style={styles.timer}>
            {elapsedTime}
          </Text>

          <View style={styles.projectInfo}>
            <Text variant="bodyMedium" style={styles.label}>
              Projekt:
            </Text>
            <Text variant="bodyLarge" style={styles.value}>
              Bauprojekt Mustermann
            </Text>
          </View>

          <View style={styles.projectInfo}>
            <Text variant="bodyMedium" style={styles.label}>
              Tätigkeit:
            </Text>
            <Text variant="bodyLarge" style={styles.value}>
              {currentEntry.activity}
            </Text>
          </View>

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => {}}
              style={styles.actionButton}
              icon="pause"
            >
              Pause
            </Button>
            <Button
              mode="contained"
              onPress={stopTimer}
              style={styles.actionButton}
              buttonColor={Colors.error}
              icon="stop"
            >
              Stopp
            </Button>
          </View>
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
  inactiveContainer: {
    alignItems: 'center',
    padding: Sizes.lg,
  },
  activeContainer: {
    padding: Sizes.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.md,
  },
  title: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginBottom: Sizes.lg,
  },
  startButton: {
    marginTop: Sizes.md,
    minWidth: 200,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
  },
  timer: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: Colors.primary,
    marginVertical: Sizes.lg,
  },
  projectInfo: {
    marginBottom: Sizes.md,
  },
  label: {
    color: Colors.textSecondary,
    marginBottom: Sizes.xs,
  },
  value: {
    fontWeight: '600',
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Sizes.lg,
    gap: Sizes.md,
  },
  actionButton: {
    flex: 1,
  },
});
