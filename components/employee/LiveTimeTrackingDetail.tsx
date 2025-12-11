import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, TextInput, IconButton } from 'react-native-paper';
import { useTimeTrackingStore } from '../../store/timeTrackingStore';
import { useProjectStore } from '../../store/projectStore';
import { ProjectSelectionModal } from '../shared/ProjectSelectionModal';
import { Project } from '../../types';
import { Colors, Sizes } from '../../constants';

export const LiveTimeTrackingDetail = () => {
  const { currentEntry, startTimer, stopTimer, pauseTimer } = useTimeTrackingStore();
  const { selectedProject, setSelectedProject } = useProjectStore();

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [activity, setActivity] = useState('');
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
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
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

  if (currentEntry?.isRunning) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.activeHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Timer läuft
            </Text>
            <View style={styles.statusIndicator} />
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
            <Button
              mode="outlined"
              onPress={pauseTimer}
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
        </Card.Content>
      </Card>
    );
  }

  return (
    <>
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
    </>
  );
};

const styles = StyleSheet.create({
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
