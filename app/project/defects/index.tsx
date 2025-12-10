import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors, Sizes } from '../../../constants';

export default function DefectsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Mängel & Restarbeiten
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Mängel-Management mit KI-gestützter Spracherkennung wird hier implementiert...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Sizes.lg,
    backgroundColor: Colors.surface,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: Sizes.md,
  },
  subtitle: {
    color: Colors.textSecondary,
  },
});
