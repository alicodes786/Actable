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
                  style={[
                    styles.ratingButton,
                    rating === num && styles.selectedRating,
                  ]}
                  onPress={() => setRating(num)}
                >
                  <Text style={[
                    styles.ratingText,
                    { fontFamily: fonts.secondary },
                    rating === num && styles.selectedRatingText,
                  ]}>
                    {num}
                  </Text>
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

            <TouchableOpacity 
              style={[
                styles.button,
                (!rating || !feedback || !improvements) && styles.disabledButton
              ]} 
              onPress={handleSubmit}
              disabled={!rating || !feedback || !improvements}
            >
              <Text style={[styles.buttonText, { fontFamily: fonts.primary }]}>
                Send Feedback →
              </Text>
            </TouchableOpacity>
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
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
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
    color: "#000",
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
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    color: "#000",
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  selectedRating: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  ratingText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4B5563",
  },
  selectedRatingText: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: "#E5E7EB",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FeedbackForm;