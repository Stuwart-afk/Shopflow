import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:shopflow_mobile/screens/customer_vehicles.dart';

import 'login_screen.dart';
import 'customer_dashboard.dart';

class CustomerShell extends StatefulWidget {
  const CustomerShell({super.key});

  @override
  State<CustomerShell> createState() => _CustomerShellState();
}

class _CustomerShellState extends State<CustomerShell> {
  // ── Which tab is currently showing ──────────────────────────
  // 0 = Home   1 = Bookings   2 = Vehicles   3 = Updates
  int _currentTab = 0;

  // ── The list of screens, one per tab ────────────────────────
  // IndexedStack will show whichever one matches _currentTab.
  // We use placeholders for tabs we haven't built yet.
  late final List<Widget> _tabs = [
    const CustomerHome(),
    const _ComingSoonTab(title: 'Bookings'),
    const CustomerVehicles(),
    const _ComingSoonTab(title: 'Updates'),
  ];

  void _openVehiclesTab() {
    setState(() {
      _currentTab = 2;
    });
  }

  // ── Logout: clear storage and go back to login ──────────────
  Future<void> _logout() async {
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
    return Scaffold(
      backgroundColor: const Color(0xFFF3F6FA),
      appBar: _buildAppBar(),
      body: IndexedStack(
        // IndexedStack keeps ALL tabs alive in memory and just shows one.
        // This preserves scroll position and avoids re-fetching data
        // every time you switch tabs.
        index: _currentTab,
        children: _tabs,
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  // ── App bar (shared across all tabs) ────────────────────────
  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      automaticallyImplyLeading: false,
      toolbarHeight: 54,
      titleSpacing: 24,
      title: Row(
        children: [
          SvgPicture.asset(
            'assets/images/login_logo.svg',
            width: 24,
            height: 24,
          ),
          const SizedBox(width: 8),
          const Text(
            'ShopFlow.',
            style: TextStyle(
              color: Color(0xFF101D32),
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFF3F6FA),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Text(
              'CUSTOMER',
              style: TextStyle(
                color: Color(0xFF64748B),
                fontSize: 9,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.5,
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: _logout,
            child: const Icon(
              Icons.logout_rounded,
              size: 20,
              color: Color(0xFF64748B),
            ),
          ),
        ],
      ),
    );
  }

  // ── Bottom nav (shared across all tabs) ─────────────────────
  Widget _buildBottomNav() {
    return Container(
      height: 64,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE1E7EF))),
      ),
      child: Row(
        children: [
          _navItem(0, Icons.home_rounded, 'Home'),
          _navItem(1, Icons.calendar_month_rounded, 'Bookings'),
          _navItem(2, Icons.directions_car_rounded, 'Vehicles'),
          _navItem(3, Icons.notifications_rounded, 'Updates'),
        ],
      ),
    );
  }

  Widget _navItem(int index, IconData icon, String label) {
    final isActive = _currentTab == index;
    return Expanded(
      child: GestureDetector(
        // behavior: opaque makes the WHOLE expanded area tappable,
        // not just the pixels where the icon and text are drawn.
        behavior: HitTestBehavior.opaque,
        onTap: () => setState(() => _currentTab = index),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 22,
              color: isActive
                  ? const Color(0xFF245FF2)
                  : const Color(0xFF64748B),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isActive
                    ? const Color(0xFF245FF2)
                    : const Color(0xFF64748B),
                fontSize: 10,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w400,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ──────────────────────────────────────────────────────────────
//  Simple placeholder widget for tabs we haven't built yet
// ──────────────────────────────────────────────────────────────
class _ComingSoonTab extends StatelessWidget {
  final String title;
  const _ComingSoonTab({required this.title});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.construction_rounded,
            size: 48,
            color: const Color(0xFF64748B),
          ),
          const SizedBox(height: 12),
          Text(
            '$title coming soon',
            style: const TextStyle(
              color: Color(0xFF64748B),
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
