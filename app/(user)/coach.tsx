import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

interface FormData {
  name: string;
  email: string;
  goal: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>
      <Ionicons name={icon as any} size={24} color="#000" />
    </View>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const CoachScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    goal: ''
  });

  const handleFormSubmit = (): void => {
    console.log(formData);
    setModalVisible(false);
    // Add your form submission logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Main Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Working on something special...</Text>
          <Text style={styles.subtitle}>
            Get early access to personalized coaching and exclusive insights
          </Text>
        </View>

        {/* Pro Banner */}
        <TouchableOpacity 
          style={styles.proBanner} 
          activeOpacity={0.9}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.proTextContainer}>
            <Text style={styles.proTitle}>Unlock Premium Coaching</Text>
            <Text style={styles.proSubtitle}>Get Personalized Guidance</Text>
          </View>
          <TouchableOpacity 
            style={styles.proButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.proButtonText}>Go Pro</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.featuresContainer}>
          <FeatureItem 
            icon="trophy-outline" 
            title="Expert Guidance"
            description="Get personalized coaching from industry experts"
          />
          <FeatureItem 
            icon="trending-up-outline" 
            title="Track Progress"
            description="Monitor your growth with detailed analytics"
          />
          <FeatureItem 
            icon="lock-closed-outline" 
            title="Exclusive Content"
            description="Access premium resources and workshops"
          />
        </View>
      </View>

      {/* Sign Up Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Join Premium Coaching</Text>
            <Text style={styles.modalSubtitle}>
              Get started with your personalized coaching journey
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Your Name"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              placeholder="Your Email"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
              placeholderTextColor="#666"
            />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="What's your main goal?"
              value={formData.goal}
              onChangeText={(text) => setFormData({...formData, goal: text})}
              multiline
              numberOfLines={3}
              placeholderTextColor="#666"
            />

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleFormSubmit}
            >
              <Text style={styles.submitButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  illustration: {
    width: 250,
    height: 200,
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  proBanner: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 20,
    marginVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proTextContainer: {
    flex: 1,
  },
  proTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  proSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.8,
  },
  proButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  proButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  featuresContainer: {
    marginTop: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: '70%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CoachScreen;