import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, ActivityIndicator } from 'react-native-paper';
import api, { API_BASE_URL } from '../services/api';

export default function BackendTest() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Auto-test on mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      // Test 1: Health Check
      console.log('Testing backend connection...');
      const health = await api.healthCheck();

      // Test 2: API Test
      const test = await api.test();

      setStatus('success');
      setMessage(`✅ Backend verbunden!\n\n${health.message}\n${test.message}`);
    } catch (error: any) {
      console.error('Backend test failed:', error);
      setStatus('error');
      setMessage(`❌ Verbindung fehlgeschlagen:\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleLarge" style={styles.title}>
          Backend Connection Test
        </Text>

        <Text variant="bodyMedium" style={styles.url}>
          {API_BASE_URL}
        </Text>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Teste Verbindung...</Text>
          </View>
        )}

        {!loading && status === 'success' && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{message}</Text>
          </View>
        )}

        {!loading && status === 'error' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{message}</Text>
          </View>
        )}

        {!loading && (
          <Button
            mode="contained"
            onPress={testConnection}
            style={styles.button}
          >
            Erneut testen
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  url: {
    marginBottom: 16,
    color: '#666',
    fontFamily: 'monospace',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  successContainer: {
    backgroundColor: '#d4edda',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#155724',
    fontFamily: 'monospace',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#721c24',
    fontFamily: 'monospace',
  },
  button: {
    marginTop: 8,
  },
});
