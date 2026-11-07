import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';


export default function AddVehicleScreen({ navigation }: any) {
  // ── Form state ─────────────────────────────────────
  // Each input field gets its own useState.
  // This is different from Flutter where you'd use
  // TextEditingController for each field.
  const [plate, setPlate] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [odometer, setOdometer] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Validation ─────────────────────────────────────
  // Returns true if all fields are valid.
  // Shows an alert if something is wrong.
  const validate = (): boolean => {
    // Plate must match ABC-1234 format (3 uppercase letters, dash, 4 digits)
    const plateRegex = /^[A-Z]{3}-\d{4}$/;
    if (!plateRegex.test(plate.toUpperCase())) {
      Alert.alert(
        'Invalid Plate',
        'Plate number must be in the format ABC-1234 (e.g., NCS-3463)'
      );
      return false;
    }

    if (!make.trim() || !model.trim()) {
      Alert.alert('Missing Info', 'Please fill in make and model.');
      return false;
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2030) {
      Alert.alert('Invalid Year', 'Year must be between 1900 and 2030.');
      return false;
    }

    return true;
  };

  // ── Submit ─────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');

      // Build the data object to send to the backend.
      // The backend expects: plate_number, make, model, year, odometer
      const vehicleData: any = {
        plate_number: plate.toUpperCase(),
        make: make.trim(),
        model: model.trim(),
        year: parseInt(year),
      };

      // Odometer is optional — only include it if the user typed something
      if (odometer.trim()) {
        vehicleData.odometer = parseFloat(odometer);
      }

      await axios.post(`${API_URL}/vehicle`, vehicleData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Success! Go back to the Vehicles tab.
      // useFocusEffect in VehiclesScreen will automatically
      // re-fetch the list, so the new vehicle will appear.
      Alert.alert('Success', 'Vehicle added!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      // Check if the backend sent a specific error message
      const message =
        error.response?.data?.message || 'Could not add vehicle.';

      // Backend sends arrays of messages for validation errors,
      // so we join them into a single string if needed.
      const displayMessage = Array.isArray(message)
        ? message.join('\n')
        : message;

      Alert.alert('Error', displayMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    // KeyboardAvoidingView pushes the form up when the
    // keyboard appears so inputs don't get hidden.
    // behavior="padding" works best on iOS.
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Vehicle</Text>
          {/* Spacer to center the title (same width as back button) */}
          <View style={{ width: 24 }} />
        </View>

        {/* ── Plate Number ── */}
        <Text style={styles.label}>Plate Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., NCS-3463"
          placeholderTextColor="#94A3B8"
          value={plate}
          onChangeText={setPlate}
          autoCapitalize="characters"
          maxLength={8}
        />
        <Text style={styles.caption}>
          Format: ABC-1234 (3 letters, dash, 4 digits)
        </Text>

        {/* ── Make ── */}
        <Text style={styles.label}>Make *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Toyota"
          placeholderTextColor="#94A3B8"
          value={make}
          onChangeText={setMake}
          autoCapitalize="words"
        />

        {/* ── Model ── */}
        <Text style={styles.label}>Model *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Vios"
          placeholderTextColor="#94A3B8"
          value={model}
          onChangeText={setModel}
          autoCapitalize="words"
        />

        {/* ── Year ── */}
        <Text style={styles.label}>Year *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 2022"
          placeholderTextColor="#94A3B8"
          value={year}
          onChangeText={setYear}
          keyboardType="numeric"
          maxLength={4}
        />

        {/* ── Odometer (optional) ── */}
        <Text style={styles.label}>Odometer (km)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 45000"
          placeholderTextColor="#94A3B8"
          value={odometer}
          onChangeText={setOdometer}
          keyboardType="numeric"
        />
        <Text style={styles.caption}>Optional — you can add this later.</Text>

        {/* ── Info Banner ── */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#245FF2" />
          <Text style={styles.infoText}>
            Accurate vehicle details help our mechanics diagnose
            issues faster and order the right parts.
          </Text>
        </View>

        {/* ── Buttons ── */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Vehicle</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A',
  },
  caption: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    marginLeft: 4,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: '#245FF2',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  disabledButton: {
    backgroundColor: '#93B4F8',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
});