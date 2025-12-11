import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { Card, Text, Chip, Button, IconButton, Divider } from 'react-native-paper';
import { useDefectsStore } from '../../store/defectsStore';
import { useProjectStore } from '../../store/projectStore';
import { Defect, DefectStatus, DefectPriority } from '../../types';
import { Colors, Sizes } from '../../constants';

const { width } = Dimensions.get('window');

interface DefectDetailProps {
  defectId: string;
  onClose?: () => void;
}

export const DefectDetail: React.FC<DefectDetailProps> = ({ defectId, onClose }) => {
  const { defects, updateDefect, deleteDefect } = useDefectsStore();
  const { selectedProject } = useProjectStore();

  const defect = defects.find((d) => d.id === defectId);

  if (!defect) {
    return (
      <View style={styles.container}>
        <Text>Mangel nicht gefunden</Text>
      </View>
    );
  }

  const getRoomName = (roomId?: string) => {
    if (!roomId) return 'Kein Raum zugeordnet';
    const room = selectedProject?.rooms?.find((r) => r.id === roomId);
    return room ? room.name : 'Unbekannt';
  };

  const getStatusColor = (status: DefectStatus) => {
    switch (status) {
      case DefectStatus.OPEN:
        return Colors.error;
      case DefectStatus.IN_PROGRESS:
        return Colors.warning;
      case DefectStatus.RESOLVED:
        return Colors.success;
      case DefectStatus.VERIFIED:
        return Colors.primary;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: DefectStatus) => {
    switch (status) {
      case DefectStatus.OPEN:
        return 'Offen';
      case DefectStatus.IN_PROGRESS:
        return 'In Bearbeitung';
      case DefectStatus.RESOLVED:
        return 'Behoben';
      case DefectStatus.VERIFIED:
        return 'Verifiziert';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: DefectPriority) => {
    switch (priority) {
      case DefectPriority.CRITICAL:
        return Colors.error;
      case DefectPriority.HIGH:
        return Colors.warning;
      case DefectPriority.MEDIUM:
        return '#FF9800';
      case DefectPriority.LOW:
        return Colors.success;
      default:
        return Colors.textSecondary;
    }
  };

  const getPriorityLabel = (priority: DefectPriority) => {
    switch (priority) {
      case DefectPriority.CRITICAL:
        return 'Kritisch';
      case DefectPriority.HIGH:
        return 'Hoch';
      case DefectPriority.MEDIUM:
        return 'Mittel';
      case DefectPriority.LOW:
        return 'Niedrig';
      default:
        return priority;
    }
  };

  const handleStatusChange = (newStatus: DefectStatus) => {
    updateDefect(defectId, { status: newStatus });
  };

  const handleDelete = () => {
    // TODO: Add confirmation dialog
    deleteDefect(defectId);
    onClose?.();
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text variant="headlineSmall" style={styles.title}>
                {defect.title}
              </Text>
              {onClose && (
                <IconButton
                  icon="close"
                  size={24}
                  onPress={onClose}
                />
              )}
            </View>

            <View style={styles.chips}>
              <Chip
                mode="flat"
                style={[
                  styles.chip,
                  { backgroundColor: getStatusColor(defect.status) + '20' }
                ]}
                textStyle={{ color: getStatusColor(defect.status) }}
              >
                {getStatusLabel(defect.status)}
              </Chip>

              <Chip
                mode="flat"
                style={[
                  styles.chip,
                  { backgroundColor: getPriorityColor(defect.priority) + '20' }
                ]}
                textStyle={{ color: getPriorityColor(defect.priority) }}
              >
                {getPriorityLabel(defect.priority)}
              </Chip>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Raum
            </Text>
            <Text variant="bodyLarge" style={styles.sectionContent}>
              {getRoomName(defect.roomId)}
            </Text>
          </View>

          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Beschreibung
            </Text>
            <Text variant="bodyMedium" style={styles.sectionContent}>
              {defect.description}
            </Text>
          </View>

          {defect.originalDescription && defect.originalLanguage && (
            <View style={styles.section}>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                Original ({defect.originalLanguage})
              </Text>
              <Text variant="bodyMedium" style={styles.originalText}>
                {defect.originalDescription}
              </Text>
            </View>
          )}

          {defect.images && defect.images.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                Fotos ({defect.images.length})
              </Text>
              <View style={styles.imageGrid}>
                {defect.images.map((imageUrl, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {defect.location && (
            <View style={styles.section}>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                Position
              </Text>
              <Text variant="bodyMedium" style={styles.sectionContent}>
                Grundriss: X: {(defect.location.x * 100).toFixed(0)}%, Y: {(defect.location.y * 100).toFixed(0)}%
                {defect.location.floor && ` · ${defect.location.floor}`}
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Zeitstempel
            </Text>
            <Text variant="bodySmall" style={styles.metaText}>
              Erstellt: {new Date(defect.createdAt).toLocaleString('de-DE')}
            </Text>
            <Text variant="bodySmall" style={styles.metaText}>
              Aktualisiert: {new Date(defect.updatedAt).toLocaleString('de-DE')}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.actions}>
            <Text variant="titleSmall" style={styles.actionsTitle}>
              Status ändern
            </Text>
            <View style={styles.statusButtons}>
              {defect.status !== DefectStatus.IN_PROGRESS && (
                <Button
                  mode="outlined"
                  onPress={() => handleStatusChange(DefectStatus.IN_PROGRESS)}
                  style={styles.actionButton}
                  icon="play"
                >
                  In Bearbeitung
                </Button>
              )}
              {defect.status !== DefectStatus.RESOLVED && (
                <Button
                  mode="outlined"
                  onPress={() => handleStatusChange(DefectStatus.RESOLVED)}
                  style={styles.actionButton}
                  icon="check"
                >
                  Behoben
                </Button>
              )}
              {defect.status !== DefectStatus.VERIFIED && (
                <Button
                  mode="outlined"
                  onPress={() => handleStatusChange(DefectStatus.VERIFIED)}
                  style={styles.actionButton}
                  icon="check-all"
                >
                  Verifiziert
                </Button>
              )}
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleDelete}
            style={styles.deleteButton}
            buttonColor={Colors.error}
            icon="delete"
          >
            Mangel löschen
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  card: {
    margin: Sizes.md,
    elevation: 2,
  },
  header: {
    marginBottom: Sizes.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Sizes.md,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
    color: Colors.text,
  },
  chips: {
    flexDirection: 'row',
    gap: Sizes.sm,
    flexWrap: 'wrap',
  },
  chip: {
    height: 28,
  },
  divider: {
    marginVertical: Sizes.lg,
  },
  section: {
    marginBottom: Sizes.lg,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: Sizes.sm,
    color: Colors.text,
  },
  sectionContent: {
    color: Colors.text,
    lineHeight: 22,
  },
  originalText: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Sizes.sm,
    marginTop: Sizes.sm,
  },
  imageContainer: {
    width: (width - Sizes.md * 4 - Sizes.sm) / 2,
    height: (width - Sizes.md * 4 - Sizes.sm) / 2,
    borderRadius: Sizes.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  metaText: {
    color: Colors.textSecondary,
    marginTop: Sizes.xs,
  },
  actions: {
    marginBottom: Sizes.lg,
  },
  actionsTitle: {
    fontWeight: '600',
    marginBottom: Sizes.md,
    color: Colors.text,
  },
  statusButtons: {
    gap: Sizes.sm,
  },
  actionButton: {
    marginBottom: Sizes.sm,
  },
  deleteButton: {
    marginTop: Sizes.md,
  },
});
