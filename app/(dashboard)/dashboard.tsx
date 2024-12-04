import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { router, useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { DeadlineWithSubmission, fetchUnapprovedSubmissions } from '@/db/submissions';

export default function Dashboard() {
  const { logout, user, assignedUser } = useAuth();
  const [submissions, setSubmissions] = useState<DeadlineWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const refreshInterval = setInterval(() => {
        if (isActive) {
          loadSubmissions();
        }
      }, 5000);

      loadSubmissions();

      return () => {
        isActive = false;
        clearInterval(refreshInterval);
      };
    }, [assignedUser])
  );

  const loadSubmissions = async () => {
    if (!assignedUser?.id) return;
    
    try {
      const data = await fetchUnapprovedSubmissions(String(assignedUser.id));
      setSubmissions(data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load submissions',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      Toast.show({
        type: 'success',
        text1: 'Signed Out Successfully',
        text2: 'Redirecting to login...',
        position: 'bottom',
        visibilityTime: 2000,
      });
      router.replace('/(auth)/sign-in');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to sign out. Please try again.',
        position: 'bottom',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>
            Pending Submissions
          </Text>

          {submissions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push({
                pathname: "/(dashboard)/submission/[id]",
                params: { id: item.submission.id }
              })}
            >
              <Image
                source={{ uri: item.submission.imageurl }}
                style={styles.thumbnail}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDate}>
                  Submitted: {formatDate(item.submission.submitteddate)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {submissions.length === 0 && !loading && (
            <Text style={styles.noSubmissions}>
              No pending submissions to review
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDate: {
    fontSize: 14,
    color: '#666',
  },
  noSubmissions: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  signOutButton: {
    backgroundColor: '#443399',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 