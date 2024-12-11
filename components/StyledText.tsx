import { Text as RNText, TextProps } from 'react-native';
import React from 'react';

interface StyledTextProps extends TextProps {
  heading?: boolean;
}

export function Text({ heading, style, ...props }: StyledTextProps) {
  return (
    <RNText 
      style={[
        { fontFamily: heading ? 'Manrope' : 'Roboto' },
        style
      ]} 
      {...props} 
    />
  );
} 