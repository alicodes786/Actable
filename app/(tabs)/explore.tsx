import React from 'react';
import { Text, Button, Input, YStack, View } from 'tamagui';

export default function SignInPage() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <YStack 
        justifyContent="center" 
        alignItems="stretch"
        padding={20}
        width="100%"
        // backgroundColor="$background"
      >
        
        <Text fontSize={24} marginBottom={12} fontWeight="bold" textAlign="center">Sign In</Text>
        
        <Input
          placeholder="Email" 
          marginBottom={12}
          fontSize={16} 
          width="100%"
        />
        
        <Input 
          placeholder="Password" 
          marginBottom={12}
          secureTextEntry
          fontSize={16}
          width="100%"
        />

        <Button 
          onPress={() => console.log('Sign In pressed')} 
          width="100%"
          marginBottom={12}
        >
          Sign In
        </Button>

        <Button 
          onPress={() => console.log('Sign in with Google pressed')}
          width="100%"
        >
          Sign in with Google
        </Button>

      </YStack>
    </View>
  );
};
