import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { submitFeedback } from "@/db/feedback"; // Adjust the path based on your project structure

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState("");
  const [improvements, setImprovements] = useState("");

  const handleSubmit = async () => {
    if (!feedback || !improvements) {
      Alert.alert("Error", "Please fill out all fields!");
      return;
    }

    const result = await submitFeedback(feedback, improvements);

    if (result.success) {
      Alert.alert("Thank you!", "Your feedback has been submitted.");
      setFeedback("");
      setImprovements("");
    } else {
      Alert.alert("Error", result.message || "Could not submit feedback. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>We Value Your Feedback</Text>

      <Text style={styles.label}>How is the app?</Text>
      <TextInput
        style={styles.input}
        placeholder="Share your thoughts about the app"
        placeholderTextColor="#555"
        value={feedback}
        onChangeText={setFeedback}
        multiline
      />

      
      <Text style={styles.label}>What can be improved?</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Suggest improvements for the app"
        placeholderTextColor="#555"
        value={improvements}
        onChangeText={setImprovements}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FeedbackForm;