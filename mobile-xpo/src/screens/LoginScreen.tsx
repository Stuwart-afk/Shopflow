import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

// ── Your computer's IP + backend port ──────────────────────────
// iPhone is a real device, so we use the actual Wi-Fi IP.
// (Android emulator would use 10.0.2.2)

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [obscurePassword, setObscurePassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ── Login handler ────────────────────────────────────────────
  const handleLogin = async () => {
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email.trim(),
        password: password,
      });

      const { access_token, user } = response.data;

      // Save to AsyncStorage (React Native's version of SharedPreferences)
      await AsyncStorage.setItem('access_token', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('user_role', user.role);
      await AsyncStorage.setItem('user_name', user.name);

      // Navigate based on role
      if (user.role === 'customer') {
        navigation.replace('CustomerShell');
      } else if (user.role === 'mechanic') {
        navigation.replace('MechanicDashboard');
      } else {
        setErrorMessage('This app is for customers and mechanics only.');
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        'Cannot connect to server. Is the backend running?';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#F8FBFF', '#EEF5FF', '#EAF2FF']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ─────────────────────────────────────── */}
          <View style={styles.header}>
            <Ionicons name="construct" size={26} color="#245FF2" />
            <Text style={styles.headerTitle}>ShopFlow</Text>
          </View>

          {/* ── Welcome text ───────────────────────────────── */}
          <Text style={styles.welcomeTitle}>Welcome back</Text>
          <Text style={styles.welcomeSubtitle}>
            Sign in to continue to ShopFlow.
          </Text>

          {/* ── Dark hero card ─────────────────────────────── */}
          <LinearGradient
            colors={['#101D32', '#0F2A5B', '#0A1C46']}
            start={{ x: 0.08, y: 0.02 }}
            end={{ x: 0.92, y: 0.98 }}
            style={styles.heroCard}
          >
            <Text style={styles.heroTitle}>
              Your car. Your peace of mind.
            </Text>
            <Text style={styles.heroSubtitle}>
              Book your next service, follow your repair, and know when
              your car is ready.
            </Text>

            {/* Three icon circles */}
            <View style={styles.iconRow}>
              <IconCircle icon="calendar" label="Book" />
              <IconCircle icon="build" label="Track" />
              <IconCircle icon="checkmark-circle" label="Pick up" />
            </View>
          </LinearGradient>

          {/* ── Email field ────────────────────────────────── */}
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            placeholder="name@shopflow.com"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* ── Password field ─────────────────────────────── */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••••••"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={obscurePassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setObscurePassword(!obscurePassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={obscurePassword ? 'eye-off' : 'eye'}
                size={18}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* ── Forgot password ────────────────────────────── */}
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* ── Error message ──────────────────────────────── */}
          {errorMessage !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* ── Sign in button ─────────────────────────────── */}
          <TouchableOpacity
            style={[styles.signInButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.signInText}>Sign in</Text>
            )}
          </TouchableOpacity>

          {/* ── Create account link ────────────────────────── */}
          <TouchableOpacity
            style={styles.createAccountRow}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.createAccountGray}>
              Don't have an account?{'  '}
            </Text>
            <Text style={styles.createAccountBlue}>Create now.</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ── Reusable icon circle for the hero card ─────────────────────
function IconCircle({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.iconCircleWrapper}>
      <View style={styles.iconCircle}>
        <Ionicons
          name={icon as any}
          size={14}
          color="#fff"
        />
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#101D32',
    marginLeft: 10,
  },

  // Welcome
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#17253C',
    lineHeight: 37,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 22,
  },

  // Hero card
  heroCard: {
    marginTop: 16,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#245FF2',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 29,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#D7E3F2',
    marginTop: 4,
    lineHeight: 21,
  },
  iconRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  iconCircleWrapper: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#245FF2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Form
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E1E7EF',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: '#17253C',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E1E7EF',
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 14,
    color: '#17253C',
  },
  eyeButton: {
    padding: 14,
  },

  // Forgot
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotText: {
    fontSize: 12,
    color: '#245FF2',
  },

  // Error
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
  },

  // Sign in button
  signInButton: {
    backgroundColor: '#245FF2',
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#245FF2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  signInText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Create account
  createAccountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  createAccountGray: {
    fontSize: 12,
    color: '#64748B',
  },
  createAccountBlue: {
    fontSize: 12,
    color: '#245FF2',
    fontWeight: '700',
  },
});