import React from 'react';
import { Image, StyleSheet, Platform, View, Text } from 'react-native';

export default function AddDeadlineScreen() {
  return (
    <View style={styles.container}>
    
    {/* Welcome Text */}
    <Text style={styles.welcomeText}>Add your deadlines here</Text>
  </View>
);
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  justifyContent: 'center', 
  alignItems: 'center',     
  paddingHorizontal: 20,
},
topBar: {
  flexDirection: 'row',       
  position: 'absolute',       
  top: 50,
  right: 20,                 
},
notificationIcon: {
  marginLeft: 20,             
},
welcomeText: {
  fontSize: 24,
  fontWeight: 'bold',
  marginTop: 60,           
},
});