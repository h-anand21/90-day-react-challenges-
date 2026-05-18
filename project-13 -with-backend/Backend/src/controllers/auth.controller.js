import User from '../models/User.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';
import { sendTokenCookie, clearTokenCookie } from '../utils/jwt.js';
import { verifyFirebaseToken } from '../utils/firebaseAuth.js';

// ─── POST /api/auth/register ───────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    // 1. Validate input
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { name, email, password } = parsed.data;

    // 2. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // 3. Create user (password hashed via pre-save hook)
    const user = await User.create({ name, email, password });

    // 4. Issue cookie
    const token = sendTokenCookie(res, user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('[register]', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── POST /api/auth/login ──────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    // 1. Validate input
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsed.data;

    // 2. Find user — include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 3. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 4. Issue cookie
    const token = sendTokenCookie(res, user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user,
      token,
    });
  } catch (error) {
    console.error('[login]', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── POST /api/auth/logout ─────────────────────────────────────────────────
export const logout = (req, res) => {
  clearTokenCookie(res);
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ─── GET /api/auth/me ──────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

// ─── POST /api/auth/firebase ───────────────────────────────────────────────
export const firebaseAuth = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Firebase token is required' });
    }

    // 1. Cryptographically verify the client's Firebase token
    const decoded = await verifyFirebaseToken(token);
    const email = decoded.email;
    const name = decoded.name || email.split('@')[0];

    // 2. Find or automatically create user in MongoDB matching verified email
    let user = await User.findOne({ email });
    if (!user) {
      console.log(`[Firebase Auth] Registering new MongoDB user document for email: "${email}"`);
      // Since passwords are managed by Firebase, satisfy MongoDB schema with secure random hash fallback
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-10) + 'A1!',
      });
    }

    // 3. Issue our backend session cookie + JWT token just like normal login!
    const backendToken = sendTokenCookie(res, user._id);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user,
      token: backendToken,
    });
  } catch (error) {
    console.error('[firebaseAuth Controller Error]', error);
    return res.status(401).json({ success: false, message: error.message || 'Authentication failed' });
  }
};
