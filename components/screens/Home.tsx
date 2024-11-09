import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { IdeadlineList } from '@/lib/interfaces';
import { getDeadlines } from '@/db/deadlines';
import CountDownTimer from '../CountDownTimer';
import { useAuth } from '@/providers/AuthProvider';

const GRADIENT_COLORS = [
  ['#87CEEB', '#00BFFF'],
  ['#ff7a63', '#FF6347'],
  ['#8f75ff', '#5d3ce8'],
];

export default function Home() {
    const [deadlines, setDeadlines] = useState<IdeadlineList | null>(null);
    const { isLoading, user } = useAuth();
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (isLoading || !user) return;

        const fetchDeadlines = async () => {
            try {
                const fetchedDeadlines = await getDeadlines(String(user));
                setDeadlines(fetchedDeadlines);
            } catch (error) {
                console.error('Error fetching deadlines:', error);
                // Handle error appropriately
            }
        };

        fetchDeadlines();
    }, [isLoading, user]);

    const handleSubmission = (item: any) => {
        router.push({
            pathname: "/(tabs)/submission",
            params: {
                deadlineId: item.id,
                name: item.name,
                description: item.description,
                date: item.date instanceof Date ? item.date.toISOString() : item.date,
            }
        });
    };

    const getUpcomingDeadlines = () => {
        if (!deadlines?.deadlineList) return [];
        
        return deadlines.deadlineList
            .filter(item => new Date(item.date) >= new Date(today))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" bounces={false}>
                <View className="px-5 pt-2 pb-10 flex-1">
                    <Text className="text-lg font-medium">Welcome, Hassan</Text>
                    
                    <View className="mt-10">
                        <Text className="text-2xl font-bold mb-3">Upcoming</Text>
                        
                        {getUpcomingDeadlines().map((item, idx) => (
                            <LinearGradient
                                key={item.id || idx}
                                colors={GRADIENT_COLORS[idx]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="mt-4 p-5 rounded-2xl shadow-md"
                            >
                                <Text className="text-white text-base font-medium mb-1">
                                    {item.name}
                                </Text>
                                <Text className="text-white text-base font-medium">
                                    <CountDownTimer deadlineDate={item.date} />
                                </Text>
                                <TouchableOpacity 
                                    className="bg-black p-2.5 rounded mt-2.5 self-start min-w-[100px] items-center"
                                    onPress={() => handleSubmission(item)}
                                >
                                    <Text className="text-white text-lg font-semibold">
                                        Submit
                                    </Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}