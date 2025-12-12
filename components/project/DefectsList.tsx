import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, IconButton, Searchbar, FAB } from 'react-native-paper';
import { useDefectsStore } from '../../store/defectsStore';
import { useProjectStore } from '../../store/projectStore';
import { Defect, DefectStatus, DefectPriority, Room } from '../../types';
import { Colors, Sizes } from '../../constants';
import { useRouter } from 'expo-router';

export const DefectsList = () => {
  const { defects, rooms, loadDefects } = useDefectsStore();
  const { selectedProject } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadDefects();
  }, []);

  const filteredDefects = defects.filter(
    (defect) =>
      defect.projectId === selectedProject?.id &&
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
      defects: value.defects,
    }));
  };

  const renderDefect = (defect: Defect) => (
    <TouchableOpacity
      key={defect.id}
      onPress={() => {
        // TODO: Navigate to defect detail
        console.log('Navigate to defect:', defect.id);
      }}
      style={styles.defectItem}
    >
      <View style={styles.defectHeader}>
        <View style={styles.defectTitleRow}>
          <Text variant="titleSmall" style={styles.defectTitle} numberOfLines={1}>
            {defect.title}
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

          {item.defects.map((defect) => renderDefect(defect))}
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

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // TODO: Navigate to add defect
          console.log('Add defect');
        }}
      />
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
    marginBottom: Sizes.md,
    paddingBottom: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '40',
  },
  defectHeader: {
    gap: Sizes.sm,
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
    height: 24,
  },
  defectDescription: {
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  defectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Sizes.xs,
  },
  statusChip: {
    height: 24,
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
    paddingBottom: Sizes.xxl + 40,
  },
  fab: {
    position: 'absolute',
    right: Sizes.md,
    bottom: Sizes.md,
    backgroundColor: Colors.primary,
  },
});
