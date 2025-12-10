import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants';

interface NotificationItemProps {
  icon: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  badge?: number;
  onPress?: () => void;
}

const NotificationItem = ({ icon, title, message, type, badge, onPress }: NotificationItemProps) => {
  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return Colors.error;
      case 'info':
        return Colors.info;
      case 'success':
        return Colors.success;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.notificationItem}>
        <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}20` }]}>
          <MaterialCommunityIcons name={icon as any} size={24} color={getIconColor()} />
        </View>
        <View style={styles.notificationContent}>
          <Text variant="bodyMedium" style={styles.notificationTitle}>
            {title}
          </Text>
          <Text variant="bodySmall" style={styles.notificationMessage}>
            {message}
          </Text>
        </View>
        {badge !== undefined && badge > 0 && (
          <Badge style={styles.badge}>{badge}</Badge>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const NotificationCenter = () => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Benachrichtigungen
        </Text>

        <NotificationItem
          icon="alert-circle"
          title="Zeiterfassung unvollständig"
          message="Bitte Zeiten für Dienstag prüfen!"
          type="warning"
        />

        <NotificationItem
          icon="message-text"
          title="Neue Nachrichten"
          message="3 neue Nachrichten im Projekt 'Bauvorhaben Müller'"
          type="info"
          badge={3}
        />

        <NotificationItem
          icon="clipboard-check"
          title="Mängel zugewiesen"
          message="Du wurdest in 2 neuen Mängeln markiert"
          type="info"
          badge={2}
        />
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
    marginBottom: Sizes.md,
    color: Colors.text,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Sizes.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Sizes.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Sizes.xs,
  },
  notificationMessage: {
    color: Colors.textSecondary,
  },
  badge: {
    backgroundColor: Colors.primary,
  },
});
