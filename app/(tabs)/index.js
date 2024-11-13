import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, TextInput, View,
  FlatList, TouchableOpacity, Modal, Button
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

export default function HomeScreen() {
  const [task, setTask] = useState(''); // State for the input field
  const [tasks, setTasks] = useState([]); // State for the list of tasks
  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [currentTaskId, setCurrentTaskId] = useState(null); // ID of the task to edit
  const [editedTask, setEditedTask] = useState(''); // Edited task text

  // Load tasks from AsyncStorage when the app starts
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks)); // Parse and set the tasks if any exist
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };
    loadTasks();
  }, []); // Run once when the component mounts

  // Save tasks to AsyncStorage whenever tasks state changes
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks)); // Store tasks as a JSON string
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
    };
    saveTasks();
  }, [tasks]); // Run whenever tasks state changes

  // Function to add a new task
  const addTask = () => {
    if (task.trim() && !tasks.some(t => t.text === task.trim())) {
      const newTask = { id: Date.now().toString(), text: task.trim(), completed: false };
      setTasks([...tasks, newTask]); // Add task
      setTask(''); // Clear input field after adding task
    } else {
      alert('Please enter a valid task and avoid duplicates.');
    }
  };

  // Function to delete a task
  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter((item) => item.id !== taskId);
    setTasks(updatedTasks); // Remove the task by id
  };

  // Function to toggle completion status of a task
  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map((item) =>
      item.id === taskId ? { ...item, completed: !item.completed } : item
    );
    setTasks(updatedTasks); // Toggle the completed status
  };

  // Function to open the modal for editing a task
  const openEditModal = (taskId, taskText) => {
    setCurrentTaskId(taskId); // Store the task ID for editing
    setEditedTask(taskText); // Set the current task text in the modal
    setModalVisible(true); // Open the modal
  };

  // Function to save the edited task
  const saveEditedTask = () => {
    if (editedTask.trim()) {
      const updatedTasks = tasks.map((item) =>
        item.id === currentTaskId ? { ...item, text: editedTask.trim() } : item
      );
      setTasks(updatedTasks); // Update task text
      setModalVisible(false); // Close the modal
      setEditedTask(''); // Clear the edited task input
    } else {
      alert('Please enter a valid task.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>

      {/* Input section */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={(text) => setTask(text)} // Update input state
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Task list */}
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)} style={styles.taskTextContainer}>
              <Text
                style={[
                  styles.taskText,
                  item.completed ? styles.completedTask : null
                ]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>

            {/* Edit and delete buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => openEditModal(item.id, item.text)}>
                <Text style={styles.editButton}>✏️</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Text style={styles.deleteButton}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Modal for editing task */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
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
  editButton: {
    color: '#FF8C00',
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    width: '100%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

