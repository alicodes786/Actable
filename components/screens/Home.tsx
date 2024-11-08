import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IdeadlineList } from '@/lib/interfaces';
import { getDeadlines } from '@/db/deadlines';
import CountDownTimer from '../CountDownTimer';
import { useAuth } from '@/providers/AuthProvider';
import { router } from 'expo-router';

export default function Home() {
    const [deadlines, setDeadlines] = useState<IdeadlineList | null>(null);
    const blueGradient = ['#00BFFF', '#0099CC', '#4169E1'];
    const blackGradient =  ['#D100D1', '#9A00E6', '#6A0DAD'];
    const orangeGradient = ['#FF8C00', '#FF4500', '#FF0000'];
    const { isLoading, user } = useAuth();

    useEffect(() => {
        if (isLoading || !user) return;

        const fetchDeadlines = async () => {
            const fetchedDeadlines: IdeadlineList | null = await getDeadlines(String(user));
            setDeadlines(fetchedDeadlines);
        };
        fetchDeadlines();
    }, []);

    return (
        <View className="flex-1 bg-[#fff] min-h-full">
            <Text className="text-xl font-medium ml-5 my-5">Welcome, Hassan</Text>
            
            <View className="flex-1 mt-7 px-[5%] pt-[2%] ios:pt-[3%]">
                <View className="w-full mb-5">
                    <Text className="text-xl font-bold">Upcoming Deadlines</Text>
                    
                    <ScrollView>
                        {deadlines && deadlines.deadlineList.slice(0, 3).map((item, idx) => (
                            <LinearGradient
                                key={idx}
                                colors={[blueGradient,blackGradient,orangeGradient][idx]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="mt-4 p-5 rounded-2xl shadow-md w-full max-w-[400px]"
                            >
                                <Text className="text-white my-1 text-base font-medium">
                                    {item.name}
                                </Text>
                                <Text className="text-white my-1 text-base font-medium">
                                    <CountDownTimer deadlineDate={item.date} />
                                </Text>
                                <TouchableOpacity 
                                    className="bg-black p-2.5 rounded mt-2.5 self-start min-w-[100px] items-center"
                                    onPress={() => {
                                        router.push({
                                            pathname: "/(tabs)/submission",
                                            params: {
                                                deadlineId: item.id,
                                                name: item.name,
                                                description: item.description,
                                                date: item.date instanceof Date ? item.date.toISOString() : item.date,
                                            }
                                        });
                                    }}
                                >
                                    <Text className="text-white text-lg font-semibold">Submit</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}