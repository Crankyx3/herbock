import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, ProgressBar, Button, Divider } from 'react-native-paper';
import { useTimeTrackingStore } from '../../store/timeTrackingStore';
import { Colors, Sizes } from '../../constants';

export const WeeklyReport = () => {
  const { entries } = useTimeTrackingStore();
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);

  const getWeekStart = (offset: number = 0) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() + offset * 7);
    return weekStart;
  };

  const weekStart = getWeekStart(selectedWeekOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weeklyData = useMemo(() => {
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const dayData = days.map((day, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(dayDate.getDate() + index);

      const dayEntries = entries.filter((entry) => {
        const entryDate = new Date(entry.startTime);
        return (
          entryDate.toDateString() === dayDate.toDateString() &&
          entry.duration
        );
      });

      const hours = dayEntries.reduce(
        (sum, entry) => sum + (entry.duration || 0),
        0
      );

      return {
        day,
        date: dayDate,
        hours,
        entries: dayEntries,
      };
    });

    const totalHours = dayData.reduce((sum, d) => sum + d.hours, 0);
    const targetHours = 40;
    const progress = totalHours / targetHours;

    return {
      days: dayData,
      totalHours,
      targetHours,
      progress,
    };
  }, [entries, selectedWeekOffset]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  const getWeekLabel = () => {
    if (selectedWeekOffset === 0) return 'Diese Woche';
    if (selectedWeekOffset === -1) return 'Letzte Woche';
    if (selectedWeekOffset === 1) return 'Nächste Woche';
    return `KW ${getWeekNumber(weekStart)}`;
  };

  const getWeekNumber = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return weekNo;
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.weekSelector}>
            <Button
              icon="chevron-left"
              onPress={() => setSelectedWeekOffset(selectedWeekOffset - 1)}
            >
              Zurück
            </Button>
            <Text variant="titleMedium" style={styles.weekLabel}>
              {getWeekLabel()}
            </Text>
            <Button
              icon="chevron-right"
              onPress={() => setSelectedWeekOffset(selectedWeekOffset + 1)}
              disabled={selectedWeekOffset >= 0}
            >
              Weiter
            </Button>
          </View>

          <Text variant="bodySmall" style={styles.dateRange}>
            {formatDate(weekStart)} - {formatDate(weekEnd)}
          </Text>

          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text variant="displaySmall" style={styles.totalHours}>
                {formatHours(weeklyData.totalHours)}
              </Text>
              <Text variant="bodyLarge" style={styles.targetHours}>
                / {weeklyData.targetHours} Std
              </Text>
            </View>

            <ProgressBar
              progress={Math.min(weeklyData.progress, 1)}
              color={
                weeklyData.progress >= 1
                  ? Colors.success
                  : weeklyData.progress >= 0.8
                  ? Colors.warning
                  : Colors.primary
              }
              style={styles.progressBar}
            />

            <View style={styles.progressInfo}>
              <Text variant="bodySmall" style={styles.progressText}>
                {weeklyData.progress >= 1
                  ? `${formatHours(
                      weeklyData.totalHours - weeklyData.targetHours
                    )} Überstunden`
                  : `${formatHours(
                      weeklyData.targetHours - weeklyData.totalHours
                    )} verbleibend`}
              </Text>
              <Text variant="bodySmall" style={styles.percentage}>
                {Math.round(weeklyData.progress * 100)}%
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Tagesübersicht
          </Text>

          {weeklyData.days.map((dayData, index) => (
            <View key={index} style={styles.dayRow}>
              <View style={styles.dayInfo}>
                <Text variant="bodyMedium" style={styles.dayName}>
                  {dayData.day}
                </Text>
                <Text variant="bodySmall" style={styles.dayDate}>
                  {formatDate(dayData.date)}
                </Text>
              </View>

              <View style={styles.dayHours}>
                <Text
                  variant="bodyLarge"
                  style={[
                    styles.hoursText,
                    dayData.hours === 0 && styles.noHours,
                  ]}
                >
                  {formatHours(dayData.hours)} Std
                </Text>
                {dayData.hours > 8 && (
                  <Text variant="bodySmall" style={styles.overtimeText}>
                    +{formatHours(dayData.hours - 8)} Ü
                  </Text>
                )}
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: Sizes.md,
    elevation: 2,
  },
  weekSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  weekLabel: {
    fontWeight: 'bold',
  },
  dateRange: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: Sizes.lg,
  },
  summarySection: {
    marginBottom: Sizes.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: Sizes.md,
  },
  totalHours: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  targetHours: {
    marginLeft: Sizes.sm,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 8,
    borderRadius: Sizes.borderRadius.sm,
    marginBottom: Sizes.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: Colors.textSecondary,
  },
  percentage: {
    fontWeight: '600',
    color: Colors.primary,
  },
  divider: {
    marginVertical: Sizes.lg,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: Sizes.md,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontWeight: '600',
  },
  dayDate: {
    color: Colors.textSecondary,
    marginTop: Sizes.xs,
  },
  dayHours: {
    alignItems: 'flex-end',
  },
  hoursText: {
    fontWeight: '600',
  },
  noHours: {
    color: Colors.textSecondary,
  },
  overtimeText: {
    color: Colors.warning,
    marginTop: Sizes.xs,
  },
});
