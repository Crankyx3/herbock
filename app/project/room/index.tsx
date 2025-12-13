import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import { Text, FAB, Card, Chip, Button, TextInput, SegmentedButtons } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useProjectStore } from '../../../store/projectStore';
import { useDefectsStore } from '../../../store/defectsStore';
import { DefectPriority } from '../../../types';
import { Colors, Sizes } from '../../../constants';

const { width, height } = Dimensions.get('window');
const API_URL = 'http://192.168.0.227:3000';

export default function RoomFloorPlanScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedProject } = useProjectStore();
  const { defects, addDefect, rooms, loadRooms } = useDefectsStore();
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [pdfLoading, setPdfLoading] = useState(true);
  const [isPlacementMode, setIsPlacementMode] = useState(false);

  // Form state
  const [showDefectForm, setShowDefectForm] = useState(false);
  const [defectPosition, setDefectPosition] = useState({ x: 0, y: 0 });
  const [defectTitle, setDefectTitle] = useState('');
  const [defectDescription, setDefectDescription] = useState('');
  const [defectPriority, setDefectPriority] = useState<DefectPriority>(DefectPriority.MEDIUM);

  // Load rooms and defects when component mounts
  useEffect(() => {
    if (selectedProject) {
      console.log('📦 Loading rooms and defects for project:', selectedProject.id);
      loadRooms(selectedProject.id);
      // Also load defects for this project
      const { loadDefects } = useDefectsStore.getState();
      loadDefects(selectedProject.id);
    }
  }, [selectedProject?.id]);

  const room = rooms.find((r) => r.id === id);
  // Filter and sort defects by creation date (oldest first) for stable indices
  const roomDefects = defects
    .filter((d) => d.roomId === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Debug logging for defects
  useEffect(() => {
    console.log('🔍 Total defects:', defects.length);
    console.log('🔍 Room defects:', roomDefects.length);
    console.log('🔍 ImageLayout:', imageLayout);
  }, [defects, roomDefects, imageLayout]);

  // Send markers to WebView
  const webViewRef = React.useRef<any>(null);

  useEffect(() => {
    if (webViewRef.current && imageLayout.width > 0) {
      const markers = roomDefects.map((defect, index) => ({
        id: defect.id,
        index: index + 1,
        x: defect.location?.x || 0,
        y: defect.location?.y || 0,
        title: defect.title,
        description: defect.description,
        priority: defect.priority,
      }));

      const message = JSON.stringify({ type: 'setMarkers', markers });
      webViewRef.current.postMessage(message);
      console.log('📍 Sent markers to WebView:', markers.length);
    }
  }, [roomDefects, imageLayout.width]);

  // Send placement mode to WebView
  useEffect(() => {
    if (webViewRef.current) {
      const message = JSON.stringify({ type: 'setPlacementMode', enabled: isPlacementMode });
      webViewRef.current.postMessage(message);
      console.log('🎯 Placement mode:', isPlacementMode);
    }
  }, [isPlacementMode]);

  // Debug logging
  useEffect(() => {
    if (room) {
      console.log('Room loaded:', room.name);
      console.log('Floor plan URL:', room.floorPlanUrl);
      const pdfViewerUrl = `${API_URL}/pdf-viewer.html?file=${encodeURIComponent(room.floorPlanUrl || '')}`;
      console.log('PDF Viewer URL:', pdfViewerUrl);
    }
  }, [room]);

  if (!room) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Raum wird geladen...</Text>
      </View>
    );
  }

  const handleFloorPlanPress = (event: any) => {
    // Only allow defect placement in placement mode
    if (!isPlacementMode) {
      return;
    }

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
    setIsPlacementMode(false); // Exit placement mode after placing
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
    if (!defect.location || !imageLayout.width) {
      console.log('⚠️ Skipping marker - no location or layout:', {
        hasLocation: !!defect.location,
        layoutWidth: imageLayout.width
      });
      return null;
    }

    const markerX = defect.location.x * imageLayout.width;
    const markerY = defect.location.y * imageLayout.height;

    console.log(`📍 Rendering marker ${index + 1}:`, {
      defectId: defect.id,
      locationX: defect.location.x,
      locationY: defect.location.y,
      markerX,
      markerY,
      imageLayoutWidth: imageLayout.width,
      imageLayoutHeight: imageLayout.height
    });

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

    const color = getPriorityColor(defect.priority);

    return (
      <TouchableOpacity
        key={defect.id}
        style={[
          styles.defectMarker,
          {
            left: markerX - 18, // Center the marker (half of width 36)
            top: markerY - 44, // Position flag above the point (full height)
          },
        ]}
        onPress={() => {
          console.log('🎯 Marker pressed:', defect.title);
          Alert.alert(
            `Mangel ${index + 1}: ${defect.title}`,
            defect.description || 'Keine Beschreibung',
            [{ text: 'OK' }]
          );
        }}
      >
        <View style={styles.flagPole} />
        <View style={[styles.flagBody, { backgroundColor: color }]}>
          <Text style={styles.markerText}>{index + 1}</Text>
        </View>
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

      {isPlacementMode && (
        <View style={styles.placementModeCard}>
          <Text variant="bodySmall" style={styles.placementModeText}>
            📍 Tippen Sie auf den Grundriss, um einen Mangel zu platzieren
          </Text>
          <Button
            mode="outlined"
            onPress={() => setIsPlacementMode(false)}
            style={styles.cancelButton}
            textColor={Colors.error}
          >
            Abbrechen
          </Button>
        </View>
      )}

      <View style={styles.floorPlanContainer}>
        {room.floorPlanUrl ? (
          <>
            <View style={styles.floorPlanWrapper}>
              <View
                style={[
                  styles.floorPlanTouch,
                  isPlacementMode && styles.floorPlanTouchActive
                ]}
                onLayout={(event) => {
                  const { x, y, width, height } = event.nativeEvent.layout;
                  setImageLayout({ x, y, width, height });
                }}
              >
                <WebView
                ref={webViewRef}
                source={{
                  uri: `${API_URL}/pdf-viewer.html?file=${encodeURIComponent(room.floorPlanUrl)}`
                }}
                style={styles.webview}
                onLoadStart={(e) => {
                  console.log('WebView load start:', e.nativeEvent.url);
                  setPdfLoading(true);
                }}
                onLoadEnd={(e) => {
                  console.log('WebView load end:', e.nativeEvent.url);
                  setPdfLoading(false);
                }}
                onError={(error) => {
                  console.error('WebView error:', error.nativeEvent);
                  setPdfLoading(false);
                  Alert.alert('Fehler', 'PDF konnte nicht geladen werden: ' + JSON.stringify(error.nativeEvent));
                }}
                onMessage={(event) => {
                  const data = JSON.parse(event.nativeEvent.data);
                  console.log('WebView message:', data);

                  // Handle marker click from WebView
                  if (data.type === 'markerClick') {
                    const defect = roomDefects.find(d => d.id === data.markerId);
                    if (defect) {
                      Alert.alert(
                        `Mangel ${data.markerIndex}: ${defect.title}`,
                        defect.description || 'Keine Beschreibung',
                        [{ text: 'OK' }]
                      );
                    }
                  }

                  // Handle placement click from WebView
                  if (data.type === 'placementClick' && isPlacementMode) {
                    setDefectPosition({ x: data.x, y: data.y });
                    setDefectTitle('');
                    setDefectDescription('');
                    setDefectPriority(DefectPriority.MEDIUM);
                    setShowDefectForm(true);
                    setIsPlacementMode(false);
                  }
                }}
                onHttpError={(event) => {
                  console.error('HTTP error:', event.nativeEvent);
                  Alert.alert('HTTP Fehler', `Status: ${event.nativeEvent.statusCode}`);
                }}
                originWhitelist={['*']}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scrollEnabled={!isPlacementMode}
                mixedContentMode="always"
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                automaticallyAdjustContentInsets={false}
                bounces={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                minimumZoomScale={1}
                maximumZoomScale={5}
                opacity={1}
              />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Kein Grundriss vorhanden</Text>
            <Text style={styles.placeholderSubtext}>
              Für diesen Raum wurde noch kein Grundriss hochgeladen.
            </Text>
            <Text style={styles.placeholderHint}>
              Bitte laden Sie einen Grundriss über das Admin-Dashboard hoch.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.defectsListContainer}>
        <Text variant="titleSmall" style={styles.defectsTitle}>
          Mängel in diesem Raum ({roomDefects.length})
        </Text>
        {roomDefects.length > 0 ? (
          <ScrollView
            style={styles.defectsScrollView}
            contentContainerStyle={styles.defectsScrollContent}
            showsVerticalScrollIndicator={true}
          >
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
          </ScrollView>
        ) : (
          <Text variant="bodySmall" style={styles.noDefectsText}>
            Noch keine Mängel in diesem Raum
          </Text>
        )}
      </View>

      <FAB
        icon="plus"
        style={[styles.fab, styles.fabAdd]}
        label="Mangel setzen"
        onPress={() => setIsPlacementMode(true)}
        visible={!isPlacementMode}
      />

      <FAB
        icon="format-list-bulleted"
        style={[styles.fab, styles.fabList]}
        onPress={() => router.push(`/project/defects?roomId=${id}`)}
        visible={!isPlacementMode}
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
  placementModeCard: {
    backgroundColor: Colors.error + '15',
    padding: Sizes.md,
    marginHorizontal: Sizes.md,
    marginBottom: Sizes.md,
    borderRadius: Sizes.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placementModeText: {
    color: Colors.error,
    flex: 1,
    marginRight: Sizes.sm,
  },
  cancelButton: {
    borderColor: Colors.error,
  },
  floorPlanContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginHorizontal: Sizes.md,
    borderRadius: Sizes.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  floorPlanWrapper: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  floorPlanTouch: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  floorPlanTouchActive: {
    borderWidth: 3,
    borderColor: Colors.error,
    borderStyle: 'dashed',
  },
  webview: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    opacity: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: Sizes.md,
    color: Colors.textSecondary,
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
    width: 36,
    height: 44,
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
    pointerEvents: 'auto',
  },
  flagPole: {
    position: 'absolute',
    width: 3,
    height: 44,
    backgroundColor: '#333',
    left: 0,
    top: 0,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  flagBody: {
    position: 'absolute',
    left: 3,
    top: 0,
    width: 32,
    height: 24,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  defectsListContainer: {
    padding: Sizes.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    maxHeight: 180,
  },
  defectsTitle: {
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Sizes.sm,
  },
  defectsScrollView: {
    maxHeight: 130,
  },
  defectsScrollContent: {
    paddingBottom: Sizes.xs,
  },
  defectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  defectChip: {
    width: '48%',
    marginBottom: Sizes.sm,
  },
  noDefectsText: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    right: Sizes.md,
    backgroundColor: Colors.primary,
  },
  fabAdd: {
    bottom: Sizes.md + 60,
  },
  fabList: {
    bottom: Sizes.md,
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
