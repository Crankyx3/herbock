import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { useTimeTrackingStore } from '../../store/timeTrackingStore';
import { useRouter } from 'expo-router';
import { Colors, Sizes } from '../../constants';

export const LiveTimeTracking = () => {
  const { currentEntry, pauseTimer, resumeTimer, stopTimer } = useTimeTrackingStore();
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const updateElapsedTime = () => {
      if (!currentEntry) return;

      if (currentEntry.isRunning) {
        const now = new Date();
        const sessionTime = now.getTime() - new Date(currentEntry.startTime).getTime();
        const totalTime = sessionTime + ((currentEntry.duration || 0) * 60 * 60 * 1000);

        const hours = Math.floor(totalTime / 1000 / 60 / 60);
        const minutes = Math.floor((totalTime / 1000 / 60) % 60);
        const seconds = Math.floor((totalTime / 1000) % 60);

        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      } else {
        // Show paused time
        const totalMilliseconds = (currentEntry.duration || 0) * 60 * 60 * 1000;
        const hours = Math.floor(totalMilliseconds / 1000 / 60 / 60);
        const minutes = Math.floor((totalMilliseconds / 1000 / 60) % 60);
        const seconds = Math.floor((totalMilliseconds / 1000) % 60);

        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    };

    // Initial update
    updateElapsedTime();

    // Start interval only if running
    if (currentEntry?.isRunning) {
      interval = setInterval(updateElapsedTime, 1000);
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
              onPress={() => router.push('/employee/timetracking' as any)}
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

  const isRunning = currentEntry.isRunning;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.activeContainer}>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.title}>
              {isRunning ? 'Zeiterfassung läuft' : 'Zeiterfassung pausiert'}
            </Text>
            {isRunning && <View style={styles.statusIndicator} />}
            {!isRunning && <View style={styles.pausedIndicator} />}
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
            {isRunning ? (
              <Button
                mode="outlined"
                onPress={pauseTimer}
                style={styles.actionButton}
                icon="pause"
              >
                Pause
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={resumeTimer}
                style={styles.actionButton}
                icon="play"
              >
                Fortsetzen
              </Button>
            )}
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
  pausedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.warning,
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
