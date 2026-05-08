import { View } from 'react-native';

export const Card = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-surface-100 border-border',
    glass: 'bg-white/5 border-white/10',
  };

  return (
    <View 
      className={`
        p-6 border rounded-2xl
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </View>
  );
};
