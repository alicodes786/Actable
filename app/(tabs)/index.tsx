import { getDeadlines } from '@/db/deadlines';
import { IdeadlineList } from '@/lib/interfaces';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Platform, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';


export default function HomeScreen() {
  const [deadlines, setDeadlines] = useState<IdeadlineList | null >(null);

  useEffect(() => {
    const fetchDeadlines = async () => {
      const fetchedDeadlines: IdeadlineList | null = await getDeadlines();
      console.log(fetchedDeadlines);
      setDeadlines(fetchedDeadlines);
    };
    fetchDeadlines();
  }, []);

  return (
    <View style={styles.container}>
    
    <View style={styles.topBar}>
      <Icon name="person-circle-outline" size={40} color="#000" />
      <Icon name="notifications-outline" size={30} color="#000" style={styles.notificationIcon} />
    </View>
    
    {/* Welcome Text */}
    <Text style={styles.welcomeText}>Welcome!</Text>

    {deadlines &&
          <>
          {deadlines.deadlineList.map((item, idx) => <Text key={idx}>{item.description}</Text>)}
          </>
    }
    
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