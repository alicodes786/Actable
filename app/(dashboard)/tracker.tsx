import React, { useCallback, useState, useEffect } from 'react';
import { View, ScrollView, SafeAreaView, TouchableOpacity, Modal, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { getDeadlines } from '@/db/deadlines';
import { IdeadlineList } from '@/lib/interfaces';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type TimePeriod = '1' | '7' | '31';

const periodLabels = {
  '1': 'Last 24h',
  '7': 'Last 7 days',
  '31': 'Last 31 days',
} as const;

export default function TrackerScreen() {
  const { user, assignedUser } = useAuth();
  const [deadlines, setDeadlines] = useState<IdeadlineList | null>(null);
  const [period, setPeriod] = useState<TimePeriod>('7');
  const [stats, setStats] = useState({
    total: 0,
    onTime: 0,
    late: 0,
    missed: 0,
    invalid: 0,
  });
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  const calculateStats = (deadlines: IdeadlineList | null) => {
    if (!deadlines?.deadlineList) return;

    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - parseInt(period));

    // Find all deadlines with submissions in this period
    const relevantDeadlines = deadlines.deadlineList.filter(deadline => {
      const submission = deadline.submissions?.find(
        sub => sub.id === deadline.lastsubmissionid
      );

      if (submission) {
        const submissionDate = new Date(submission.submitteddate);
        return submissionDate >= cutoffDate && submissionDate <= now;
      }

      // Include missed deadlines that were due in this period
      const dueDate = new Date(deadline.date);
      return dueDate >= cutoffDate && dueDate <= now;
    });

    const newStats = {
      total: relevantDeadlines.length,
      onTime: 0,
      late: 0,
      missed: 0,
      invalid: 0,
    };

    relevantDeadlines.forEach(deadline => {
      const dueDate = new Date(deadline.date);
      const submission = deadline.submissions?.find(
        sub => sub.id === deadline.lastsubmissionid
      );

      if (!deadline.lastsubmissionid && dueDate < now) {
        newStats.missed++;
      } else if (submission) {
        const submissionDate = new Date(submission.submitteddate);

        if (submission.status === 'invalid') {
          newStats.invalid++;
        } else if (submission.status === 'approved') {
          if (submissionDate <= dueDate) {
            newStats.onTime++;
          } else {
            newStats.late++;
          }
        }
      }
    });

    setStats(newStats);
  };

  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      const fetchDeadlines = async () => {
        try {
          const userId = user.role === 'mod' ? String(assignedUser?.id) : String(user.id);
          const fetchedDeadlines = await getDeadlines(userId);
          setDeadlines(fetchedDeadlines);
          calculateStats(fetchedDeadlines);
        } catch (error) {
          console.error('Error fetching deadlines:', error);
        }
      };

      fetchDeadlines();
    }, [user, assignedUser])
  );

  useEffect(() => {
    calculateStats(deadlines);
  }, [period, deadlines]);

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" bounces={false}>
        <View className="px-5 pt-2 pb-10">
          <Text className="text-2xl mt-6 mb-3" style={{ fontFamily: 'Manrope' }}>Performance Overview</Text>
          
          <TouchableOpacity 
            className="mb-5 flex-row items-center justify-between bg-gray-100 p-4 rounded-xl"
            onPress={() => setShowPeriodModal(true)}
          >
            <Text style={{ fontFamily: 'Roboto' }}>{periodLabels[period]}</Text>
            <Ionicons name="chevron-down" size={20} />
          </TouchableOpacity>

          <Modal
            visible={showPeriodModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowPeriodModal(false)}
          >
            <TouchableOpacity 
              className="flex-1 bg-black/50"
              activeOpacity={1}
              onPress={() => setShowPeriodModal(false)}
            >
              <View className="mt-auto bg-white rounded-t-3xl">
                <View className="p-4 border-b border-gray-200">
                  <Text className="text-xl font-bold text-center">Select Period</Text>
                </View>
                {(Object.entries(periodLabels) as [TimePeriod, string][]).map(([value, label]) => (
                  <TouchableOpacity
                    key={value}
                    className={`p-4 border-b border-gray-100 ${period === value ? 'bg-gray-100' : ''}`}
                    onPress={() => {
                      setPeriod(value);
                      setShowPeriodModal(false);
                    }}
                  >
                    <Text className="text-center text-lg">{label}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  className="p-4 mb-5"
                  onPress={() => setShowPeriodModal(false)}
                >
                  <Text className="text-center text-lg text-red-500">Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Total Deadlines Card */}
          <LinearGradient
            colors={['#4c669f', '#3b5998']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-xl p-5 mb-4 shadow-sm"
          >
            <Text className="text-white text-lg font-bold mb-2" style={{ fontFamily: 'Manrope' }}>Total Deadlines</Text>
            <Text className="text-white text-3xl font-bold" style={{ fontFamily: 'Roboto' }}>{stats.total}</Text>
          </LinearGradient>

          {/* Statistics Grid */}
          <View className="flex-row flex-wrap justify-between mb-4">
            {/* On Time Card */}
            <View className="w-[48%] bg-green-100 rounded-xl p-4 mb-3">
              <Text className="text-green-800 text-base font-semibold mb-1" style={{ fontFamily: 'Roboto' }}>On Time</Text>
              <Text className="text-green-800 text-2xl font-bold" style={{ fontFamily: 'Roboto' }}>{stats.onTime}</Text>
              <Text className="text-green-700 text-sm">
                {stats.total > 0 ? ((stats.onTime / stats.total) * 100).toFixed(0) : 0}%
              </Text>
            </View>

            {/* Late Card */}
            <View className="w-[48%] bg-orange-100 rounded-xl p-4 mb-3">
              <Text className="text-orange-800 text-base font-semibold mb-1">Late</Text>
              <Text className="text-orange-800 text-2xl font-bold">{stats.late}</Text>
              <Text className="text-orange-700 text-sm">
                {stats.total > 0 ? ((stats.late / stats.total) * 100).toFixed(0) : 0}%
              </Text>
            </View>

            {/* Missed Card */}
            <View className="w-[48%] bg-red-100 rounded-xl p-4 mb-3">
              <Text className="text-red-800 text-base font-semibold mb-1">Missed</Text>
              <Text className="text-red-800 text-2xl font-bold">{stats.missed}</Text>
              <Text className="text-red-700 text-sm">
                {stats.total > 0 ? ((stats.missed / stats.total) * 100).toFixed(0) : 0}%
              </Text>
            </View>

            {/* Invalid Card */}
            <View className="w-[48%] bg-gray-100 rounded-xl p-4 mb-3">
              <Text className="text-gray-800 text-base font-semibold mb-1">Invalid</Text>
              <Text className="text-gray-800 text-2xl font-bold">{stats.invalid}</Text>
              <Text className="text-gray-700 text-sm">
                {stats.total > 0 ? ((stats.invalid / stats.total) * 100).toFixed(0) : 0}%
              </Text>
            </View>
          </View>

          {/* Performance Metrics */}
          {stats.total > 0 && (
            <LinearGradient
              colors={['#00b09b', '#96c93d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-xl p-5 shadow-sm"
            >
              <Text className="text-white text-lg font-bold mb-3">Overall Performance</Text>
              <View className="bg-white/20 rounded-lg p-3 mb-2">
                <Text className="text-white font-semibold">
                  On-Time Rate: {((stats.onTime / stats.total) * 100).toFixed(1)}%
                </Text>
              </View>
              <View className="bg-white/20 rounded-lg p-3">
                <Text className="text-white font-semibold">
                  Submission Rate: {(((stats.onTime + stats.late) / stats.total) * 100).toFixed(1)}%
                </Text>
              </View>
            </LinearGradient>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 