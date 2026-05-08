import { TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { Text } from './Typography';

export const Button = ({ 
  onPress, 
  title, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  icon: Icon,
  className = '' 
}) => {
  const variants = {
    primary: 'bg-brand-500',
    ghost: 'bg-transparent border border-border',
    danger: 'bg-danger/10 border border-danger/20',
  };

  const textColors = {
    primary: 'text-white',
    ghost: 'text-text-secondary',
    danger: 'text-danger',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.7}
      className={`
        flex-row items-center justify-center py-4 px-6 rounded-xl
        ${variants[variant]}
        ${(disabled || loading) ? 'opacity-50' : ''}
        ${className}
      `}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#f97316'} />
      ) : (
        <View className="flex-row items-center">
          {Icon && <View className="mr-2"><Icon size={18} color={variant === 'danger' ? '#ef4444' : variant === 'ghost' ? '#a3a3a3' : 'white'} /></View>}
          <Text className={`${textColors[variant]} font-semibold text-center`}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
