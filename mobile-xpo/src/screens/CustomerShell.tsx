import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './HomeScreen';
import VehiclesScreen from './VehiclesScreen';
// ── Placeholder screens (we'll replace these one by one) ───────

function BookingsScreen() {
  return (
    <View style={styles.placeholder}>
      <Ionicons name="calendar" size={48} color="#64748B" />
      <Text style={styles.placeholderText}>Bookings coming soon</Text>
    </View>
  );
}

function UpdatesScreen() {
  return (
    <View style={styles.placeholder}>
      <Ionicons name="notifications" size={48} color="#64748B" />
      <Text style={styles.placeholderText}>Updates coming soon</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.placeholder}>
      <Ionicons name="person" size={48} color="#64748B" />
      <Text style={styles.placeholderText}>Profile — coming next!</Text>
    </View>
  );
}

// ── Bottom Tab Navigator ───────────────────────────────────────
const Tab = createBottomTabNavigator();

export default function CustomerShell() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Custom icon for each tab
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';

          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Bookings') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Vehicles') iconName = focused ? 'car' : 'car-outline';
          else if (route.name === 'Updates') iconName = focused ? 'notifications' : 'notifications-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Colors matching your Figma
        tabBarActiveTintColor: '#245FF2',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          height: 64,
          borderTopWidth: 1,
          borderTopColor: '#E1E7EF',
          backgroundColor: '#fff',
          paddingBottom: 6,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        // Hide the default header (we'll add our own later)
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Vehicles" component={VehiclesScreen} />
      <Tab.Screen name="Updates" component={UpdatesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: '#F3F6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
});