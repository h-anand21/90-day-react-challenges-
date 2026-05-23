export const AVATARS = {
  male_1: require('../../assets/avatars/male_1.png'),
  male_2: require('../../assets/avatars/male_2.png'),
  male_3: require('../../assets/avatars/male_3.png'),
  male_4: require('../../assets/avatars/male_4.png'),
  male_5: require('../../assets/avatars/male_5.png'),
  male_6: require('../../assets/avatars/male_6.png'),
  male_7: require('../../assets/avatars/male_7.png'),
  male_8: require('../../assets/avatars/male_8.png'),
  male_9: require('../../assets/avatars/male_9.png'),
  male_10: require('../../assets/avatars/male_10.png'),
  male_11: require('../../assets/avatars/male_11.png'),
  male_12: require('../../assets/avatars/male_12.png'),
  male_13: require('../../assets/avatars/male_13.png'),
  male_14: require('../../assets/avatars/male_14.png'),
  male_15: require('../../assets/avatars/male_15.png'),
  female_1: require('../../assets/avatars/female_1.png'),
  female_2: require('../../assets/avatars/female_2.png'),
  female_3: require('../../assets/avatars/female_3.png'),
  female_4: require('../../assets/avatars/female_4.png'),
  female_5: require('../../assets/avatars/female_5.png'),
  female_6: require('../../assets/avatars/female_6.png'),
  female_7: require('../../assets/avatars/female_7.png'),
  female_8: require('../../assets/avatars/female_8.png'),
  female_9: require('../../assets/avatars/female_9.png'),
  female_10: require('../../assets/avatars/female_10.png'),
  female_11: require('../../assets/avatars/female_11.png'),
  female_12: require('../../assets/avatars/female_12.png'),
  female_13: require('../../assets/avatars/female_13.png'),
  female_14: require('../../assets/avatars/female_14.png'),
  female_15: require('../../assets/avatars/female_15.png'),
};

export const getAvatarSource = (avatarId) => {
  if (!avatarId) return require('../../assets/avatars/male_1.png'); // default fallback
  // If it's a legacy URL (starts with http), return it as an object {uri}
  if (avatarId.startsWith('http')) {
    return { uri: avatarId };
  }
  return AVATARS[avatarId] || require('../../assets/avatars/male_1.png');
};
