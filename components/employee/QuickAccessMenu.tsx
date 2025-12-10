import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Sizes } from '../../constants';

interface QuickAccessItemProps {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

const QuickAccessItem = ({ icon, label, color, onPress }: QuickAccessItemProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.item}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <MaterialCommunityIcons name={icon as any} size={32} color={color} />
      </View>
      <Text variant="bodyMedium" style={styles.label}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const QuickAccessMenu = () => {
  const router = useRouter();

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Schnellzugriff
        </Text>

        <View style={styles.grid}>
          <QuickAccessItem
            icon="folder-multiple"
            label="Meine Projekte"
            color={Colors.primary}
            onPress={() => router.push('/project/list' as any)}
          />
          <QuickAccessItem
            icon="beach"
            label="Urlaubsantrag"
            color={Colors.success}
            onPress={() => router.push('/employee/hr' as any)}
          />
          <QuickAccessItem
            icon="file-document"
            label="Lohnabrechnung"
            color={Colors.warning}
            onPress={() => router.push('/employee/hr' as any)}
          />
          <QuickAccessItem
            icon="clock-outline"
            label="Zeiterfassung"
            color={Colors.info}
            onPress={() => router.push('/employee/timetracking' as any)}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: Sizes.md,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: Sizes.lg,
    color: Colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Sizes.md,
  },
  item: {
    width: '47%',
    alignItems: 'center',
    padding: Sizes.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: Sizes.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  label: {
    textAlign: 'center',
    color: Colors.text,
  },
});
