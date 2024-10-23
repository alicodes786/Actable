import { getDeadlines } from '@/db/deadlines';
import { IdeadlineList } from '@/lib/interfaces';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Platform, View, Text } from 'react-native';


export default function ExploreScreen() {
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
    <View style={styles.topBar}>
      <Text>Sign in</Text>
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