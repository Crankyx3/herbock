import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Card, Text, Chip, IconButton, Searchbar, Button, Divider } from 'react-native-paper';
import { useDefectsStore } from '../../store/defectsStore';
import { useProjectStore } from '../../store/projectStore';
import { Defect, DefectStatus, DefectPriority, Room } from '../../types';
import { Colors, Sizes } from '../../constants';

interface DefectsListProps {
  roomId?: string;
}

export const DefectsList = ({ roomId }: DefectsListProps) => {
  const { defects, rooms, loadDefects } = useDefectsStore();
  const { selectedProject } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      loadDefects(selectedProject.id);
    }
  }, [selectedProject]);

  const filteredDefects = defects.filter(
    (defect) =>
      defect.projectId === selectedProject?.id &&
      (!roomId || defect.roomId === roomId) &&
      (defect.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        defect.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  const getRoomName = (roomId?: string) => {
    if (!roomId) return 'Kein Raum';
    const room = selectedProject?.rooms?.find((r) => r.id === roomId);
    return room ? room.name : 'Unbekannt';
  };

  const groupDefectsByRoom = () => {
    const grouped: { [key: string]: { room: string; defects: Defect[] } } = {};

    filteredDefects.forEach((defect) => {
      const roomKey = defect.roomId || 'no-room';
      const roomName = getRoomName(defect.roomId);

      if (!grouped[roomKey]) {
        grouped[roomKey] = {
          room: roomName,
          defects: [],
        };
      }

      grouped[roomKey].defects.push(defect);
    });

    return Object.entries(grouped).map(([key, value]) => ({
      roomId: key,
      roomName: value.room,
      // Sort defects by creation date (oldest first) to match flag numbering
      defects: value.defects.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    }));
  };

  const renderDefect = (defect: Defect, index: number) => (
    <TouchableOpacity
      key={defect.id}
      onPress={() => {
        setSelectedDefect(defect);
        setShowModal(true);
      }}
      style={styles.defectItem}
    >
      <View style={styles.defectHeader}>
        <View style={styles.defectTitleRow}>
          <Text variant="titleSmall" style={styles.defectTitle} numberOfLines={1}>
            Mangel {index + 1}: {defect.title}
          </Text>
          <Chip
            mode="flat"
            style={[styles.priorityChip, { backgroundColor: getPriorityColor(defect.priority) + '20' }]}
            textStyle={{ color: getPriorityColor(defect.priority), fontSize: 11 }}
          >
            {getPriorityLabel(defect.priority)}
          </Chip>
        </View>

        <Text variant="bodySmall" style={styles.defectDescription} numberOfLines={2}>
          {defect.description}
        </Text>

        <View style={styles.defectFooter}>
          <Chip
            mode="outlined"
            style={styles.statusChip}
            textStyle={{ color: getStatusColor(defect.status), fontSize: 11 }}
          >
            {getStatusLabel(defect.status)}
          </Chip>

          <View style={styles.defectMeta}>
            {defect.images && defect.images.length > 0 && (
              <View style={styles.metaItem}>
                <IconButton icon="camera" size={16} iconColor={Colors.textSecondary} />
                <Text variant="bodySmall" style={styles.metaText}>
                  {defect.images.length}
                </Text>
              </View>
            )}
            <Text variant="bodySmall" style={styles.dateText}>
              {new Date(defect.createdAt).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRoomGroup = ({ item }: { item: { roomId: string; roomName: string; defects: Defect[] } }) => {
    const openDefects = item.defects.filter((d) => d.status === DefectStatus.OPEN).length;

    return (
      <Card style={styles.roomCard}>
        <Card.Content>
          <View style={styles.roomHeader}>
            <View>
              <Text variant="titleMedium" style={styles.roomTitle}>
                {item.roomName}
              </Text>
              <Text variant="bodySmall" style={styles.roomSubtitle}>
                {item.defects.length} Mängel {openDefects > 0 && `· ${openDefects} offen`}
              </Text>
            </View>
          </View>

          {item.defects.map((defect, index) => renderDefect(defect, index))}
        </Card.Content>
      </Card>
    );
  };

  const groupedDefects = groupDefectsByRoom();

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Mängel durchsuchen..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={groupedDefects}
        keyExtractor={(item) => item.roomId}
        renderItem={renderRoomGroup}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {searchQuery
                ? 'Keine Mängel gefunden'
                : 'Noch keine Mängel dokumentiert'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Defect Detail Modal */}
      <Modal
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalContent}>
              {selectedDefect && (
                <>
                  <View style={styles.modalHeader}>
                    <Text variant="headlineSmall" style={styles.modalTitle}>
                      {selectedDefect.title}
                    </Text>
                    <IconButton
                      icon="close"
                      size={24}
                      onPress={() => setShowModal(false)}
                      style={styles.modalCloseButton}
                    />
                  </View>

                  <Divider style={styles.modalDivider} />

                  <View style={styles.modalSection}>
                    <Text variant="labelLarge" style={styles.modalLabel}>
                      Beschreibung
                    </Text>
                    <Text variant="bodyMedium" style={styles.modalText}>
                      {selectedDefect.description || 'Keine Beschreibung vorhanden'}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text variant="labelLarge" style={styles.modalLabel}>
                      Status
                    </Text>
                    <Chip
                      mode="outlined"
                      style={styles.modalChip}
                      textStyle={{ color: getStatusColor(selectedDefect.status) }}
                    >
                      {getStatusLabel(selectedDefect.status)}
                    </Chip>
                  </View>

                  <View style={styles.modalSection}>
                    <Text variant="labelLarge" style={styles.modalLabel}>
                      Priorität
                    </Text>
                    <Chip
                      mode="flat"
                      style={[styles.modalChip, { backgroundColor: getPriorityColor(selectedDefect.priority) + '20' }]}
                      textStyle={{ color: getPriorityColor(selectedDefect.priority) }}
                    >
                      {getPriorityLabel(selectedDefect.priority)}
                    </Chip>
                  </View>

                  <View style={styles.modalSection}>
                    <Text variant="labelLarge" style={styles.modalLabel}>
                      Raum
                    </Text>
                    <Text variant="bodyMedium" style={styles.modalText}>
                      {getRoomName(selectedDefect.roomId)}
                    </Text>
                  </View>

                  {selectedDefect.images && selectedDefect.images.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text variant="labelLarge" style={styles.modalLabel}>
                        Bilder
                      </Text>
                      <Text variant="bodyMedium" style={styles.modalText}>
                        {selectedDefect.images.length} Bild(er)
                      </Text>
                    </View>
                  )}

                  <View style={styles.modalSection}>
                    <Text variant="labelLarge" style={styles.modalLabel}>
                      Erstellt am
                    </Text>
                    <Text variant="bodyMedium" style={styles.modalText}>
                      {new Date(selectedDefect.createdAt).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  <Button
                    mode="contained"
                    onPress={() => setShowModal(false)}
                    style={styles.modalButton}
                  >
                    Schließen
                  </Button>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  searchbar: {
    margin: Sizes.md,
    elevation: 0,
    backgroundColor: Colors.background,
  },
  roomCard: {
    margin: Sizes.md,
    marginTop: 0,
    elevation: 2,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.md,
    paddingBottom: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  roomTitle: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  roomSubtitle: {
    color: Colors.textSecondary,
    marginTop: Sizes.xs,
  },
  defectItem: {
    marginBottom: Sizes.lg,
    paddingBottom: Sizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '40',
  },
  defectHeader: {
    gap: Sizes.md,
  },
  defectTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Sizes.sm,
  },
  defectTitle: {
    flex: 1,
    fontWeight: '600',
    color: Colors.text,
  },
  priorityChip: {
    height: 32,
    minWidth: 80,
  },
  defectDescription: {
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  defectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Sizes.sm,
  },
  statusChip: {
    height: 32,
    minWidth: 100,
  },
  defectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizes.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: Colors.textSecondary,
    marginLeft: -8,
  },
  dateText: {
    color: Colors.textSecondary,
  },
  emptyContainer: {
    padding: Sizes.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
  },
  listContent: {
    paddingBottom: Sizes.xxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Sizes.lg,
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    maxHeight: '80%',
    width: '100%',
    maxWidth: 500,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContent: {
    padding: Sizes.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Sizes.md,
  },
  modalTitle: {
    flex: 1,
    fontWeight: 'bold',
    color: Colors.text,
    paddingRight: Sizes.md,
  },
  modalCloseButton: {
    margin: -8,
  },
  modalDivider: {
    marginBottom: Sizes.lg,
  },
  modalSection: {
    marginBottom: Sizes.lg,
  },
  modalLabel: {
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Sizes.sm,
  },
  modalText: {
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  modalChip: {
    alignSelf: 'flex-start',
  },
  modalButton: {
    marginTop: Sizes.md,
    marginBottom: Sizes.lg,
  },
});
