import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AddVehicleScreen extends StatefulWidget {
  const AddVehicleScreen({super.key});

  @override
  State<AddVehicleScreen> createState() => _AddVehicleScreenState();
}

class _AddVehicleScreenState extends State<AddVehicleScreen> {
  // ── Form Controllers ──────────────────────────────────────────
  final _plateController = TextEditingController();
  final _makeController = TextEditingController();
  final _modelController = TextEditingController();
  final _yearController = TextEditingController();
  final _odometerController = TextEditingController();

  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void dispose() {
    // Clean up controllers when screen is closed to free memory
    _plateController.dispose();
    _makeController.dispose();
    _modelController.dispose();
    _yearController.dispose();
    _odometerController.dispose();
    super.dispose();
  }

  // ── Send POST /vehicle to backend ─────────────────────────────
  Future<void> _saveVehicle() async {
    // Basic validation
    final plate = _plateController.text.trim().toUpperCase().replaceAll(
      ' ',
      '-',
    );
    final make = _makeController.text.trim();
    final model = _modelController.text.trim();
    final yearText = _yearController.text.trim();
    final year = int.tryParse(yearText);

    if (plate.isEmpty || make.isEmpty || model.isEmpty || yearText.isEmpty) {
      setState(() => _errorMessage = 'Please fill in all required (*) fields.');
      return;
    }

    if (year == null || year < 1900 || year > 2030) {
      setState(() => _errorMessage = 'Please enter a valid year (1900–2030).');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('access_token') ?? '';

      final response = await http.post(
        Uri.parse('http://10.0.2.2:3001/vehicle'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'plate_number': plate,
          'make': make,
          'model': model,
          'year': year,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201 || response.statusCode == 200) {
        if (!mounted) return;
        // Pop back to vehicles list and return `true` to signal a reload!
        Navigator.pop(context, true);
      } else {
        setState(() {
          _errorMessage = data['message'] is List
              ? (data['message'] as List).join(', ')
              : (data['message'] ?? 'Failed to save vehicle');
          _isSubmitting = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Connection error. Is the backend running?';
        _isSubmitting = false;
      });
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  BUILD
  // ══════════════════════════════════════════════════════════════
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F6FA),
      appBar: _buildAppBar(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(
          top: 20,
          left: 24,
          right: 24,
          bottom: 24,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            const SizedBox(height: 16),

            if (_errorMessage != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFFCA5A5)),
                ),
                child: Text(
                  _errorMessage!,
                  style: const TextStyle(
                    color: Color(0xFFB91C1C),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(height: 14),
            ],

            // 1. Plate Number
            _buildInputField(
              label: 'Plate number *',
              hint: 'e.g. NCD 4821 or ABC-1234',
              controller: _plateController,
              caption: '✓ Valid plate format · not yet linked to your account',
              captionColor: const Color(0xFF245FF2),
            ),
            const SizedBox(height: 14),

            // 2. Make
            _buildInputField(
              label: 'Make *',
              hint: 'e.g. Toyota, Honda, Mitsubishi',
              controller: _makeController,
            ),
            const SizedBox(height: 14),

            // 3. Model
            _buildInputField(
              label: 'Model *',
              hint: 'e.g. Vios, Civic, Mirage',
              controller: _modelController,
            ),
            const SizedBox(height: 14),

            // 4. Year
            _buildInputField(
              label: 'Model year *',
              hint: 'e.g. 2021',
              controller: _yearController,
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 14),

            // 5. Odometer (optional)
            _buildInputField(
              label: 'Current odometer · optional',
              hint: 'e.g. 48,620 km',
              controller: _odometerController,
              caption: 'Numbers only. The shop will verify at reception.',
            ),
            const SizedBox(height: 16),

            // 6. Informational Box
            _buildInfoCard(),
            const SizedBox(height: 18),

            // 7. Save Button
            _buildSaveButton(),
            const SizedBox(height: 10),

            // 8. Cancel Button
            _buildCancelButton(),
            const SizedBox(height: 14),

            // Footnote
            const Center(
              child: Text(
                '* Required fields · Filled first-registration example',
                style: TextStyle(color: Color(0xFF64748B), fontSize: 10),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Top App Bar ───────────────────────────────────────────────
  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      automaticallyImplyLeading: false,
      toolbarHeight: 54,
      titleSpacing: 24,
      title: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              IconButton(
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                icon: const Icon(
                  Icons.arrow_back_ios_new_rounded,
                  size: 18,
                  color: Color(0xFF101D32),
                ),
                onPressed: () => Navigator.pop(context),
              ),
              const SizedBox(width: 12),
              const Text(
                'ShopFlow.',
                style: TextStyle(
                  color: Color(0xFF101D32),
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const Text(
            'CUSTOMER / C05',
            style: TextStyle(
              color: Color(0xFF64748B),
              fontSize: 9,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  // ── Header Title & Subtitle ───────────────────────────────────
  Widget _buildHeader() {
    return Text.rich(
      TextSpan(
        children: [
          const TextSpan(
            text: 'Add your vehicle\n',
            style: TextStyle(
              color: Color(0xFF17253C),
              fontSize: 24,
              fontWeight: FontWeight.w700,
              height: 1.3,
            ),
          ),
          const TextSpan(
            text: 'Set up your first vehicle before booking a service.',
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

  // ── Reusable Input Field ──────────────────────────────────────
  Widget _buildInputField({
    required String label,
    required String hint,
    required TextEditingController controller,
    String? caption,
    Color? captionColor,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF64748B),
            fontSize: 12,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 5),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFFE1E7EF)),
          ),
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            style: const TextStyle(color: Color(0xFF17253C), fontSize: 14),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: const TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 14,
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 12,
              ),
              border: InputBorder.none,
              isDense: true,
            ),
          ),
        ),
        if (caption != null) ...[
          const SizedBox(height: 5),
          Text(
            caption,
            style: TextStyle(
              color: captionColor ?? const Color(0xFF64748B),
              fontSize: 11,
              fontWeight: FontWeight.w400,
            ),
          ),
        ],
      ],
    );
  }

  // ── Info Card ────────────────────────────────────────────────
  Widget _buildInfoCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFEAF0FF),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Text(
        'These details help the workshop identify your vehicle. Your plate number and service history are visible only to you and authorized shop staff.',
        style: TextStyle(color: Color(0xFF245FF2), fontSize: 12, height: 1.4),
      ),
    );
  }

  // ── Save Button ──────────────────────────────────────────────
  Widget _buildSaveButton() {
    return SizedBox(
      width: double.infinity,
      height: 46,
      child: ElevatedButton(
        onPressed: _isSubmitting ? null : _saveVehicle,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF245FF2),
          disabledBackgroundColor: const Color(0xFF93C5FD),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          elevation: 0,
        ),
        child: _isSubmitting
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 2,
                ),
              )
            : const Text(
                'Save vehicle',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
      ),
    );
  }

  // ── Cancel Button ────────────────────────────────────────────
  Widget _buildCancelButton() {
    return SizedBox(
      width: double.infinity,
      height: 46,
      child: OutlinedButton(
        onPressed: () => Navigator.pop(context),
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.white,
          side: const BorderSide(color: Color(0xFFE1E7EF)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        child: const Text(
          'Cancel',
          style: TextStyle(
            color: Color(0xFF17253C),
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
