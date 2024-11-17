import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, TextInput, View,
  FlatList, TouchableOpacity, Modal, Button, Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState('');
  const [deleteAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
    };
    saveTasks();
  }, [tasks]);

  const addTask = () => {
    if (task.trim() && !tasks.some(t => t.text === task.trim())) {
      const newTask = { id: Date.now().toString(), text: task.trim(), completed: false };
      setTasks(prevTasks => [newTask, ...prevTasks]);
      setTask('');
    } else {
      alert('Please enter a valid task and avoid duplicates.');
    }
  };

  const deleteTask = (taskId) => {
    Animated.timing(deleteAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      const updatedTasks = tasks.filter((item) => item.id !== taskId);
      setTasks(updatedTasks);
      deleteAnim.setValue(1);
    });
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map((item) =>
      item.id === taskId ? { ...item, completed: !item.completed } : item
    );
    setTasks(updatedTasks);
  };

  const openEditModal = (taskId, taskText) => {
    setCurrentTaskId(taskId);
    setEditedTask(taskText);
    setModalVisible(true);
  };

  const saveEditedTask = () => {
    if (editedTask.trim()) {
      const updatedTasks = tasks.map((item) =>
        item.id === currentTaskId ? { ...item, text: editedTask.trim() } : item
      );
      setTasks(updatedTasks);
      setModalVisible(false);
      setEditedTask('');
    } else {
      alert('Please enter a valid task.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <Animated.View style={[styles.taskContainer, { opacity: deleteAnim }]}>
            {/* Edit Task on Text Press */}
            <TouchableOpacity onPress={() => openEditModal(item.id, item.text)} style={styles.taskTextContainer}>
              <Text
                style={[
                  styles.taskText,
                  item.completed ? styles.completedTask : null,
                ]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              {/* Toggle Completion */}
              <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
                <Text style={styles.doneButton}>{item.completed ? '✅' : '✔️'}</Text>
              </TouchableOpacity>

              {/* Delete Button */}
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Text style={styles.deleteButton}>X</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
      />

      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TextInput
              style={styles.modalInput}
              value={editedTask}
              onChangeText={setEditedTask}
              placeholder="Edit your task"
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Save" onPress={saveEditedTask} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doneButton: {
    color: '#28a745',
    fontSize: 20,
    marginRight: 10,
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    width: '80%',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  modalInput: {
    width: '100%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});
