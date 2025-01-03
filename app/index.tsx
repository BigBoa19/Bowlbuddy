import { Text, View, TouchableOpacity } from "react-native";
import * as Google from 'expo-auth-session/providers/google';


export default function Index() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '977334486277-ompfkp4elgat2mii20vk2510dhlln39u.apps.googleusercontent.com'
  });
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TouchableOpacity onPress={() => promptAsync()} >
        <Text>
          Continue with Google
        </Text>
      </TouchableOpacity>
    </View>
  );
}
