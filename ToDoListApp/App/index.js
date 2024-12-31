import { SafeAreaView, StyleSheet, Text, Image, Pressable, Button } from "react-native";
import { Link, useRouter } from "expo-router";
import { Route } from "expo-router/build/Route";
export default function MainApp() {
  const router=useRouter()
  return (
    <SafeAreaView style={styles.container}>
      {/* <Text>My Projects</Text>
      <Link href="/todo">
      TODO Mini Project
      </Link> */}
      {/* <Link href="/home" asChild>
        <Pressable onPress={()=>{console.log()}}>
          <Text>Go to Home</Text>
        </Pressable>
      </Link> */}
      <Button onPress={()=>{
        router.push('/todo')
      }}
      title="Click me"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
});
