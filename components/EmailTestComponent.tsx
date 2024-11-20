import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { sendEmail } from '@/lib/mailer';

const EmailTestComponent = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const testEmail = 'team@axone.co.uk';

  const handleSendBasicEmail = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await sendEmail({
        to: testEmail,
        subject: 'Test Email',
        text: 'This is a test email from your React Native app!',
        html: '<h1>Test Email</h1><p>This is a test email from your React Native app!</p>'
      });

      setResult(response.success 
        ? `✅ Email sent successfully! Message ID: ${response.messageId}` 
        : `❌ Failed to send email: ${response.error}`
      );
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Test Panel</Text>
      <Text style={styles.subtitle}>Sending to: {testEmail}</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSendBasicEmail}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Send Basic Test Email</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
          <Text style={styles.loadingText}>Sending email...</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
  resultContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
  },
});

export default EmailTestComponent;