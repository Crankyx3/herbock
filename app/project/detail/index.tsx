import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useProjectStore } from '../../../store/projectStore';
import { useDefectsStore } from '../../../store/defectsStore';
import { Colors, Sizes } from '../../../constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { selectedProject, loadProjectById } = useProjectStore();
  const { defects, loadDefects, loadRooms, rooms } = useDefectsStore();

  useEffect(() => {
    if (selectedProject) {
      // Load rooms and defects for the selected project
      console.log('📦 Loading project details, rooms, and defects...');
      loadProjectById(selectedProject.id);
      loadRooms(selectedProject.id);
      loadDefects(selectedProject.id);
    }
  }, [selectedProject?.id]);

  if (!selectedProject) {
    return (
      <View style={styles.container}>
        <Text>Projekt wird geladen...</Text>
      </View>
    );
  }

  const getRoomDefects = (roomId: string) => {
    return defects.filter((d) => d.roomId === roomId && d.projectId === selectedProject.id);
  };

  const renderRoom = (room: any) => {
    const roomDefects = getRoomDefects(room.id);
    const openDefects = roomDefects.filter((d) => d.status === 'OPEN').length;

    return (
      <TouchableOpacity
        key={room.id}
        onPress={() => {
          // Navigate to room floor plan
          router.push(`/project/room?id=${room.id}`);
        }}
      >
        <Card style={styles.roomCard}>
          <Card.Content>
            <View style={styles.roomHeader}>
              <View style={styles.roomInfo}>
                <MaterialCommunityIcons
                  name="floor-plan"
                  size={24}
                  color={Colors.primary}
                  style={styles.roomIcon}
                />
                <View>
                  <Text variant="titleMedium" style={styles.roomTitle}>
                    {room.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.roomMeta}>
                    {room.floor && `${room.floor} · `}
                    {room.area && `${room.area} m²`}
                  </Text>
                </View>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={Colors.textSecondary}
              />
            </View>

            {room.description && (
              <Text variant="bodySmall" style={styles.roomDescription}>
                {room.description}
              </Text>
            )}

            {roomDefects.length > 0 && (
              <View style={styles.defectsInfo}>
                <Chip
                  mode="flat"
                  style={[styles.defectChip, openDefects > 0 && styles.defectChipWarning]}
                  textStyle={{ fontSize: 12 }}
                >
                  {roomDefects.length} Mängel {openDefects > 0 && `· ${openDefects} offen`}
                </Chip>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            {selectedProject.name}
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            {selectedProject.description}
          </Text>
          <Text variant="bodySmall" style={styles.meta}>
            {rooms.length} Räume
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.roomsSection}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Räume auswählen
        </Text>
        <Text variant="bodySmall" style={styles.sectionSubtitle}>
          Tippen Sie auf einen Raum, um den Grundriss zu sehen und Mängel zu markieren
        </Text>
      </View>

      {rooms.length > 0 ? (
        rooms.map((room) => renderRoom(room))
      ) : (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>Keine Räume verfügbar</Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
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
  title: {
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Sizes.xs,
  },
  description: {
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  meta: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  roomsSection: {
    paddingHorizontal: Sizes.md,
    paddingTop: Sizes.md,
    paddingBottom: Sizes.sm,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Sizes.xs,
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
  },
  roomCard: {
    marginHorizontal: Sizes.md,
    marginBottom: Sizes.md,
    elevation: 2,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roomIcon: {
    marginRight: Sizes.md,
  },
  roomTitle: {
    fontWeight: '600',
    color: Colors.text,
  },
  roomMeta: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roomDescription: {
    color: Colors.textSecondary,
    marginTop: Sizes.sm,
    lineHeight: 18,
  },
  defectsInfo: {
    marginTop: Sizes.sm,
  },
  defectChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
  },
  defectChipWarning: {
    backgroundColor: Colors.warning + '20',
  },
  emptyCard: {
    margin: Sizes.md,
    elevation: 1,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
