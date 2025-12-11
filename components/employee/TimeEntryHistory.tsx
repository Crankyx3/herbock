import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, List, IconButton, Chip, Searchbar } from 'react-native-paper';
import { useTimeTrackingStore } from '../../store/timeTrackingStore';
import { TimeEntry } from '../../types';
import { Colors, Sizes } from '../../constants';

export const TimeEntryHistory = () => {
  const { entries, deleteEntry } = useTimeTrackingStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = entries.filter(
    (entry) =>
      entry.activity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.projectId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')} Std`;
  };

  const groupEntriesByDate = () => {
    const grouped: { [key: string]: TimeEntry[] } = {};

    filteredEntries.forEach((entry) => {
      const dateKey = formatDate(entry.startTime);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });

    return Object.entries(grouped).sort((a, b) => {
      return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    });
  };

  const handleDelete = (id: string) => {
    // TODO: Add confirmation dialog
    deleteEntry(id);
  };

  const renderEntry = ({ item }: { item: TimeEntry }) => (
    <List.Item
      title={item.activity}
      description={`${formatTime(item.startTime)} - ${
        item.endTime ? formatTime(item.endTime) : 'laufend'
      }`}
      left={(props) => <List.Icon {...props} icon="clock-outline" />}
      right={() => (
        <View style={styles.entryRight}>
          {item.duration && (
            <Chip mode="outlined" style={styles.durationChip}>
              {formatDuration(item.duration)}
            </Chip>
          )}
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleDelete(item.id)}
            iconColor={Colors.error}
          />
        </View>
      )}
      style={styles.listItem}
    />
  );

  const renderDateGroup = ({ item }: { item: [string, TimeEntry[]] }) => {
    const [date, dateEntries] = item;
    const totalHours = dateEntries.reduce(
      (sum, entry) => sum + (entry.duration || 0),
      0
    );

    return (
      <Card style={styles.dateCard}>
        <Card.Content>
          <View style={styles.dateHeader}>
            <Text variant="titleMedium" style={styles.dateTitle}>
              {date}
            </Text>
            <Chip style={styles.totalChip}>
              {formatDuration(totalHours)}
            </Chip>
          </View>

          {dateEntries.map((entry) => (
            <View key={entry.id}>{renderEntry({ item: entry })}</View>
          ))}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Suche nach Tätigkeit..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={groupEntriesByDate()}
        keyExtractor={(item) => item[0]}
        renderItem={renderDateGroup}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {searchQuery
                ? 'Keine Einträge gefunden'
                : 'Noch keine Zeiterfassungen vorhanden'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchbar: {
    margin: Sizes.md,
    elevation: 0,
    backgroundColor: Colors.background,
  },
  dateCard: {
    margin: Sizes.md,
    marginTop: 0,
    elevation: 2,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.md,
    paddingBottom: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateTitle: {
    fontWeight: 'bold',
  },
  totalChip: {
    backgroundColor: Colors.primary + '20',
  },
  listItem: {
    paddingHorizontal: 0,
  },
  entryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationChip: {
    marginRight: Sizes.sm,
  },
  emptyContainer: {
    padding: Sizes.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
  },
  listContent: {
    paddingBottom: Sizes.lg,
  },
});
