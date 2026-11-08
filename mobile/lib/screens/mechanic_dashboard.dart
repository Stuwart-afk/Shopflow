import 'package:flutter/material.dart';

import '../services/api_service.dart';
import 'login_screen.dart';

class MechanicDashboard extends StatefulWidget {
  const MechanicDashboard({super.key});

  @override
  State<MechanicDashboard> createState() => _MechanicDashboardState();
}

class _MechanicDashboardState extends State<MechanicDashboard> {
  Map<String, dynamic>? user;
  int selectedTab = 0;

  static const navy = Color(0xFF101D32);
  static const ink = Color(0xFF17253C);
  static const muted = Color(0xFF64748B);
  static const blue = Color(0xFF245FF2);
  static const border = Color(0xFFE1E7EF);
  static const background = Color(0xFFF3F6FA);

  @override
  void initState() {
    super.initState();
    loadUser();
  }

  Future<void> loadUser() async {
    final userData = await ApiService.getUser();
    if (mounted) {
      setState(() => user = userData);
    }
  }

  Future<void> logout() async {
    await ApiService.logout();
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  String get mechanicName {
    final name = user?['name']?.toString().trim();
    if (name == null || name.isEmpty) return 'Rafael';
    return name.split(' ').first;
  }

  void showComingSoon(String label) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text('$label is coming soon.')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: background,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(24, 20, 24, 12),
                child: _buildDashboardContent(),
              ),
            ),
            _buildBottomNavigation(),
            Container(height: 20, color: Colors.white),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      height: 54,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      color: navy,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: blue,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.bolt, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 10),
              const Text(
                'ShopFlow.',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  height: 1.4,
                ),
              ),
            ],
          ),
          Row(
            children: [
              const Text(
                'TECHNICIAN / M02',
                style: TextStyle(
                  color: Color(0xFFA8B8D1),
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                  letterSpacing: .3,
                ),
              ),
              const SizedBox(width: 8),
              InkWell(
                onTap: logout,
                borderRadius: BorderRadius.circular(20),
                child: const Padding(
                  padding: EdgeInsets.all(4),
                  child: Icon(Icons.logout, color: Color(0xFFA8B8D1), size: 16),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDashboardContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text.rich(
          TextSpan(
            children: [
              TextSpan(
                text: "Let's get to work, $mechanicName.\n",
                style: const TextStyle(
                  color: ink,
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  height: 1.3,
                ),
              ),
              const TextSpan(
                text: 'Wed, 28 Oct · 10:35 AM · Shift 8 AM–5 PM',
                style: TextStyle(
                  color: muted,
                  fontSize: 12,
                  fontWeight: FontWeight.w400,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(child: _statCard('2', 'Assigned')),
            const SizedBox(width: 10),
            Expanded(child: _statCard('1', 'In progress')),
            const SizedBox(width: 10),
            Expanded(child: _statCard('1', 'Handed off')),
          ],
        ),
        const SizedBox(height: 16),
        _buildCurrentJobCard(),
        const SizedBox(height: 12),
        _buildWorkloadCard(),
        const SizedBox(height: 12),
        _buildNextWorkCard(),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          height: 46,
          child: OutlinedButton(
            onPressed: () => showComingSoon('Assigned jobs'),
            style: OutlinedButton.styleFrom(
              foregroundColor: ink,
              backgroundColor: Colors.white,
              side: const BorderSide(color: border),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text(
              'View assigned jobs',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
            ),
          ),
        ),
      ],
    );
  }

  Widget _statCard(String value, String label) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: border),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            style: const TextStyle(
              color: ink,
              fontSize: 29,
              fontWeight: FontWeight.w700,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(color: muted, fontSize: 10, height: 1.4),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentJobCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: navy,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'CURRENT JOB / BAY 1',
                style: TextStyle(color: Color(0xFFA8B8D1), fontSize: 10),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0x33245FF2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'In Progress',
                  style: TextStyle(
                    color: blue,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'Toyota Vios',
            style: TextStyle(
              color: Colors.white,
              fontSize: 25,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 2),
          const Text(
            'NCD 4821 · SF-2026-0001',
            style: TextStyle(color: Color(0xFFA8B8D1), fontSize: 12),
          ),
          const SizedBox(height: 12),
          const Text(
            'Front brake pad replacement',
            style: TextStyle(color: Colors.white, fontSize: 13),
          ),
          const SizedBox(height: 6),
          const Text(
            'E-0001 v1 approved · 10:28',
            style: TextStyle(
              color: Color(0xFF4FD19D),
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 14),
          SizedBox(
            height: 42,
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => showComingSoon('Job details'),
              style: ElevatedButton.styleFrom(
                backgroundColor: blue,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text(
                'Continue job →',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWorkloadCard() {
    return _infoCard(
      title: "Today's workload",
      children: const [
        _InfoLine(label: 'Current reservation', value: '10:35–12:05 · 90 min'),
        _InfoLine(label: 'Next handoff', value: 'Quality check · Luis Santos'),
        _InfoLine(
          label: 'Earlier job',
          value: 'SF-2026-0004 · Handed off 10:30',
        ),
        SizedBox(height: 2),
        Text(
          'No overlapping assignment. Contact Ana if your repair needs more time.',
          style: TextStyle(color: muted, fontSize: 11, height: 1.4),
        ),
      ],
    );
  }

  Widget _buildNextWorkCard() {
    return _infoCard(
      title: 'Next assigned work',
      children: const [
        Text(
          'You\'re on your final assigned repair.',
          style: TextStyle(
            color: ink,
            fontSize: 15,
            fontWeight: FontWeight.w700,
            height: 1.4,
          ),
        ),
        SizedBox(height: 2),
        Text(
          'Your advisor will notify you when another job is assigned. Do not start unassigned work.',
          style: TextStyle(color: muted, fontSize: 12, height: 1.4),
        ),
      ],
    );
  }

  Widget _infoCard({required String title, required List<Widget> children}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: ink,
              fontSize: 15,
              fontWeight: FontWeight.w700,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 9),
          ...children,
        ],
      ),
    );
  }

  Widget _buildBottomNavigation() {
    const items = [
      (Icons.today_outlined, 'Today'),
      (Icons.build_outlined, 'Jobs'),
      (Icons.notifications_none_outlined, 'Updates'),
      (Icons.person_outline, 'Profile'),
    ];

    return Container(
      height: 64,
      padding: const EdgeInsets.only(top: 8, left: 18, right: 18, bottom: 6),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: border)),
      ),
      child: Row(
        children: List.generate(items.length, (index) {
          final item = items[index];
          final active = selectedTab == index;
          return Expanded(
            child: InkWell(
              onTap: () {
                setState(() => selectedTab = index);
                if (index != 0) showComingSoon(item.$2);
              },
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Icon(item.$1, size: 21, color: active ? blue : muted),
                  const SizedBox(height: 4),
                  Text(
                    item.$2,
                    style: TextStyle(
                      color: active ? blue : muted,
                      fontSize: 10,
                      fontWeight: active ? FontWeight.w700 : FontWeight.w400,
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _InfoLine extends StatelessWidget {
  final String label;
  final String value;

  const _InfoLine({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 5),
      child: RichText(
        text: TextSpan(
          style: const TextStyle(
            color: Color(0xFF64748B),
            fontSize: 12,
            height: 1.45,
          ),
          children: [
            TextSpan(text: '$label  /  '),
            TextSpan(
              text: value,
              style: const TextStyle(
                color: Color(0xFF17253C),
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
