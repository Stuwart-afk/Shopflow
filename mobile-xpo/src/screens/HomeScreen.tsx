import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';


// ── Your wrench logo as SVG XML ────────────────────────────────
const LOGO_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
    stroke="#245FF2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function HomeScreen({ navigation }: any) {
  const [userName, setUserName] = useState('Customer');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // ── Fetch user name + vehicles ───────────────────────────────
  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const name = await AsyncStorage.getItem('user_name');

      if (name) setUserName(name);

      if (!token) {
        handleLogout();
        return;
      }

      // Same endpoint you debugged in Flutter
      const response = await axios.get(`${API_URL}/vehicle`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setVehicles(response.data?.data ?? []);
      setIsLoading(false);
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleLogout();
        return;
      }
      setErrorMessage('Connection error. Is the backend running?');
      setIsLoading(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────
  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  // ── Helpers ──────────────────────────────────────────────────
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFirstName = () => {
    const parts = userName.trim().split(' ');
    return parts.length > 0 ? parts[0] : 'Customer';
  };

  const getTodayFormatted = () => {
    const now = new Date();
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  // ── Loading state ────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#245FF2" />
      </View>
    );
  }

  // ── Error state ──────────────────────────────────────────────
  if (errorMessage) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="red" />
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main content ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── App Bar ──────────────────────────────────────── */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <SvgXml xml={LOGO_SVG} width={24} height={24} />
          <Text style={styles.appBarTitle}>ShopFlow.</Text>
        </View>
        <View style={styles.appBarRight}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>CUSTOMER</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Scrollable Content ───────────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Greeting */}
        <Text style={styles.greetingTitle}>
          {getGreeting()}, {getFirstName()}.
        </Text>
        <Text style={styles.greetingSubtitle}>
          Your workshop, a little closer. · {getTodayFormatted()}
        </Text>

        {/* 2. Notification banner */}
        <View style={styles.notifBanner}>
          <Ionicons
            name="notifications"
            size={20}
            color="#245FF2"
            style={styles.notifIcon}
          />
          <Text style={styles.notifText}>You have 2 unread updates</Text>
          <View style={styles.notifBadge}>
            <Text style={styles.notifBadgeText}>2</Text>
          </View>
        </View>

        {/* 3. Vehicle card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your vehicle</Text>
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleIconBox}>
              <Ionicons name="car" size={28} color="#245FF2" />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>
                {vehicles.length > 0
                  ? `${vehicles[0].make} ${vehicles[0].model}`
                  : 'No vehicles yet'}
              </Text>
              <Text style={styles.vehicleDetails}>
                {vehicles.length > 0
                  ? `${vehicles[0].year} · ${vehicles[0].plate_number}`
                  : 'Add your first vehicle to get started'}
              </Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={styles.linkText}>
              Manage vehicles & service history →
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Active job card (dark) */}
        <View style={styles.darkCard}>
          <View style={styles.darkCardTop}>
            <Text style={styles.jobNumber}>SF-2026-0001</Text>
            <View style={styles.yellowBadge}>
              <Text style={styles.yellowBadgeText}>Action needed</Text>
            </View>
          </View>
          <Text style={styles.darkCardTitle}>Your estimate is ready.</Text>
          <Text style={styles.darkCardDesc}>
            Front brake pad replacement · ₱2,300. Review the scope before the
            workshop starts.
          </Text>
          <TouchableOpacity style={styles.blueButton}>
            <Text style={styles.blueButtonText}>Review estimate →</Text>
          </TouchableOpacity>
          <Text style={styles.darkCardFooter}>
            Awaiting Approval · Updated today, 10:05 AM
          </Text>
        </View>

        {/* 5. Appointment card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upcoming appointment</Text>
          <View style={styles.apptTop}>
            <Text style={styles.apptDate}>30 Oct · 3:00 PM</Text>
            <View style={styles.yellowBadge}>
              <Text style={styles.yellowBadgeText}>Requested</Text>
            </View>
          </View>
          <Text style={styles.apptService}>
            Oil & filter service · Toyota Vios
          </Text>
          <Text style={styles.apptRef}>
            <Text style={styles.apptRefGray}>AP-2026-0052 / </Text>
            <Text style={styles.apptRefBold}>
              Awaiting shop confirmation
            </Text>
          </Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Manage appointment →</Text>
          </TouchableOpacity>
        </View>

        {/* 6. Book a service button */}
        <TouchableOpacity style={styles.blueButton}>
          <Text style={styles.blueButtonText}>＋ Book a service</Text>
        </TouchableOpacity>

        {/* 7. Footer */}
        <Text style={styles.footer}>
          Santos Auto Care · Mon–Sat, 8 AM–5 PM
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
  center: {
    flex: 1,
    backgroundColor: '#F3F6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#64748B',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#245FF2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },

  // App bar
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    height: 54,
    paddingHorizontal: 24,
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#101D32',
    marginLeft: 8,
  },
  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    backgroundColor: '#F3F6FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleBadgeText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  logoutBtn: {
    marginLeft: 8,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  // Greeting
  greetingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#17253C',
    lineHeight: 31,
  },
  greetingSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  // Notification banner
  notifBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF0FF',
    borderRadius: 9,
    padding: 12,
    marginTop: 12,
  },
  notifIcon: {
    marginRight: 12,
  },
  notifText: {
    flex: 1,
    color: '#245FF2',
    fontSize: 12,
    fontWeight: '700',
  },
  notifBadge: {
    backgroundColor: '#245FF2',
    borderRadius: 100,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1E7EF',
    padding: 14,
    marginTop: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#17253C',
    marginBottom: 9,
  },

  // Vehicle
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconBox: {
    width: 52,
    height: 52,
    backgroundColor: '#EAF0FF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#17253C',
  },
  vehicleDetails: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  linkText: {
    color: '#245FF2',
    fontSize: 11,
    marginTop: 9,
  },

  // Dark card
  darkCard: {
    backgroundColor: '#101D32',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
  },
  darkCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobNumber: {
    color: '#A8B8D1',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  yellowBadge: {
    backgroundColor: '#FFF4DC',
    borderRadius: 100,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  yellowBadgeText: {
    color: '#9A640D',
    fontSize: 11,
    fontWeight: '700',
  },
  darkCardTitle: {
    color: '#fff',
    fontSize: 23,
    fontWeight: '700',
    marginTop: 10,
    lineHeight: 32,
  },
  darkCardDesc: {
    color: '#A8B8D1',
    fontSize: 12,
    marginTop: 10,
    lineHeight: 17,
  },
  darkCardFooter: {
    color: '#A8B8D1',
    fontSize: 11,
    marginTop: 10,
  },

  // Buttons
  blueButton: {
    backgroundColor: '#245FF2',
    borderRadius: 8,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  blueButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Appointment
  apptTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  apptDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#17253C',
  },
  apptService: {
    fontSize: 12,
    color: '#17253C',
    marginTop: 9,
  },
  apptRef: {
    marginTop: 9,
  },
  apptRefGray: {
    color: '#64748B',
    fontSize: 12,
  },
  apptRefBold: {
    color: '#17253C',
    fontSize: 12,
    fontWeight: '600',
  },

  // Footer
  footer: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 10,
    marginTop: 12,
  },
});