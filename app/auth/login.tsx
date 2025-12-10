import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Colors, Sizes } from '../../constants';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.replace('/employee/dashboard');
    } catch (err) {
      setError('Login fehlgeschlagen. Bitte überprüfen Sie Ihre Zugangsdaten.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            Herbock
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Mitarbeiter-App
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="E-Mail"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
          />

          <TextInput
            label="Passwort"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            style={styles.input}
          />

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading || !email || !password}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Anmelden
          </Button>

          <Divider style={styles.divider} />

          <Text variant="bodyMedium" style={styles.helpText}>
            Probleme beim Anmelden? Kontaktieren Sie Ihren Administrator.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Sizes.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Sizes.xxl,
  },
  title: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginTop: Sizes.sm,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: Sizes.md,
  },
  button: {
    marginTop: Sizes.md,
    borderRadius: Sizes.borderRadius.md,
  },
  buttonContent: {
    paddingVertical: Sizes.sm,
  },
  error: {
    color: Colors.error,
    marginBottom: Sizes.md,
    textAlign: 'center',
  },
  divider: {
    marginVertical: Sizes.lg,
  },
  helpText: {
    textAlign: 'center',
    color: Colors.textSecondary,
  },
});
