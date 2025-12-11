import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Text, Badge, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useProjectStore } from '../../../store/projectStore';
import { Colors, Sizes } from '../../../constants';

interface ProjectItemProps {
  id: string;
  name: string;
  description: string;
  status: string;
  unreadMessages: number;
  openDefects: number;
}

const ProjectItem = ({ id, name, description, status, unreadMessages, openDefects }: ProjectItemProps) => {
  const router = useRouter();
  const { projects, setSelectedProject } = useProjectStore();

  const handlePress = () => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      setSelectedProject(project);
      router.push('../detail/index');
    }
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={handlePress}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.projectName}>
            {name}
          </Text>
          <Text variant="bodySmall" style={styles.description}>
            {description}
          </Text>

          <Divider style={styles.divider} />

          <View style={styles.footer}>
            <View style={styles.indicators}>
              {unreadMessages > 0 && (
                <View style={styles.indicator}>
                  <MaterialCommunityIcons name="message-text" size={20} color={Colors.info} />
                  <Badge style={styles.badge}>{unreadMessages}</Badge>
                </View>
              )}
              {openDefects > 0 && (
                <View style={styles.indicator}>
                  <MaterialCommunityIcons name="alert-circle" size={20} color={Colors.warning} />
                  <Badge style={styles.badge}>{openDefects}</Badge>
                </View>
              )}
            </View>
            <Text variant="bodySmall" style={[styles.status, { color: getStatusColor(status) }]}>
              {status}
            </Text>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return Colors.success;
    case 'COMPLETED':
      return Colors.textSecondary;
    default:
      return Colors.text;
  }
};

export default function ProjectListScreen() {
  const { projects, loadProjects } = useProjectStore();

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {projects.map((project) => (
        <ProjectItem
          key={project.id}
          id={project.id}
          name={project.name}
          description={project.description || ''}
          status={project.status}
          unreadMessages={project.unreadMessages}
          openDefects={project.openDefects}
        />
      ))}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  card: {
    margin: Sizes.md,
    elevation: 2,
  },
  projectName: {
    fontWeight: 'bold',
    marginBottom: Sizes.xs,
  },
  description: {
    color: Colors.textSecondary,
    marginBottom: Sizes.md,
  },
  divider: {
    marginVertical: Sizes.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indicators: {
    flexDirection: 'row',
    gap: Sizes.md,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizes.xs,
  },
  badge: {
    backgroundColor: Colors.primary,
  },
  status: {
    fontWeight: '600',
  },
});
