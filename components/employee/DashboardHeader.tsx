import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { Colors, Sizes } from '../../constants';

export const DashboardHeader = () => {
  const user = useAuthStore((state) => state.user);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text variant="titleLarge" style={styles.greeting}>
          {getGreeting()},
        </Text>
        <Text variant="headlineSmall" style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
      </View>
      <TouchableOpacity>
        <Avatar.Text
          size={56}
          label={`${user?.firstName?.[0]}${user?.lastName?.[0]}`}
          style={styles.avatar}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Sizes.lg,
    backgroundColor: Colors.background,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    color: Colors.textSecondary,
  },
  name: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  avatar: {
    backgroundColor: Colors.primary,
  },
});
