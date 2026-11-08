import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'login_screen.dart';

class CustomerProfile extends StatefulWidget {
  const CustomerProfile({super.key});

  @override
  State<CustomerProfile> createState() => _CustomerProfileState();
}

class _CustomerProfileState extends State<CustomerProfile> {
  // ── User data from SharedPreferences ─────────────────────────
  String _userName = 'Customer';
  String _userEmail = '';
  String _userPhone = '';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  // ── Load profile data ────────────────────────────────────────
  Future<void> _loadProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('access_token') ?? '';
      final userJson = prefs.getString('user');

      // 1. Read name + email from the saved user JSON
      if (userJson != null) {
        final user = jsonDecode(userJson);
        setState(() {
          _userName = user['name'] ?? 'Customer';
          _userEmail = user['email'] ?? '';
        });
      } else {
        // Fallback to the simple key
        setState(() {
          _userName = prefs.getString('user_name') ?? 'Customer';
        });
      }

      // 2. Fetch phone number from the customer API
      if (token.isNotEmpty) {
        final response = await http.get(
          Uri.parse('http://10.0.2.2:3001/customers/me'),
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
        );
        print('profileSTATUS: ${response.statusCode}');
        print('profileBODY: ${response.body}');
        print('profileBODY: ${response.body}');
        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          setState(() {
            _userPhone = data['phone'] ?? '0Not provided';
            _isLoading = false;
          });
        } else {
          // Customer record might not exist yet (e.g., seeded users)
          setState(() {
            _userPhone = '1Not provided';
            _isLoading = false;
          });
        }
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() {
        _userPhone = '2Not provided';
        _isLoading = false;
      });
    }
  }

  // ── Compute initials from name ───────────────────────────────
  // "Maria Santos" → "MS"
  // "Juan" → "J"
  String get _initials {
    final parts = _userName.trim().split(' ');
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }

  // ── Sign out ─────────────────────────────────────────────────
  Future<void> _signOut() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  // ══════════════════════════════════════════════════════════════
  //  BUILD
  // ══════════════════════════════════════════════════════════════
  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFF245FF2)),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.only(top: 20, left: 24, right: 24, bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Page header
          _buildHeader(),
          const SizedBox(height: 12),

          // 2. Profile card (avatar + name + email + edit button)
          _buildProfileCard(),
          const SizedBox(height: 12),

          // 3. Personal details card
          _buildPersonalDetailsCard(),
          const SizedBox(height: 12),

          // 4. Settings card (password, notifications)
          _buildSettingsCard(),
          const SizedBox(height: 12),

          // 5. More settings card (privacy, help)
          _buildMoreSettingsCard(),
          const SizedBox(height: 12),

          // 6. Sign out button
          _buildSignOutButton(),
        ],
      ),
    );
  }

  // ── 1. Header ────────────────────────────────────────────────
  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'My profile',
          style: TextStyle(
            color: Color(0xFF17253C),
            fontSize: 24,
            fontWeight: FontWeight.w700,
            height: 1.3,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Your details, preferences and account settings.',
          style: TextStyle(
            color: Color(0xFF64748B),
            fontSize: 12,
            fontWeight: FontWeight.w400,
          ),
        ),
      ],
    );
  }

  // ── 2. Profile card ─────────────────────────────────────────
  //
  //  ┌─────────────────────────────────────────────┐
  //  │  ┌───┐  Maria Santos                       │
  //  │  │ MS│  maria.santos@email.ph               │
  //  │  └───┘                                      │
  //  │  ┌─────────────────────────────────────┐    │
  //  │  │        ✏️  Edit profile              │    │
  //  │  └─────────────────────────────────────┘    │
  //  └─────────────────────────────────────────────┘
  //
  Widget _buildProfileCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE1E7EF)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar + name + email row
          Row(
            children: [
              // Circular avatar with initials
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: const Color(0xFFEAF0FF),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    _initials,
                    style: const TextStyle(
                      color: Color(0xFF245FF2),
                      fontSize: 19,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _userName,
                      style: const TextStyle(
                        color: Color(0xFF17253C),
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      _userEmail,
                      style: const TextStyle(
                        color: Color(0xFF64748B),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          // Edit profile button (light blue strip)
          Container(
            width: double.infinity,
            height: 32,
            decoration: BoxDecoration(
              color: const Color(0xFFEAF0FF),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.edit_rounded,
                  size: 14,
                  color: Color(0xFF245FF2),
                ),
                const SizedBox(width: 7),
                const Text(
                  'Edit profile',
                  style: TextStyle(
                    color: Color(0xFF245FF2),
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── 3. Personal details card ────────────────────────────────
  //
  //  ┌─────────────────────────────────────────────┐
  //  │  Personal details                           │
  //  │  Full name    Maria Santos                  │
  //  │  Email        maria.santos@email.ph         │
  //  │  Phone        0917 482 6103                 │
  //  └─────────────────────────────────────────────┘
  //
  Widget _buildPersonalDetailsCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE1E7EF)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Personal details',
            style: TextStyle(
              color: Color(0xFF17253C),
              fontSize: 15,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 9),
          _detailRow('Full name', _userName),
          _detailRow('Email', _userEmail),
          _detailRow('Phone', _userPhone),
        ],
      ),
    );
  }

  // Helper: "Label    Value" row
  Widget _detailRow(String label, String value) {
    return SizedBox(
      height: 30,
      child: Row(
        children: [
          SizedBox(
            width: 74,
            child: Text(
              label,
              style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                color: Color(0xFF17253C),
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── 4. Settings card ────────────────────────────────────────
  Widget _buildSettingsCard() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE1E7EF)),
      ),
      child: Column(
        children: [
          _settingsRow(
            icon: Icons.lock_outline_rounded,
            title: 'Password & security',
            subtitle: 'Change your account password',
            showDivider: true,
          ),
          _settingsRow(
            icon: Icons.notifications_outlined,
            title: 'Notification preferences',
            subtitle: 'Booking reminders and service updates',
            showDivider: false,
          ),
        ],
      ),
    );
  }

  // ── 5. More settings card ───────────────────────────────────
  Widget _buildMoreSettingsCard() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE1E7EF)),
      ),
      child: Column(
        children: [
          _settingsRow(
            icon: Icons.shield_outlined,
            title: 'Privacy & terms',
            subtitle: null,
            showDivider: true,
          ),
          _settingsRow(
            icon: Icons.help_outline_rounded,
            title: 'Help & support',
            subtitle: null,
            showDivider: false,
          ),
        ],
      ),
    );
  }

  // Helper: Settings row with icon, title, optional subtitle, chevron
  Widget _settingsRow({
    required IconData icon,
    required String title,
    String? subtitle,
    required bool showDivider,
  }) {
    return Container(
      height: subtitle != null ? 60 : 48,
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        border: showDivider
            ? const Border(bottom: BorderSide(color: Color(0xFFE1E7EF)))
            : null,
      ),
      child: Row(
        children: [
          Icon(icon, size: 20, color: const Color(0xFF64748B)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Color(0xFF17253C),
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 11,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const Icon(
            Icons.chevron_right_rounded,
            size: 18,
            color: Color(0xFF94A3B8),
          ),
        ],
      ),
    );
  }

  // ── 6. Sign out button ──────────────────────────────────────
  Widget _buildSignOutButton() {
    return SizedBox(
      width: double.infinity,
      height: 46,
      child: OutlinedButton(
        onPressed: _signOut,
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.white,
          side: const BorderSide(color: Color(0xFFF1DADA)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.logout_rounded,
              size: 18,
              color: Color(0xFFB93838),
            ),
            const SizedBox(width: 8),
            const Text(
              'Sign out',
              style: TextStyle(
                color: Color(0xFFB93838),
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
