import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'login_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  // ── Form controllers (one per text field) ────────────────────
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  // ── State ────────────────────────────────────────────────────
  bool _agreedToTerms = false; // checkbox
  bool _obscurePassword = true; // toggle eye icon
  bool _obscureConfirm = true;
  bool _isSubmitting = false; // prevents double-tap
  String? _errorMessage; // shows red banner if API fails

  @override
  void dispose() {
    // Always dispose controllers to free memory
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  // ── Validation + API call ────────────────────────────────────
  Future<void> _createAccount() async {
    // 1. Client-side validation
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final confirm = _confirmPasswordController.text;

    if (name.isEmpty || email.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = 'Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setState(() => _errorMessage = 'Password must be at least 8 characters.');
      return;
    }

    if (password != confirm) {
      setState(() => _errorMessage = 'Passwords do not match.');
      return;
    }

    if (!_agreedToTerms) {
      setState(
        () => _errorMessage = 'Please agree to the Privacy Notice and Terms.',
      );
      return;
    }

    // 2. Show loading state
    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      // 3. Call the backend register endpoint
      //    This creates a User with role "customer"
      final response = await http.post(
        Uri.parse('http://10.0.2.2:3001/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
          'role': 'customer',
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201 || response.statusCode == 200) {
        if (!mounted) return;

        // ── Step 2: Create the Customer record ──────────────
        // The register endpoint creates the User. Now we need
        // to create the Customer row (which holds the phone number)
        // and link it to this user.
        //
        // If the register response includes a token, we use it.
        // Otherwise we do a quick login to get one.
        String? token = data['access_token'];

        if (token == null) {
          // Auto-login to get a token for customer creation
          final loginRes = await http.post(
            Uri.parse('http://10.0.2.2:3001/auth/login'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'email': email, 'password': password}),
          );

          if (loginRes.statusCode == 200 || loginRes.statusCode == 201) {
            final loginData = jsonDecode(loginRes.body);
            token = loginData['access_token'];
          }
        }

        // Create Customer record with phone number (if we got a token)
        if (token != null && phone.isNotEmpty) {
          await http.post(
            Uri.parse('http://10.0.2.2:3001/customers'),
            headers: {
              'Authorization': 'Bearer $token',
              'Content-Type': 'application/json',
            },
            body: jsonEncode({'phone': phone}),
          );
        }

        // 4. Success! Go to login screen
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Welcome, $name! Please sign in.'),
            backgroundColor: const Color(0xFF22C55E),
            duration: const Duration(seconds: 3),
          ),
        );
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      } else {
        // API returned an error
        setState(() {
          _errorMessage = data['message'] is List
              ? (data['message'] as List).join(', ')
              : (data['message'] ?? 'Registration failed');
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

            // Error banner (only shows when _errorMessage is set)
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

            // 1. Full name
            _buildInputField(
              label: 'Full name',
              hint: 'Maria Santos',
              controller: _nameController,
            ),
            const SizedBox(height: 14),

            // 2. Mobile number
            _buildInputField(
              label: 'Mobile number',
              hint: '0917 482 6103',
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              caption: 'Philippine mobile · 11 digits',
            ),
            const SizedBox(height: 14),

            // 3. Email address
            _buildInputField(
              label: 'Email address',
              hint: 'maria.santos@email.ph',
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 14),

            // 4. Password
            _buildPasswordField(
              label: 'Password',
              hint: '••••••••',
              controller: _passwordController,
              obscure: _obscurePassword,
              onToggle: () =>
                  setState(() => _obscurePassword = !_obscurePassword),
              caption: '✓ At least 8 characters, with a letter and a number',
              captionColor: const Color(0xFF245FF2),
            ),
            const SizedBox(height: 14),

            // 5. Confirm password
            _buildPasswordField(
              label: 'Confirm password',
              hint: '••••••••',
              controller: _confirmPasswordController,
              obscure: _obscureConfirm,
              onToggle: () =>
                  setState(() => _obscureConfirm = !_obscureConfirm),
            ),
            const SizedBox(height: 16),

            // 6. Privacy checkbox
            _buildPrivacyCheckbox(),
            const SizedBox(height: 14),

            // 7. Info banner
            _buildInfoBanner(),
            const SizedBox(height: 18),

            // 8. Create account button
            _buildCreateButton(),
            const SizedBox(height: 14),

            // 9. "Already registered? Sign in" link
            _buildSignInLink(),
          ],
        ),
      ),
    );
  }

  // ── App Bar ──────────────────────────────────────────────────
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
            'CUSTOMER / C02',
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

  // ── Header ──────────────────────────────────────────────────
  Widget _buildHeader() {
    return Text.rich(
      TextSpan(
        children: [
          const TextSpan(
            text: "Let's get you started.\n",
            style: TextStyle(
              color: Color(0xFF17253C),
              fontSize: 24,
              fontWeight: FontWeight.w700,
              height: 1.3,
            ),
          ),
          const TextSpan(
            text: 'Create your customer account in a few details.',
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

  // ── Reusable text input ─────────────────────────────────────
  Widget _buildInputField({
    required String label,
    required String hint,
    required TextEditingController controller,
    TextInputType keyboardType = TextInputType.text,
    String? caption,
    Color? captionColor,
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
            ),
          ),
        ],
      ],
    );
  }

  // ── Password field (with eye toggle) ────────────────────────
  Widget _buildPasswordField({
    required String label,
    required String hint,
    required TextEditingController controller,
    required bool obscure,
    required VoidCallback onToggle,
    String? caption,
    Color? captionColor,
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
            obscureText: obscure,
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
              // Eye icon to show/hide password
              suffixIcon: IconButton(
                icon: Icon(
                  obscure
                      ? Icons.visibility_off_rounded
                      : Icons.visibility_rounded,
                  size: 20,
                  color: const Color(0xFF94A3B8),
                ),
                onPressed: onToggle,
              ),
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
            ),
          ),
        ],
      ],
    );
  }

  // ── Privacy checkbox ────────────────────────────────────────
  Widget _buildPrivacyCheckbox() {
    return GestureDetector(
      // Tapping anywhere on the row toggles the checkbox
      behavior: HitTestBehavior.opaque,
      onTap: () => setState(() => _agreedToTerms = !_agreedToTerms),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: 24,
            height: 24,
            child: Checkbox(
              value: _agreedToTerms,
              onChanged: (val) => setState(() => _agreedToTerms = val ?? false),
              activeColor: const Color(0xFF245FF2),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(4),
              ),
              side: const BorderSide(color: Color(0xFF245FF2), width: 1.5),
            ),
          ),
          const SizedBox(width: 8),
          const Expanded(
            child: Text(
              'I agree to the Privacy Notice and Terms of Use.',
              style: TextStyle(color: Color(0xFF17253C), fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  // ── Info banner ─────────────────────────────────────────────
  Widget _buildInfoBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFEAF0FF),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Text(
        'We use your contact details for bookings, repair approvals '
        'and service updates. No unnecessary personal information is collected.',
        style: TextStyle(color: Color(0xFF245FF2), fontSize: 12, height: 1.4),
      ),
    );
  }

  // ── Create account button ───────────────────────────────────
  Widget _buildCreateButton() {
    return SizedBox(
      width: double.infinity,
      height: 46,
      child: ElevatedButton(
        onPressed: _isSubmitting ? null : _createAccount,
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
                'Create my account',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
      ),
    );
  }

  // ── "Already registered? Sign in" link ──────────────────────
  Widget _buildSignInLink() {
    return Center(
      child: GestureDetector(
        onTap: () => Navigator.pop(context),
        child: Text.rich(
          TextSpan(
            children: [
              const TextSpan(
                text: 'Already registered?  ',
                style: TextStyle(color: Color(0xFF64748B), fontSize: 12),
              ),
              const TextSpan(
                text: 'Sign in',
                style: TextStyle(
                  color: Color(0xFF245FF2),
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
