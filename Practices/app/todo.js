import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

function Todo(props) {
  const [task, setTask] = useState("");
  const [list, setList] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await AsyncStorage.getItem("userData");
        const data = JSON.parse(res);
        setList(data);
      } catch (e) {
        console.log(e);
      }
    };
    getData();
  }, [list]);

  const addTask = () => {
    const taskId = list ? list.length + 1 : 1;
    const updatedData = (list===null)?[{id:taskId,task:task,status:false}]:[{ id: taskId, task: task, status: false }, ...list];
    setTask("");
    storeData(updatedData);
  };

  const storeData = async (list) => {
    try {
      const updatedList = JSON.stringify(list);
      await AsyncStorage.setItem("userData", updatedList);
    } catch (e) {
      console.log(e);
    }
  };

  const statusTask = (id) => {
    const filteredValues = list.map((item) => {
      return item.id === id ? { ...item, status: !item.status } : item;
    });
    storeData(filteredValues);
  };

  const deleteTask = (id) => {
    const filteredList = list.filter((item) => item.id !== id);
    storeData(filteredList);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.task}</Text>
        <Button
          onPress={() => {
            statusTask(item.id);
          }}
          title={!item.status ? "not completed" : "completed"}
          color="green"
        />

        <Button
          onPress={() => {
            deleteTask(item.id);
          }}
          title="Delete"
          color="red"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>TODO List</Text>
      <View style={styles.input_container}>
        <TextInput
          placeholder="Enter your Task"
          style={styles.input}
          value={task}
          onChangeText={(newText) => setTask(newText)}
        />
        <Button onPress={addTask} title="+ Add Task" color="#841584" />
      </View>
      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={(list) => list.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop:30,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "start",
    gap: 10,
    
  },
  text: {
    fontWeight: 700,
    fontSize: 24,
  },
  input: {
    
    padding: 15,
    borderColor: "violet",
    borderWidth: 1,
    width: "60%",
  },
  input_container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  title: {
    padding: 10,
    fontSize: 14,
  },
  list: {
    flexDirection: "column",
    width: "90%",
    height: "85%",
  },
  card: {
    flex: 1,
    // width: "80%",
    flexDirection: "row",
    borderBottomWidth: 2,
    borderColor: "gray",
    gap: 10,
    justifyContent: "space-between",
    padding: 10,
  },
});

export default Todo;
