import { View, Text, Image } from 'react-native';
import { Tabs, Redirect } from 'expo-router';

import icons from "@/constants/icons";

const TabIcon = ({icon, color, name, focused}: any) => {
  return(
    <View className='items-center justify-center gap-1 ' style={{ paddingTop: 20 }}>
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className='w-6 h-6'
      />
      <Text className={`${focused ? 'font-gBold text-secondary' : 'font-gBook text-tertiary'} text-xs text-center`}
        numberOfLines={1}
        style={{ width: 61 }}
      >
        {name}
      </Text>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <>
      <Tabs screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#8a92eb',
        tabBarInactiveTintColor: '#ccccff',
        tabBarStyle:{
          backgroundColor: '#161622',
          borderTopWidth: 1,
          borderTopColor: '#232533',
          height: 80
        }
      }}>
        <Tabs.Screen 
          name='play' 
          options={{
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabIcon
                icon={icons.play}
                color={color}
                name='Play'
                focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen 
          name='multiplayer' 
          options={{
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabIcon
                icon={icons.multiplayer}
                color={color}
                name='Multiplayer'
                focused={focused}
              />
            )
          }}
        /><Tabs.Screen 
        name='saved' 
        options={{
          headerShown: false,
          tabBarIcon: ({color, focused}) => (
            <TabIcon
              icon={icons.save}
              color={color}
              name='Saved'
              focused={focused}
            />
          )
        }}
      />
        <Tabs.Screen 
          name='profile' 
          options={{
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabIcon
                icon={icons.profile}
                color={color}
                name='Profile'
                focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen
          name='SavedQuestion'
          options={{ 
            href: null, 
            headerShown:false,
            tabBarStyle: { display: 'none' }
          }} 
        />
      </Tabs>
    </>
  )
}
