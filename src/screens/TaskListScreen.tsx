import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Task} from '../types/Task';
import {storage} from '../utils/storage';

interface TaskListScreenProps {
  navigation: any;
}

export default function TaskListScreen({navigation}: TaskListScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const loadTasks = async () => {
    const loadedTasks = await storage.getTasks();
    setTasks(loadedTasks);
  };

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, []),
  );

  const toggleTaskComplete = async (task: Task) => {
    const updatedTask = {...task, isCompleted: !task.isCompleted};
    await storage.updateTask(task.id, updatedTask);
    await loadTasks();
  };

  const deleteTask = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await storage.deleteTask(task.id);
            await loadTasks();
          },
        },
      ],
    );
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderTask = ({item}: {item: Task}) => (
    <TouchableOpacity
      style={[
        styles.taskCard,
        item.isCompleted && styles.taskCardCompleted,
        item.isAssessment && styles.assessmentCard,
      ]}
      onPress={() => toggleTaskComplete(item)}
      onLongPress={() => deleteTask(item)}>
      <View style={styles.taskHeader}>
        <Text
          style={[
            styles.taskTitle,
            item.isCompleted && styles.taskTitleCompleted,
          ]}>
          {item.isAssessment ? '📝 ' : '📚 '}
          {item.title}
        </Text>
        {item.isCompleted && <Text style={styles.completedBadge}>✓ Done</Text>}
      </View>
      {item.description && (
        <Text
          style={[
            styles.taskDescription,
            item.isCompleted && styles.taskDescriptionCompleted,
          ]}>
          {item.description}
        </Text>
      )}
      <View style={styles.taskFooter}>
        {item.dueDate && (
          <Text style={styles.dueDate}>
            Due: {formatDate(item.dueDate)}
          </Text>
        )}
        {item.reminderDate && (
          <Text style={styles.reminderDate}>
            Reminder: {formatDate(item.reminderDate)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTask')}>
          <Text style={styles.addButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}>
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'active' && styles.filterActive,
          ]}
          onPress={() => setFilter('active')}>
          <Text
            style={[
              styles.filterText,
              filter === 'active' && styles.filterTextActive,
            ]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'completed' && styles.filterActive,
          ]}
          onPress={() => setFilter('completed')}>
          <Text
            style={[
              styles.filterText,
              filter === 'completed' && styles.filterTextActive,
            ]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {sortedTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {filter === 'all'
              ? 'No tasks yet. Add your first task!'
              : filter === 'active'
              ? 'No active tasks'
              : 'No completed tasks'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedTasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#6200ee',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  filterActive: {
    backgroundColor: '#6200ee',
  },
  filterText: {
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 10,
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskCardCompleted: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
  },
  assessmentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  completedBadge: {
    color: '#4caf50',
    fontWeight: '600',
    fontSize: 12,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  taskDescriptionCompleted: {
    color: '#999',
  },
  taskFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  dueDate: {
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: '500',
  },
  reminderDate: {
    fontSize: 12,
    color: '#2196f3',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

