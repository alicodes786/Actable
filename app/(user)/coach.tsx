import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image } from 'react-native';

const CoachScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState('');

  const handleFormSubmit = () => {
    // Submit the form to the database or Google Forms integration here
    console.log({ name, email, goal });
    alert('Thank you for joining the waitlist!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Coach Feature Coming Soon!</Text>
      <Image
        source={{ uri: 'https://via.placeholder.com/150' }} // Replace with a relevant image URL
        style={styles.image}
      />
      <Text style={styles.message}>
        We’re excited to bring you the Coach feature! Unlock personalized
        guidance and exclusive benefits. Sign up for the waitlist to be the
        first to know when it launches!
      </Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Your Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Your Goal (Optional)"
          value={goal}
          onChangeText={setGoal}
        />
        <Button title="Join Waitlist" onPress={handleFormSubmit} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#4a4a4a',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#6b6b6b',
  },
  form: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
});

export default CoachScreen;
