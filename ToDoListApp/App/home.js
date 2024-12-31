import { SafeAreaView, StyleSheet, Text, Image, Pressable } from "react-native";
import { Link } from "expo-router";
export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      {/* <Text>My Projects</Text>
      <Link href="/todo">
      TODO Mini Project
      </Link> */}
      {/* <Link href="/todo" asChild>
        <Pressable onPress={()=>{console.log()}}> */}
          <Text>Home</Text>
        {/* </Pressable>
      </Link> */}
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
