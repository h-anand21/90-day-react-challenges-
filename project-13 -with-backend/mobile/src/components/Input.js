import { View, TextInput } from 'react-native';
import { Text } from './Typography';

export const Input = ({ 
  label, 
  error, 
  className = '',
  ...rest
}) => {
  return (
    <View className={`mb-4 ${className}`}>
      {label && <Text variant="secondary" className="mb-2 font-medium">{label}</Text>}
      <View 
        className={`
          bg-surface-200 border rounded-xl px-4 py-3
          ${error ? 'border-danger' : 'border-border'}
        `}
      >
        <TextInput
          placeholderTextColor="#525252"
          className="text-text-primary text-base"
          autoCapitalize="none"
          {...rest}
        />
      </View>
      {error && <Text className="text-danger text-xs mt-1">{error}</Text>}
    </View>
  );
};
