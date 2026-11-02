import 'dart:convert';

import 'add_vehicle_screen.dart';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'login_screen.dart';

class CustomerVehicles extends StatefulWidget {
  const CustomerVehicles({super.key});

  @override
  State<CustomerVehicles> createState() => _CustomerVehiclesState();
}

class _CustomerVehiclesState extends State<CustomerVehicles> {
  List<dynamic> _vehicles = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadVehicles();
  }

  // ── Fetch vehicles from the API ──────────────────────────────
  Future<void> _loadVehicles() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('access_token') ?? '';

      if (token.isEmpty) {
        _goToLogin();
        return;
      }

      // Same endpoint you debugged on the home tab
      final response = await http.get(
        Uri.parse('http://10.0.2.2:3001/vehicle'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        if (data is Map && data['data'] is List) {
          setState(() {
            _vehicles = data['data'];
            _isLoading = false;
          });
        } else {
          setState(() {
            _vehicles = [];
            _errorMessage = 'Invalid vehicle response from server';
            _isLoading = false;
          });
        }
      } else if (response.statusCode == 401) {
        _goToLogin();
      } else {
        setState(() {
          _errorMessage = 'Failed to load (${response.statusCode})';
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

  void _goToLogin() {
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
                  _loadVehicles();
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

    // ── Main scrollable content ──────────────────────────────
    return Container(
      width: double.infinity,
      height: double.infinity,
      color: const Color(0xFFF3F6FA),
      child: SingleChildScrollView(
        padding: const EdgeInsets.only(
          top: 20,
          left: 24,
          right: 24,
          bottom: 12,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Page header
            _buildHeader(),
            const SizedBox(height: 12),

            // 2. Display vehicles or empty state
            if (_vehicles.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE1E7EF)),
                ),
                child: const Column(
                  children: [
                    Icon(
                      Icons.directions_car_outlined,
                      size: 48,
                      color: Color(0xFF64748B),
                    ),
                    SizedBox(height: 12),
                    Text(
                      'No vehicles registered',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF17253C),
                      ),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'Add your first vehicle to get started.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
              )
            else
              ..._vehicles.map(
                (v) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _buildVehicleCard(v),
                ),
              ),

            const SizedBox(height: 12),

            // 3. Add another vehicle button
            _buildAddVehicleButton(),
            const SizedBox(height: 12),

            // 4. Latest completed service
            _buildLatestServiceCard(),
            const SizedBox(height: 12),

            // 5. Info banner
            _buildInfoBanner(),
          ],
        ),
      ),
    );
  }

  // ── 1. Page header ──────────────────────────────────────────
  Widget _buildHeader() {
    return Text.rich(
      TextSpan(
        children: [
          const TextSpan(
            text: 'My vehicles\n',
            style: TextStyle(
              color: Color(0xFF17253C),
              fontSize: 24,
              fontWeight: FontWeight.w700,
              height: 1.3,
            ),
          ),
          const TextSpan(
            text: 'Your registered vehicles and their service records.',
            style: TextStyle(
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

  // ── 2. Vehicle card (one per vehicle) ───────────────────────
  //
  //  This is the most complex widget. Let me walk through it:
  //
  //  ┌─────────────────────────────────────────────┐
  //  │ [My vehicle]                     Edit       │  ← top row
  //  │ ┌────┐  Toyota Vios                         │  ← icon + name
  //  │ │ 🚗 │  2021 · NCD-4821                     │  ← details
  //  │ └────┘                                      │
  //  │ Odometer last recorded  /  Not recorded yet │  ← detail row
  //  │ Latest visit  /  No visits yet              │  ← detail row
  //  │ Current job  /  No active job               │  ← detail row
  //  │ ┌─────────────────────────────────────┐     │
  //  │ │       View active repair →          │     │  ← blue button
  //  │ └─────────────────────────────────────┘     │
  //  │ ┌─────────────────────────────────────┐     │
  //  │ │         Service history             │     │  ← white button
  //  │ └─────────────────────────────────────┘     │
  //  └─────────────────────────────────────────────┘
  //
  Widget _buildVehicleCard(dynamic v) {
    final makeModel = '${v['make']} ${v['model']}';
    final details = '${v['year']} · ${v['plate_number']}';

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
          // ── Top row: badge + edit link ──────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Blue "My vehicle" pill badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                decoration: BoxDecoration(
                  color: const Color(0xFFEAF0FF),
                  borderRadius: BorderRadius.circular(100),
                ),
                child: const Text(
                  'My vehicle',
                  style: TextStyle(
                    color: Color(0xFF245FF2),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              // "Edit" link
              GestureDetector(
                onTap: () {
                  // TODO: navigate to edit vehicle screen (step 4)
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Edit vehicle — coming next!'),
                      duration: Duration(seconds: 1),
                    ),
                  );
                },
                child: const Text(
                  'Edit',
                  style: TextStyle(color: Color(0xFF245FF2), fontSize: 12),
                ),
              ),
            ],
          ),
          const SizedBox(height: 9),

          // ── Icon + name + details ───────────────────────
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

          // ── Detail rows (placeholders for now) ──────────
          // Each row follows the pattern:
          //   "Label  /  Value"
          // where Label is gray and Value is dark+semibold.
          _detailRow('Odometer last recorded', 'Not recorded yet'),
          _detailRow('Latest visit', 'No visits yet'),
          _detailRow('Current job', 'No active job'),
          const SizedBox(height: 9),

          // ── Blue CTA button ─────────────────────────────
          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton(
              onPressed: () {
                // TODO: navigate to active repair screen
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF245FF2),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                elevation: 0,
              ),
              child: const Text(
                'View active repair →',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),

          // ── White outlined button ───────────────────────
          SizedBox(
            width: double.infinity,
            height: 46,
            child: OutlinedButton(
              onPressed: () {
                // TODO: navigate to service history screen
              },
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFE1E7EF)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text(
                'Service history',
                style: TextStyle(
                  color: Color(0xFF17253C),
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Helper: "Label  /  Value" detail row ────────────────────
  //
  //  Uses Text.rich with two TextSpans so we get:
  //    gray "Odometer last recorded  /  " + dark "Not recorded yet"
  //
  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text.rich(
        TextSpan(
          children: [
            TextSpan(
              text: '$label  /  ',
              style: const TextStyle(
                color: Color(0xFF64748B),
                fontSize: 12,
                height: 1.45,
              ),
            ),
            TextSpan(
              text: value,
              style: const TextStyle(
                color: Color(0xFF17253C),
                fontSize: 12,
                fontWeight: FontWeight.w600,
                height: 1.45,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── 3. "+ Add another vehicle" button ───────────────────────
  Widget _buildAddVehicleButton() {
    return SizedBox(
      width: double.infinity,
      height: 46,
      child: OutlinedButton(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const AddVehicleScreen()),
          );

          // Refresh vehicle list after adding a vehicle
          if (result == true) {
            _loadVehicles();
          }
        },
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: Color(0xFFE1E7EF)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        child: const Text(
          '＋ Add another vehicle',
          style: TextStyle(
            color: Color(0xFF17253C),
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }

  // ── 4. Latest completed service (placeholder) ──────────────
  Widget _buildLatestServiceCard() {
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
            'Latest completed service',
            style: TextStyle(
              color: Color(0xFF17253C),
              fontSize: 15,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 9),
          Row(
            children: [
              const Icon(
                Icons.check_circle_outline_rounded,
                size: 26,
                color: Color(0xFF22C55E),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Oil & filter service',
                      style: TextStyle(
                        color: Color(0xFF17253C),
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      '12 Sep 2026 · SF-2026-0027',
                      style: TextStyle(color: Color(0xFF64748B), fontSize: 12),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right_rounded,
                size: 18,
                color: Color(0xFF64748B),
              ),
            ],
          ),
          const SizedBox(height: 9),
          const Text(
            'View work performed, the approved estimate and the delivery record.',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 12),
          ),
        ],
      ),
    );
  }

  // ── 5. Info banner ──────────────────────────────────────────
  Widget _buildInfoBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFEAF0FF),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Text(
        'Only vehicles linked to your customer account appear here. '
        'Contact the shop if a service record is missing.',
        style: TextStyle(color: Color(0xFF245FF2), fontSize: 12),
      ),
    );
  }
}
