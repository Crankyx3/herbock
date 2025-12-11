import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Text, FAB, Card, Chip, Button, TextInput, SegmentedButtons } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProjectStore } from '../../../store/projectStore';
import { useDefectsStore } from '../../../store/defectsStore';
import { DefectPriority } from '../../../types';
import { Colors, Sizes } from '../../../constants';

const { width, height } = Dimensions.get('window');

export default function RoomFloorPlanScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedProject } = useProjectStore();
  const { defects, addDefect } = useDefectsStore();
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });

  // Form state
  const [showDefectForm, setShowDefectForm] = useState(false);
  const [defectPosition, setDefectPosition] = useState({ x: 0, y: 0 });
  const [defectTitle, setDefectTitle] = useState('');
  const [defectDescription, setDefectDescription] = useState('');
  const [defectPriority, setDefectPriority] = useState<DefectPriority>(DefectPriority.MEDIUM);

  const room = selectedProject?.rooms?.find((r) => r.id === id);
  const roomDefects = defects.filter((d) => d.roomId === id);

  if (!room) {
    return (
      <View style={styles.container}>
        <Text>Raum nicht gefunden</Text>
      </View>
    );
  }

  const handleFloorPlanPress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;

    // Calculate relative position (0-1 range)
    const relativeX = locationX / imageLayout.width;
    const relativeY = locationY / imageLayout.height;

    // Open form with this position
    setDefectPosition({ x: relativeX, y: relativeY });
    setDefectTitle('');
    setDefectDescription('');
    setDefectPriority(DefectPriority.MEDIUM);
    setShowDefectForm(true);
  };

  const handleSaveDefect = () => {
    if (!defectTitle.trim()) {
      return;
    }

    addDefect({
      projectId: selectedProject!.id,
      roomId: room.id,
      title: defectTitle.trim(),
      description: defectDescription.trim() || `Mangel in ${room.name}`,
      status: 'OPEN' as any,
      priority: defectPriority,
      createdBy: 'current-user-id',
      images: [],
      location: {
        x: defectPosition.x,
        y: defectPosition.y,
        floor: room.floor,
      },
    });

    setShowDefectForm(false);
  };

  const renderDefectMarker = (defect: any, index: number) => {
    if (!defect.location) return null;

    const markerX = defect.location.x * imageLayout.width;
    const markerY = defect.location.y * imageLayout.height;

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'CRITICAL':
          return Colors.error;
        case 'HIGH':
          return Colors.warning;
        case 'MEDIUM':
          return '#FF9800';
        case 'LOW':
          return Colors.success;
        default:
          return Colors.primary;
      }
    };

    return (
      <TouchableOpacity
        key={defect.id}
        style={[
          styles.defectMarker,
          {
            left: imageLayout.x + markerX - 20,
            top: imageLayout.y + markerY - 20,
            backgroundColor: getPriorityColor(defect.priority),
          },
        ]}
        onPress={() => {
          Alert.alert(defect.title, defect.description);
        }}
      >
        <Text style={styles.markerText}>{index + 1}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.roomTitle}>
            {room.name}
          </Text>
          <Text variant="bodyMedium" style={styles.roomInfo}>
            {room.floor && `${room.floor} · `}
            {room.area && `${room.area} m²`}
          </Text>
          {room.description && (
            <Text variant="bodySmall" style={styles.roomDescription}>
              {room.description}
            </Text>
          )}
        </Card.Content>
      </Card>

      <View style={styles.instructionCard}>
        <Text variant="bodySmall" style={styles.instructionText}>
          💡 Tippen Sie auf den Grundriss, um einen Mangel zu markieren
        </Text>
      </View>

      <View style={styles.floorPlanContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleFloorPlanPress}
          style={styles.floorPlanTouch}
          onLayout={(event) => {
            const { x, y, width, height } = event.nativeEvent.layout;
            setImageLayout({ x, y, width, height });
          }}
        >
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Grundriss Platzhalter</Text>
            <Text style={styles.placeholderSubtext}>
              Hier wird später der echte Grundriss angezeigt
            </Text>
            <Text style={styles.placeholderHint}>
              Tippen Sie irgendwo, um einen Mangel zu markieren
            </Text>
          </View>
        </TouchableOpacity>

        {/* Render defect markers */}
        {imageLayout.width > 0 && roomDefects.map((defect, index) => renderDefectMarker(defect, index))}
      </View>

      <View style={styles.defectsListContainer}>
        <Text variant="titleSmall" style={styles.defectsTitle}>
          Mängel in diesem Raum ({roomDefects.length})
        </Text>
        {roomDefects.length > 0 ? (
          <View style={styles.defectsList}>
            {roomDefects.map((defect, index) => (
              <Chip
                key={defect.id}
                mode="outlined"
                style={styles.defectChip}
                onPress={() => {
                  Alert.alert(defect.title, defect.description);
                }}
              >
                {index + 1}. {defect.title}
              </Chip>
            ))}
          </View>
        ) : (
          <Text variant="bodySmall" style={styles.noDefectsText}>
            Noch keine Mängel in diesem Raum
          </Text>
        )}
      </View>

      <FAB
        icon="format-list-bulleted"
        style={styles.fab}
        label="Alle Mängel"
        onPress={() => router.push('/project/defects')}
      />

      {/* Defect Form Modal */}
      <Modal
        visible={showDefectForm}
        onRequestClose={() => setShowDefectForm(false)}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalContent}>
              <Text variant="titleLarge" style={styles.modalTitle}>
                Mangel hinzufügen
              </Text>
              <Text variant="bodySmall" style={styles.modalSubtitle}>
                Position: {Math.round(defectPosition.x * 100)}%, {Math.round(defectPosition.y * 100)}%
              </Text>

              <Text variant="bodyMedium" style={styles.inputLabel}>
                Titel *
              </Text>
              <TextInput
                value={defectTitle}
                onChangeText={setDefectTitle}
                placeholder="z.B. Riss in der Wand"
                mode="outlined"
                style={styles.input}
              />

              <Text variant="bodyMedium" style={styles.inputLabel}>
                Beschreibung
              </Text>
              <TextInput
                value={defectDescription}
                onChangeText={setDefectDescription}
                placeholder="Detaillierte Beschreibung des Mangels..."
                mode="outlined"
                multiline
                numberOfLines={4}
                style={[styles.input, styles.textArea]}
              />

              <Text variant="bodyMedium" style={styles.inputLabel}>
                Priorität
              </Text>
              <SegmentedButtons
                value={defectPriority}
                onValueChange={(value) => setDefectPriority(value as DefectPriority)}
                buttons={[
                  {
                    value: DefectPriority.LOW,
                    label: 'Niedrig',
                  },
                  {
                    value: DefectPriority.MEDIUM,
                    label: 'Mittel',
                  },
                  {
                    value: DefectPriority.HIGH,
                    label: 'Hoch',
                  },
                  {
                    value: DefectPriority.CRITICAL,
                    label: 'Kritisch',
                  },
                ]}
                style={styles.segmentedButtons}
              />

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowDefectForm(false)}
                  style={styles.modalButton}
                >
                  Abbrechen
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveDefect}
                  disabled={!defectTitle.trim()}
                  style={styles.modalButton}
                >
                  Speichern
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  headerCard: {
    margin: Sizes.md,
    elevation: 2,
  },
  roomTitle: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  roomInfo: {
    color: Colors.textSecondary,
    marginTop: Sizes.xs,
  },
  roomDescription: {
    color: Colors.textSecondary,
    marginTop: Sizes.sm,
    lineHeight: 18,
  },
  instructionCard: {
    backgroundColor: Colors.primary + '15',
    padding: Sizes.md,
    marginHorizontal: Sizes.md,
    marginBottom: Sizes.md,
    borderRadius: Sizes.borderRadius.md,
  },
  instructionText: {
    color: Colors.primary,
    textAlign: 'center',
  },
  floorPlanContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginHorizontal: Sizes.md,
    borderRadius: Sizes.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  floorPlanTouch: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Sizes.xl,
    width: '100%',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Sizes.lg,
  },
  placeholderHint: {
    fontSize: 12,
    color: Colors.primary,
    fontStyle: 'italic',
  },
  defectMarker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  defectsListContainer: {
    padding: Sizes.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  defectsTitle: {
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Sizes.sm,
  },
  defectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Sizes.sm,
  },
  defectChip: {
    marginBottom: Sizes.xs,
  },
  noDefectsText: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    right: Sizes.md,
    bottom: Sizes.md,
    backgroundColor: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalContent: {
    padding: Sizes.lg,
  },
  modalTitle: {
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Sizes.xs,
  },
  modalSubtitle: {
    color: Colors.textSecondary,
    marginBottom: Sizes.lg,
  },
  inputLabel: {
    fontWeight: '600',
    color: Colors.text,
    marginTop: Sizes.md,
    marginBottom: Sizes.sm,
  },
  input: {
    backgroundColor: Colors.surface,
  },
  textArea: {
    minHeight: 100,
  },
  segmentedButtons: {
    marginTop: Sizes.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Sizes.md,
    marginTop: Sizes.xl,
    marginBottom: Sizes.md,
  },
  modalButton: {
    flex: 1,
  },
});
