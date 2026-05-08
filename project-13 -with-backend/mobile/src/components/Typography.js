import { Text as RNText } from 'react-native';
import { styled } from 'nativewind';

const StyledText = styled(RNText);

export const Text = ({ children, variant = 'body', className = '', ...props }) => {
  const variants = {
    h1: 'text-text-primary font-bold text-3xl',
    h2: 'text-text-primary font-bold text-2xl',
    h3: 'text-text-primary font-semibold text-xl',
    body: 'text-text-primary text-base',
    secondary: 'text-text-secondary text-sm',
    muted: 'text-text-muted text-xs',
    brand: 'text-brand-500 font-bold',
  };

  return (
    <StyledText className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </StyledText>
  );
};
