import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { submitFeedback } from "@/db/feedback";
import { fonts } from "@/styles/theme";
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/theme';

const RATING_COLORS: Record<number, readonly [string, string]> = {
  1: ['#FF6B6B', '#FF8787'] as const,
  2: ['#FFA06B', '#FFB787'] as const,
  3: ['#FFD93D', '#FFE169'] as const,
  4: ['#87CEEB', '#98D8F1'] as const,
  5: ['#4CAF50', '#69C16D'] as const,
};

const FeedbackForm = () => {
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [improvements, setImprovements] = useState("");

  const handleSubmit = async () => {
    if (!rating || !feedback || !improvements) {
      Alert.alert("Error", "Please fill out all fields!");
      return;
    }

    const result = await submitFeedback(feedback, improvements, rating);

    if (result.success) {
      Alert.alert("Thank you!", "Your feedback has been submitted.");
      setRating(null);
      setFeedback("");
      setImprovements("");
    } else {
      Alert.alert("Error", result.message || "Could not submit feedback. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={[styles.heading, { fontFamily: fonts.primary }]}>
            What can we improve?
            </Text>
            <Text style={[styles.subheading, { fontFamily: fonts.secondary }]}>
              Your thoughts matter to us
            </Text>

            <Text style={[styles.label, { fontFamily: fonts.primary }]}>
              How would you rate your experience?
            </Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => setRating(num)}
                >
                  <LinearGradient
                    colors={rating === num ? RATING_COLORS[num as keyof typeof RATING_COLORS] : ['#F3F4F6', '#F3F4F6']}
                    style={[
                      styles.ratingButton,
                      rating === num && styles.selectedRating,
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={[
                      styles.ratingText,
                      { fontFamily: fonts.secondary },
                      rating === num && styles.selectedRatingText,
                    ]}>
                      {num}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { fontFamily: fonts.primary }]}>
              How is the app?
            </Text>
            <TextInput
              style={[styles.input, { fontFamily: fonts.secondary }]}
              placeholder="Share your thoughts about the app"
              placeholderTextColor="#999"
              value={feedback}
              onChangeText={setFeedback}
              multiline
            />

            <Text style={[styles.label, { fontFamily: fonts.primary }]}>
              What can be improved?
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, { fontFamily: fonts.secondary }]}
              placeholder="Suggest improvements for the app"
              placeholderTextColor="#999"
              value={improvements}
              onChangeText={setImprovements}
              multiline
            />

            <LinearGradient
              colors={[colors.upcoming, '#7C80FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.button,
                (!rating || !feedback || !improvements) && styles.disabledButton
              ]}
            >
              <TouchableOpacity 
                onPress={handleSubmit}
                disabled={!rating || !feedback || !improvements}
                style={styles.buttonContent}
              >
                <Text style={[styles.buttonText, { fontFamily: fonts.primary }]}>
                  Send Feedback →
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  heading: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    color: colors.upcoming,
  },
  subheading: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: "center",
    color: "#666",
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#000',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  ratingButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedRating: {
    borderWidth: 0,
  },
  ratingText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#4B5563",
  },
  selectedRatingText: {
    color: '#fff',
    fontWeight: "700",
  },
  button: {
    borderRadius: 16,
    marginTop: 8,
    overflow: 'hidden',
  },
  buttonContent: {
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FeedbackForm;