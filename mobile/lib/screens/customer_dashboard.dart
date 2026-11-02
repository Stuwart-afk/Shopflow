import 'dart:convert';

import 'customer_vehicles.dart';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'login_screen.dart';

// ── Renamed from CustomerDashboard → CustomerHome ─────────────
// The shell imports this class and puts it inside tab 0.
class CustomerHome extends StatefulWidget {
  const CustomerHome({super.key});

  @override
  State<CustomerHome> createState() => _CustomerHomeState();
}

class _CustomerHomeState extends State<CustomerHome> {
  // ── State variables ──────────────────────────────────────────
  String _userName = 'Customer';
  List<dynamic> _vehicles = [];
  bool _isLoading = true;
  String? _errorMessage;

  // ── Runs once when this tab is first shown ───────────────────
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  // ── Fetch user name + vehicles ───────────────────────────────
  Future<void> _loadData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('access_token') ?? '';

      if (token.isEmpty) {
        _goToLogin();
        return;
      }

      setState(() {
        _userName = prefs.getString('user_name') ?? 'Customer';
      });

      // Your working endpoint — preserved exactly as you debugged it
      final response = await http.get(
        Uri.parse('http://10.0.2.2:3001/vehicle'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );
      print('STATUS: ${response.statusCode}');
      print('BODY: ${response.body}');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _vehicles = data['data'] ?? [];
          _isLoading = false;
        });
      } else if (response.statusCode == 401) {
        _goToLogin();
      } else {
        setState(() {
          _errorMessage = 'Failed to load vehicles (${response.statusCode})';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Connection error. Is the backend running?';
        _isLoading = false;
      });
    }
  }

  // ── If token is dead, kick back to login ─────────────────────
  void _goToLogin() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  // ── Helpers ──────────────────────────────────────────────────
  String get _greeting {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  String get _todayFormatted {
    final now = DateTime.now();
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${now.day} ${months[now.month - 1]} ${now.year}';
  }

  String get _firstName {
    final parts = _userName.trim().split(' ');
    return parts.isNotEmpty ? parts.first : 'Customer';
  }

  // ══════════════════════════════════════════════════════════════
  //  BUILD — no Scaffold, no AppBar, no bottom nav!
  //  The shell wraps this in its own Scaffold.
  // ══════════════════════════════════════════════════════════════
  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFF245FF2)),
      );
    }

    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 12),
              Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    _isLoading = true;
                    _errorMessage = null;
                  });
                  _loadData();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF245FF2),
                ),
                child: const Text(
                  'Retry',
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.only(top: 20, left: 24, right: 24, bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildGreeting(),
          const SizedBox(height: 12),
          _buildNotificationBanner(),
          const SizedBox(height: 12),
          _buildVehicleCard(),
          const SizedBox(height: 12),
          _buildActiveJobCard(),
          const SizedBox(height: 12),
          _buildAppointmentCard(),
          const SizedBox(height: 12),
          _buildBookServiceButton(),
          const SizedBox(height: 12),
          _buildFooter(),
        ],
      ),
    );
  }

  // ── 1. Greeting ──────────────────────────────────────────────
  Widget _buildGreeting() {
    return Text.rich(
      TextSpan(
        children: [
          TextSpan(
            text: '$_greeting, $_firstName.\n',
            style: const TextStyle(
              color: Color(0xFF17253C),
              fontSize: 24,
              fontWeight: FontWeight.w700,
              height: 1.3,
            ),
          ),
          TextSpan(
            text: 'Your workshop, a little closer. · $_todayFormatted',
            style: const TextStyle(
              color: Color(0xFF64748B),
              fontSize: 12,
              fontWeight: FontWeight.w400,
              height: 1.3,
            ),
          ),
        ],
      ),
    );
  }

  // ── 2. Notification banner ──────────────────────────────────
  Widget _buildNotificationBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFEAF0FF),
        borderRadius: BorderRadius.circular(9),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.notifications_active_outlined,
            size: 20,
            color: Color(0xFF245FF2),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Text(
              'You have 2 unread updates',
              style: TextStyle(
                color: Color(0xFF245FF2),
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
            decoration: BoxDecoration(
              color: const Color(0xFF245FF2),
              borderRadius: BorderRadius.circular(100),
            ),
            child: const Text(
              '2',
              style: TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── 3. Vehicle card ─────────────────────────────────────────
  Widget _buildVehicleCard() {
    final hasVehicle = _vehicles.isNotEmpty;
    final v = hasVehicle ? _vehicles[0] : null;

    final makeModel = hasVehicle
        ? '${v['make']} ${v['model']}'
        : 'No vehicles yet';
    final details = hasVehicle
        ? '${v['year']} · ${v['plate_number']}'
        : 'Add your first vehicle to get started';

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
            'Your vehicle',
            style: TextStyle(
              color: Color(0xFF17253C),
              fontSize: 15,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 9),
          Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: const Color(0xFFEAF0FF),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.directions_car_rounded,
                  size: 28,
                  color: Color(0xFF245FF2),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      makeModel,
                      style: const TextStyle(
                        color: Color(0xFF17253C),
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      details,
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
          const SizedBox(height: 9),
          Center(
            child: GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => Scaffold(
                      backgroundColor: const Color(0xFFF3F6FA),
                      body: SafeArea(child: const CustomerVehicles()),
                    ),
                  ),
                );
              },
              child: const Text(
                'Manage vehicles & service history →',
                style: TextStyle(
                  color: Color(0xFF245FF2),
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── 4. Active job card (dark) ───────────────────────────────
  Widget _buildActiveJobCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF101D32),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'SF-2026-0001',
                style: TextStyle(
                  color: Color(0xFFA8B8D1),
                  fontSize: 11,
                  fontFamily: 'monospace',
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF4DC),
                  borderRadius: BorderRadius.circular(100),
                ),
                child: const Text(
                  'Action needed',
                  style: TextStyle(
                    color: Color(0xFF9A640D),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Text(
            'Your estimate is ready.',
            style: TextStyle(
              color: Colors.white,
              fontSize: 23,
              fontWeight: FontWeight.w700,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 10),
          const Text(
            'Front brake pad replacement · ₱2,300. Review the scope before the workshop starts.',
            style: TextStyle(
              color: Color(0xFFA8B8D1),
              fontSize: 12,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF245FF2),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                elevation: 0,
              ),
              child: const Text(
                'Review estimate →',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          const Text(
            'Awaiting Approval · Updated today, 10:05 AM',
            style: TextStyle(color: Color(0xFFA8B8D1), fontSize: 11),
          ),
        ],
      ),
    );
  }

  // ── 5. Upcoming appointment card ────────────────────────────
  Widget _buildAppointmentCard() {
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
            'Upcoming appointment',
            style: TextStyle(
              color: Color(0xFF17253C),
              fontSize: 15,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 9),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                '30 Oct · 3:00 PM',
                style: TextStyle(
                  color: Color(0xFF17253C),
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF4DC),
                  borderRadius: BorderRadius.circular(100),
                ),
                child: const Text(
                  'Requested',
                  style: TextStyle(
                    color: Color(0xFF9A640D),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 9),
          const Text(
            'Oil & filter service · Toyota Vios',
            style: TextStyle(color: Color(0xFF17253C), fontSize: 12),
          ),
          const SizedBox(height: 9),
          Text.rich(
            TextSpan(
              children: [
                const TextSpan(
                  text: 'AP-2026-0052  /  ',
                  style: TextStyle(color: Color(0xFF64748B), fontSize: 12),
                ),
                const TextSpan(
                  text: 'Awaiting shop confirmation',
                  style: TextStyle(
                    color: Color(0xFF17253C),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 9),
          const Text(
            'Manage appointment →',
            style: TextStyle(color: Color(0xFF245FF2), fontSize: 11),
          ),
        ],
      ),
    );
  }

  // ── 6. Book a service button ────────────────────────────────
  Widget _buildBookServiceButton() {
    return SizedBox(
      width: double.infinity,
      height: 46,
      child: ElevatedButton(
        onPressed: () {},
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF245FF2),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          elevation: 0,
        ),
        child: const Text(
          '＋ Book a service',
          style: TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }

  // ── 7. Footer ───────────────────────────────────────────────
  Widget _buildFooter() {
    return const Center(
      child: Text(
        'Santos Auto Care · Mon–Sat, 8 AM–5 PM',
        textAlign: TextAlign.center,
        style: TextStyle(color: Color(0xFF64748B), fontSize: 10),
      ),
    );
  }
}
