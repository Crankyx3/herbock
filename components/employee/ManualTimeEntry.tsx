import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, TextInput } from 'react-native-paper';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { useTimeTrackingStore } from '../../store/timeTrackingStore';
import { useProjectStore } from '../../store/projectStore';
import { ProjectSelectionModal } from '../shared/ProjectSelectionModal';
import { Project } from '../../types';
import { Colors, Sizes } from '../../constants';

export const ManualTimeEntry = () => {
  const { addManualEntry } = useTimeTrackingStore();
  const { selectedProject, setSelectedProject } = useProjectStore();

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState({ hours: 8, minutes: 0 });
  const [endTime, setEndTime] = useState({ hours: 17, minutes: 0 });
  const [activity, setActivity] = useState('');

  const handleSave = () => {
    if (!selectedProject || !activity.trim()) {
      return;
    }

    const startDateTime = new Date(date);
    startDateTime.setHours(startTime.hours, startTime.minutes, 0, 0);

    const endDateTime = new Date(date);
    endDateTime.setHours(endTime.hours, endTime.minutes, 0, 0);

    const duration =
      (endDateTime.getTime() - startDateTime.getTime()) / 1000 / 60 / 60; // hours

    if (duration <= 0) {
      alert('Die Endzeit muss nach der Startzeit liegen');
      return;
    }

    addManualEntry({
      projectId: selectedProject.id,
      activity,
      startTime: startDateTime,
      endTime: endDateTime,
      duration,
    });

    // Reset form
    setActivity('');
    setDate(new Date());
    setStartTime({ hours: 8, minutes: 0 });
    setEndTime({ hours: 17, minutes: 0 });

    alert('Zeiterfassung gespeichert!');
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (time: { hours: number; minutes: number }) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes
      .toString()
      .padStart(2, '0')}`;
  };

  const calculateDuration = () => {
    const start = startTime.hours * 60 + startTime.minutes;
    const end = endTime.hours * 60 + endTime.minutes;
    const diff = end - start;

    if (diff <= 0) return '0:00';

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.scrollView}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Manuelle Zeiterfassung
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Für vergessene oder nachträgliche Zeitbuchungen
          </Text>

          <View style={styles.inputSection}>
            <Text variant="bodyMedium" style={styles.inputLabel}>
              Projekt
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
              Datum
            </Text>
            <Button
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              icon="calendar"
              style={styles.dateButton}
            >
              {formatDate(date)}
            </Button>

            <View style={styles.timeRow}>
              <View style={styles.timeColumn}>
                <Text variant="bodyMedium" style={styles.inputLabel}>
                  Von
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowStartTimePicker(true)}
                  icon="clock-outline"
                >
                  {formatTime(startTime)}
                </Button>
              </View>

              <View style={styles.timeColumn}>
                <Text variant="bodyMedium" style={styles.inputLabel}>
                  Bis
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowEndTimePicker(true)}
                  icon="clock-outline"
                >
                  {formatTime(endTime)}
                </Button>
              </View>
            </View>

            <View style={styles.durationInfo}>
              <Text variant="bodyMedium" style={styles.label}>
                Dauer:
              </Text>
              <Text variant="titleMedium" style={styles.durationValue}>
                {calculateDuration()} Std
              </Text>
            </View>

            <Text variant="bodyMedium" style={styles.inputLabel}>
              Tätigkeit
            </Text>
            <TextInput
              value={activity}
              onChangeText={setActivity}
              placeholder="z.B. Estrich schleifen"
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleSave}
            disabled={!selectedProject || !activity.trim()}
            icon="check"
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
          >
            Zeiterfassung speichern
          </Button>
        </Card.Content>
      </Card>

      <ProjectSelectionModal
        visible={showProjectModal}
        onDismiss={() => setShowProjectModal(false)}
        onSelect={(project: Project) => {
          setSelectedProject(project);
          setShowProjectModal(false);
        }}
      />

      <DatePickerModal
        locale="de"
        mode="single"
        visible={showDatePicker}
        onDismiss={() => setShowDatePicker(false)}
        date={date}
        onConfirm={(params) => {
          setDate(params.date || new Date());
          setShowDatePicker(false);
        }}
      />

      <TimePickerModal
        locale="de"
        visible={showStartTimePicker}
        onDismiss={() => setShowStartTimePicker(false)}
        onConfirm={({ hours, minutes }) => {
          setStartTime({ hours, minutes });
          setShowStartTimePicker(false);
        }}
        hours={startTime.hours}
        minutes={startTime.minutes}
      />

      <TimePickerModal
        locale="de"
        visible={showEndTimePicker}
        onDismiss={() => setShowEndTimePicker(false)}
        onConfirm={({ hours, minutes }) => {
          setEndTime({ hours, minutes });
          setShowEndTimePicker(false);
        }}
        hours={endTime.hours}
        minutes={endTime.minutes}
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
  sectionTitle: {
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Sizes.xs,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginBottom: Sizes.lg,
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
  dateButton: {
    justifyContent: 'flex-start',
  },
  timeRow: {
    flexDirection: 'row',
    gap: Sizes.md,
  },
  timeColumn: {
    flex: 1,
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Sizes.lg,
    padding: Sizes.md,
    backgroundColor: Colors.surface,
    borderRadius: Sizes.borderRadius.md,
  },
  label: {
    color: Colors.textSecondary,
  },
  durationValue: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  input: {
    backgroundColor: Colors.background,
  },
  saveButton: {
    marginTop: Sizes.md,
  },
  saveButtonContent: {
    paddingVertical: Sizes.sm,
  },
});
