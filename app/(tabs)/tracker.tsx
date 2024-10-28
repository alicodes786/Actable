import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Platform, View, Text, Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;


export default function TrackerScreen() {
    const blueGradient = ['#66b3ff', '#007FFF', '#0066cc'];
    const blackGradient = ['#333333', '#111111', '#000000'];
  return (
    <View style={styles.container}>
         
        <View style={styles.content}>
        <Text style={styles.title}>Tracker</Text>
           <View style={styles.deadlineData}>
           <LinearGradient
              colors={['#66b3ff', '#007FFF', '#0066cc']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.deadlinesCard}
            >
              <Text>
                dd
              </Text>
            </LinearGradient>
           </View>
        </View>
    </View>
);
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor:'white'
},
title: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: windowWidth * 0.05, 
    paddingTop: 10,
  },
  deadlinesCard: {
    marginTop: 15,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '40%', 
    maxWidth: 400,
  },
});