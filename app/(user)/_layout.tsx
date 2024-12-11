import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/AuthProvider';
import TabNavigation from '@/components/navigation/TabNavigation';

const TabLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-white mt-8 overflow-visible">
      <TabNavigation />
    </SafeAreaView>
  );
};

export default TabLayout;
