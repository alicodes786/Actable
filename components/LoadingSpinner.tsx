import { ActivityIndicator, View, Text, StyleSheet } from "react-native";


export default function LoadingSpinner() {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading submission details...</Text>
      </View>
    );
  }

  const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: "#fff"
    },
    loadingText: {
      marginTop: 10,
      color: '#666'
    },
  });