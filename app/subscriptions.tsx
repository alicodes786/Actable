import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchSubscription,
  updateSubscription,
  createSubscription,
  deleteSubscription,
} from "@/db/subscription";

const SubscriptionSettings = () => {
  const [email, setEmail] = useState<string>("");
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const { user } = useAuth();

  const userId = user;
  const type = "all"; // Fixed subscription type

  useEffect(() => {
    loadSubscription();
  }, []);

  const sendSubscriberVerification = () => null;

  const loadSubscription = async () => {
    const { data, error } = await fetchSubscription(String(userId));

    if (error) {
      Alert.alert("Error", "Failed to load subscription.");
      return;
    }

    if (data) {
      setEmail(data.email);
      setCurrentSubscription(data);
    }
  };

  const handleEmailSubmit = async () => {
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      if (currentSubscription) {
        const result = await updateSubscription(
          currentSubscription.id,
          email
        );

        if (!result.success) throw result.error;
        sendSubscriberVerification();
      } else {
        const result = await createSubscription(email, String(userId), type);

        if (!result.success) throw result.error;
        sendSubscriberVerification();
      }

      Alert.alert("Success", "Subscription updated successfully.");
      loadSubscription();
    } catch (error) {
      Alert.alert("Error", "Failed to update subscription.");
      console.error(error);
    }
  };

  const handleDeleteSubscription = async () => {
    if (!currentSubscription) {
      Alert.alert("Error", "No subscription to delete.");
      return;
    }

    try {
      const result = await deleteSubscription(currentSubscription.id);

      if (!result.success) throw result.error;

      Alert.alert("Success", "Subscription deleted successfully.");
      setEmail("");
      setCurrentSubscription(null);
    } catch (error) {
      Alert.alert("Error", "Failed to delete subscription.");
      console.error(error);
    }
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <SafeAreaView className="flex-1 px-4 py-6 bg-white">
      <Text className="text-2xl font-bold text-gray-800 mb-4">
        Subscription Settings
      </Text>

      <View className="mb-4">
        <TextInput
          className="border border-gray-300 rounded-lg p-3 text-gray-800"
          placeholder="Enter email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      <View className="flex-row justify-between">
        <TouchableOpacity
          className="bg-blue-500 py-3 px-6 rounded-lg"
          onPress={handleEmailSubmit}
        >
          <Text className="text-white font-bold">
            {currentSubscription ? "Update" : "Subscribe"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-500 py-3 px-6 rounded-lg"
          onPress={handleDeleteSubscription}
        >
          <Text className="text-white font-bold">Delete</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SubscriptionSettings;
