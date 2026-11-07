
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';



// Your computer's Wi-Fi IP — same one we used in LoginScreen

export default function VehiclesScreen({ navigation }: any) {
  // vehicles = array of vehicle objects from the backend
  const [vehicles, setVehicles] = useState<any[]>([]);
  // loading = true while we wait for the first fetch
  const [loading, setLoading] = useState(true);
  // refreshing = true while pull-to-refresh spinner is showing
  const [refreshing, setRefreshing] = useState(false);

  // ── fetchVehicles ──────────────────────────────────
  // Calls GET /vehicle with your JWT token.
  // Backend returns { data: [...] } so we grab .data?.data
  const fetchVehicles = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/vehicle`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(response.data?.data ?? []);
    } catch (error: any) {
      console.log('Fetch vehicles error:', error.message);
      Alert.alert('Error', 'Could not load your vehicles.');
    } finally {
      // Whether success or fail, stop the spinners
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ── useFocusEffect ─────────────────────────────────
  // This is a React Navigation hook. It runs every time
  // this screen comes into focus (you tap the Vehicles tab).
  //
  // Why not useEffect? Because useEffect only runs once
  // when the component mounts. But with tab navigation,
  // the component stays mounted even when you switch tabs.
  // useFocusEffect re-runs when you come BACK to this tab,
  // so if you just added a vehicle, the list refreshes.
  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [])
  );

  // ── Pull to refresh ────────────────────────────────
  // User drags down on the list → spinner appears → refetch
  const onRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };
  

  // ── Loading state ──────────────────────────────────
  // Show a spinner in the center while waiting for first load
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#245FF2" />
        <Text style={styles.loadingText}>Loading vehicles...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      // RefreshControl adds the iOS pull-to-refresh gesture
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#245FF2"
        />
      }
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>My Vehicles</Text>
        <Text style={styles.subtitle}>
          {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered
        </Text>
      </View>

      {/* ── Empty state ── */}
      {/* If the user has zero vehicles, show a friendly message */}
      {vehicles.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="car-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No vehicles yet</Text>
          <Text style={styles.emptyText}>
            Add your first vehicle to start booking services.
          </Text>
        </View>
      ) : (
        // ── Vehicle cards ──
        // .map() loops through each vehicle and creates a card
        vehicles.map((vehicle) => (
          <View key={vehicle.id} style={styles.vehicleCard}>

            {/* Card header: name + plate badge + edit link */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={styles.vehicleName}>
                  {vehicle.make} {vehicle.model}
                </Text>
                <View style={styles.plateBadge}>
                  <Ionicons name="car-sport" size={12} color="#245FF2" />
                  <Text style={styles.plateText}>{vehicle.plate_number}</Text>
                </View>
              </View>
              <TouchableOpacity>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            </View>
            

            {/* Thin horizontal line separating header from details */}
            <View style={styles.divider} />

            {/* Detail rows — icon + label on left, value on right */}
            <View style={styles.detailRow}>
              <Ionicons name="speedometer-outline" size={18} color="#64748B" />
              <Text style={styles.detailLabel}>Odometer</Text>
              <Text style={styles.detailValue}>
                {vehicle.odometer
                  ? `${vehicle.odometer.toLocaleString()} km`
                  : '—'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={18} color="#64748B" />
              <Text style={styles.detailLabel}>Year</Text>
              <Text style={styles.detailValue}>{vehicle.year}</Text>
            </View>

            {/* These two are placeholders — backend doesn't have
                service history or job tracking yet (Module 5 & 6).
                We'll wire them up when those modules are built. */}
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={18} color="#64748B" />
              <Text style={styles.detailLabel}>Last Visit</Text>
              <Text style={styles.detailValue}>No visits yet</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="construct-outline" size={18} color="#64748B" />
              <Text style={styles.detailLabel}>Active Job</Text>
              <Text style={styles.detailValue}>None</Text>
            </View>

            {/* Action buttons — also placeholders for now */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="eye-outline" size={16} color="#245FF2" />
                <Text style={styles.actionButtonText}>View active repair</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="list-outline" size={16} color="#245FF2" />
                <Text style={styles.actionButtonText}>Service history</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
      {/* ── Add Vehicle button ── */}
      {/* This navigates to a screen we'll build in the next step.
          Right now it will do nothing because 'AddVehicle'
          doesn't exist in App.tsx yet. */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddVehicle')}
      >
        <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add another vehicle</Text>
      </TouchableOpacity>

      {/* ── Info banner ── */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color="#245FF2" />
        <Text style={styles.infoText}>
          Keep your vehicle details up to date so our mechanics
          can serve you better.
        </Text>
      </View>

      {/* Extra space at the bottom so content isn't hidden
          behind the tab bar */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  content: {
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderLeft: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  plateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  plateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#245FF2',
    marginLeft: 4,
    letterSpacing: 1,
  },
  editLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#245FF2',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 10,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#245FF2',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#245FF2',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
});