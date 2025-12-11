import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, TextInput, IconButton } from 'react-native-paper';
import { useTimeTrackingStore } from '../../store/timeTrackingStore';
import { useProjectStore } from '../../store/projectStore';
import { ProjectSelectionModal } from '../shared/ProjectSelectionModal';
import { Project } from '../../types';
import { Colors, Sizes } from '../../constants';

export const LiveTimeTrackingDetail = () => {
  const { currentEntry, startTimer, stopTimer, pauseTimer, resumeTimer } = useTimeTrackingStore();
  const { selectedProject, setSelectedProject } = useProjectStore();

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [activity, setActivity] = useState('');
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (currentEntry?.isRunning) {
      interval = setInterval(() => {
        const now = new Date();
        const sessionTime = now.getTime() - new Date(currentEntry.startTime).getTime();
        const totalTime = sessionTime + ((currentEntry.duration || 0) * 60 * 60 * 1000);

        const hours = Math.floor(totalTime / 1000 / 60 / 60);
        const minutes = Math.floor((totalTime / 1000 / 60) % 60);
        const seconds = Math.floor((totalTime / 1000) % 60);

        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    } else if (currentEntry) {
      // Show paused time
      const totalHours = currentEntry.duration || 0;
      const hours = Math.floor(totalHours);
      const minutes = Math.floor((totalHours * 60) % 60);
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:00`
      );
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentEntry]);

  const handleStartTimer = () => {
    if (!selectedProject || !activity.trim()) {
      return;
    }

    startTimer(selectedProject.id, selectedProject.name, activity);
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  if (currentEntry) {
    const isRunning = currentEntry.isRunning;

    return (
      <ScrollView style={styles.scrollView}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.activeHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              {isRunning ? 'Timer läuft' : 'Timer pausiert'}
            </Text>
            {isRunning && <View style={styles.statusIndicator} />}
            {!isRunning && <View style={styles.pausedIndicator} />}
          </View>

          <Text variant="displayMedium" style={styles.timer}>
            {elapsedTime}
          </Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Projekt:
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {selectedProject?.name || 'Unbekannt'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Tätigkeit:
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {currentEntry.activity}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Startzeit:
              </Text>
              <Text variant="bodyLarge" style={styles.value}>
                {new Date(currentEntry.startTime).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
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
        </Card.Content>
      </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Neue Zeiterfassung starten
          </Text>

          <View style={styles.inputSection}>
            <Text variant="bodyMedium" style={styles.inputLabel}>
              Projekt auswählen
            </Text>
            <Button
              mode="outlined"
              onPress={() => setShowProjectModal(true)}
              icon="folder"
              style={styles.projectButton}
            >
              {selectedProject ? selectedProject.name : 'Projekt wählen...'}
            </Button>

            <Text variant="bodyMedium" style={styles.inputLabel}>
              Tätigkeit
            </Text>
            <TextInput
              value={activity}
              onChangeText={setActivity}
              placeholder="z.B. Estrich schleifen"
              mode="outlined"
              style={styles.input}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleStartTimer}
            disabled={!selectedProject || !activity.trim()}
            icon="play"
            style={styles.startButton}
            contentStyle={styles.startButtonContent}
          >
            Timer starten
          </Button>
        </Card.Content>
      </Card>

      <ProjectSelectionModal
        visible={showProjectModal}
        onDismiss={() => setShowProjectModal(false)}
        onSelect={handleProjectSelect}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  card: {
    margin: Sizes.md,
    elevation: 2,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.lg,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Sizes.md,
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
    marginVertical: Sizes.xl,
  },
  infoSection: {
    marginBottom: Sizes.lg,
  },
  infoRow: {
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
    gap: Sizes.md,
  },
  actionButton: {
    flex: 1,
  },
  inputSection: {
    marginBottom: Sizes.lg,
  },
  inputLabel: {
    marginTop: Sizes.md,
    marginBottom: Sizes.sm,
    fontWeight: '600',
  },
  projectButton: {
    justifyContent: 'flex-start',
  },
  input: {
    backgroundColor: Colors.background,
  },
  startButton: {
    marginTop: Sizes.md,
  },
  startButtonContent: {
    paddingVertical: Sizes.sm,
  },
});
