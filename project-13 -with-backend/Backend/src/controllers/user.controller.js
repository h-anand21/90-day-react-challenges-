import User from '../models/User.js';

export const updateProfileSetup = async (req, res) => {
  try {
    const { name, avatar, gender } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    if (!gender || !['Male', 'Female', 'Neutral'].includes(gender)) {
      return res.status(400).json({ success: false, message: 'Valid gender is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name;
    user.gender = gender;
    if (avatar) user.avatar = avatar;
    user.isProfileSetupCompleted = true;

    await user.save();

    res.status(200).json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    console.error('Error updating profile setup:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
