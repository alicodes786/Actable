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
      <Text style={styles.heading}>We value your feedback</Text>
      <TextInput
        style={styles.input}
        placeholder="How is the app?"
        value={feedback}
        onChangeText={setFeedback}
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
