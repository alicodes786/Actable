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
import { submitFeedback } from "@/db/feedback"; // Adjust the path based on your project structure

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
            <Text style={styles.heading}>Feedback Time!</Text>
            <Text style={styles.subheading}>Your thoughts matter to us</Text>

            <Text style={styles.label}>How would you rate your experience?</Text>
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
                    rating === num && styles.selectedRatingText,
                  ]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>How is the app?</Text>
            <TextInput
              style={styles.input}
              placeholder="Share your thoughts about the app"
              placeholderTextColor="#999"
              value={feedback}
              onChangeText={setFeedback}
              multiline
            />

            <Text style={styles.label}>What can be improved?</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
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
              <Text style={styles.buttonText}>Send</Text>
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
    backgroundColor: "#f0f0f0",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
    color: "#333",
  },
  subheading: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  ratingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedRating: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  selectedRatingText: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#B0B0B0",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default FeedbackForm;