import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, TextInput, SegmentedButtons } from 'react-native-paper';
import { useDefectsStore } from '../../store/defectsStore';
import { useProjectStore } from '../../store/projectStore';
import { DefectStatus, DefectPriority } from '../../types';
import { Colors, Sizes } from '../../constants';
import { useRouter } from 'expo-router';

export const ManualDefectEntry = () => {
  const { addDefect } = useDefectsStore();
  const { selectedProject } = useProjectStore();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [priority, setPriority] = useState<DefectPriority>(DefectPriority.MEDIUM);
  const [status, setStatus] = useState<DefectStatus>(DefectStatus.OPEN);
  const [showRoomModal, setShowRoomModal] = useState(false);

  const handleSave = () => {
    if (!selectedProject) {
      Alert.alert('Fehler', 'Kein Projekt ausgewählt');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Fehler', 'Bitte Titel eingeben');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Fehler', 'Bitte Beschreibung eingeben');
      return;
    }

    if (!selectedRoomId) {
      Alert.alert('Fehler', 'Bitte Raum auswählen');
      return;
    }

    addDefect({
      projectId: selectedProject.id,
      roomId: selectedRoomId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      createdBy: 'current-user-id', // TODO: Get from auth
      images: [],
    });

    // Reset form
    setTitle('');
    setDescription('');
    setSelectedRoomId('');
    setPriority(DefectPriority.MEDIUM);
    setStatus(DefectStatus.OPEN);

    Alert.alert('Erfolg', 'Mangel wurde erfasst', [
      {
        text: 'OK',
        onPress: () => {
          // Navigate back or stay
        },
      },
    ]);
  };

  const getRoomName = (roomId: string) => {
    const room = selectedProject?.rooms?.find((r) => r.id === roomId);
    return room ? room.name : 'Unbekannt';
  };

  return (
    <ScrollView style={styles.scrollView}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Neuen Mangel erfassen
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Dokumentieren Sie Mängel für spätere Behebung
          </Text>

          <View style={styles.inputSection}>
            <Text variant="bodyMedium" style={styles.inputLabel}>
              Titel *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="z.B. Riss in der Wand"
              mode="outlined"
              style={styles.input}
            />

            <Text variant="bodyMedium" style={styles.inputLabel}>
              Raum *
            </Text>
            {selectedProject?.rooms && selectedProject.rooms.length > 0 ? (
              <View style={styles.roomButtons}>
                {selectedProject.rooms.map((room) => (
                  <Button
                    key={room.id}
                    mode={selectedRoomId === room.id ? 'contained' : 'outlined'}
                    onPress={() => setSelectedRoomId(room.id)}
                    style={styles.roomButton}
                  >
                    {room.name}
                  </Button>
                ))}
              </View>
            ) : (
              <Text variant="bodyMedium" style={styles.noRoomsText}>
                Keine Räume verfügbar
              </Text>
            )}

            <Text variant="bodyMedium" style={styles.inputLabel}>
              Priorität
            </Text>
            <SegmentedButtons
              value={priority}
              onValueChange={(value) => setPriority(value as DefectPriority)}
              buttons={[
                {
                  value: DefectPriority.LOW,
                  label: 'Niedrig',
                  style: priority === DefectPriority.LOW ? styles.selectedButton : undefined,
                },
                {
                  value: DefectPriority.MEDIUM,
                  label: 'Mittel',
                  style: priority === DefectPriority.MEDIUM ? styles.selectedButton : undefined,
                },
                {
                  value: DefectPriority.HIGH,
                  label: 'Hoch',
                  style: priority === DefectPriority.HIGH ? styles.selectedButton : undefined,
                },
                {
                  value: DefectPriority.CRITICAL,
                  label: 'Kritisch',
                  style: priority === DefectPriority.CRITICAL ? styles.selectedButton : undefined,
                },
              ]}
              style={styles.segmentedButtons}
            />

            <Text variant="bodyMedium" style={styles.inputLabel}>
              Status
            </Text>
            <SegmentedButtons
              value={status}
              onValueChange={(value) => setStatus(value as DefectStatus)}
              buttons={[
                {
                  value: DefectStatus.OPEN,
                  label: 'Offen',
                  style: status === DefectStatus.OPEN ? styles.selectedButton : undefined,
                },
                {
                  value: DefectStatus.IN_PROGRESS,
                  label: 'In Arbeit',
                  style: status === DefectStatus.IN_PROGRESS ? styles.selectedButton : undefined,
                },
              ]}
              style={styles.segmentedButtons}
            />

            <Text variant="bodyMedium" style={styles.inputLabel}>
              Beschreibung *
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Detaillierte Beschreibung des Mangels..."
              mode="outlined"
              multiline
              numberOfLines={5}
              style={[styles.input, styles.textArea]}
            />

            {/* TODO: Add photo upload */}
            <View style={styles.photoSection}>
              <Text variant="bodyMedium" style={styles.inputLabel}>
                Fotos
              </Text>
              <Button
                mode="outlined"
                icon="camera"
                onPress={() => {
                  Alert.alert('Info', 'Foto-Upload wird in Phase 2 implementiert');
                }}
                style={styles.photoButton}
              >
                Foto hinzufügen
              </Button>
            </View>

            {/* TODO: Add audio recording */}
            <View style={styles.audioSection}>
              <Text variant="bodyMedium" style={styles.inputLabel}>
                Sprachaufnahme (KI)
              </Text>
              <Button
                mode="outlined"
                icon="microphone"
                onPress={() => {
                  Alert.alert('Info', 'Sprachaufnahme mit KI wird in Phase 3 implementiert');
                }}
                style={styles.audioButton}
                disabled
              >
                Sprachnotiz aufnehmen
              </Button>
              <Text variant="bodySmall" style={styles.helperText}>
                Wird automatisch übersetzt und transkribiert
              </Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleSave}
            disabled={!title.trim() || !description.trim() || !selectedRoomId}
            icon="check"
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
          >
            Mangel speichern
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.surface,
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
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.background,
  },
  textArea: {
    minHeight: 100,
  },
  roomButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Sizes.sm,
  },
  roomButton: {
    marginBottom: Sizes.sm,
  },
  noRoomsText: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  segmentedButtons: {
    marginTop: Sizes.xs,
  },
  selectedButton: {
    backgroundColor: Colors.primary,
  },
  photoSection: {
    marginTop: Sizes.md,
  },
  photoButton: {
    marginTop: Sizes.xs,
  },
  audioSection: {
    marginTop: Sizes.md,
  },
  audioButton: {
    marginTop: Sizes.xs,
  },
  helperText: {
    color: Colors.textSecondary,
    marginTop: Sizes.xs,
    fontStyle: 'italic',
  },
  saveButton: {
    marginTop: Sizes.md,
  },
  saveButtonContent: {
    paddingVertical: Sizes.sm,
  },
});
