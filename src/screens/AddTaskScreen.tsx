import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Task} from '../types/Task';
import {storage} from '../utils/storage';

interface AddTaskScreenProps {
  navigation: any;
}

export default function AddTaskScreen({navigation}: AddTaskScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAssessment, setIsAssessment] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [reminderDate, setReminderDate] = useState<Date | undefined>(undefined);
  
  // Due date picker state
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [dueDatePickerMode, setDueDatePickerMode] = useState<'date' | 'time'>('date');
  
  // Reminder date picker state
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderDatePickerMode, setReminderDatePickerMode] = useState<'date' | 'time'>('date');

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate,
      reminderDate: reminderDate,
      isCompleted: false,
      createdAt: new Date(),
      isAssessment: isAssessment,
    };

    await storage.addTask(newTask);

    Alert.alert('Success', 'Task added successfully!', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Task Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter task title"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter task description (optional)"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.field}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Assessment Task</Text>
            <Switch
              value={isAssessment}
              onValueChange={setIsAssessment}
              trackColor={{false: '#767577', true: '#6200ee'}}
              thumbColor={isAssessment ? '#fff' : '#f4f3f4'}
            />
          </View>
          <Text style={styles.hint}>
            Mark this as an assessment to receive special reminders
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              if (Platform.OS === 'android') {
                // On Android, start with date picker
                setDueDatePickerMode('date');
                setShowDueDatePicker(true);
              } else {
                // On iOS, use datetime mode
                setShowDueDatePicker(true);
              }
            }}>
            <Text style={styles.dateButtonText}>
              {dueDate
                ? dueDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : 'Select due date (optional)'}
            </Text>
          </TouchableOpacity>
          {showDueDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode={
                Platform.OS === 'android'
                  ? dueDatePickerMode
                  : 'datetime'
              }
              display={Platform.OS === 'ios' ? 'default' : 'default'}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') {
                  // Android: Handle date/time separately
                  if (event.type === 'set' && selectedDate) {
                    if (dueDatePickerMode === 'date') {
                      // Date selected, now show time picker
                      const newDate = new Date(selectedDate);
                      const existingDate = dueDate || new Date();
                      newDate.setHours(existingDate.getHours());
                      newDate.setMinutes(existingDate.getMinutes());
                      setDueDate(newDate);
                      setDueDatePickerMode('time');
                      // Keep picker open for time selection
                    } else {
                      // Time selected, update and close
                      const newDate = new Date(dueDate || new Date());
                      newDate.setHours(selectedDate.getHours());
                      newDate.setMinutes(selectedDate.getMinutes());
                      setDueDate(newDate);
                      setShowDueDatePicker(false);
                    }
                  } else if (event.type === 'dismissed') {
                    // Picker dismissed, close it
                    setShowDueDatePicker(false);
                  }
                } else {
                  // iOS: Handle datetime mode
                  if (event.type === 'set' && selectedDate) {
                    setDueDate(selectedDate);
                    setShowDueDatePicker(false);
                  } else if (event.type === 'dismissed') {
                    setShowDueDatePicker(false);
                  }
                }
              }}
            />
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Reminder Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              if (Platform.OS === 'android') {
                // On Android, start with date picker
                setReminderDatePickerMode('date');
                setShowReminderPicker(true);
              } else {
                // On iOS, use datetime mode
                setShowReminderPicker(true);
              }
            }}>
            <Text style={styles.dateButtonText}>
              {reminderDate
                ? reminderDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : 'Select reminder date (optional)'}
            </Text>
          </TouchableOpacity>
          {showReminderPicker && (
            <DateTimePicker
              value={reminderDate || new Date()}
              mode={
                Platform.OS === 'android'
                  ? reminderDatePickerMode
                  : 'datetime'
              }
              display={Platform.OS === 'ios' ? 'default' : 'default'}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') {
                  // Android: Handle date/time separately
                  if (event.type === 'set' && selectedDate) {
                    if (reminderDatePickerMode === 'date') {
                      // Date selected, now show time picker
                      const newDate = new Date(selectedDate);
                      const existingDate = reminderDate || new Date();
                      newDate.setHours(existingDate.getHours());
                      newDate.setMinutes(existingDate.getMinutes());
                      setReminderDate(newDate);
                      setReminderDatePickerMode('time');
                      // Keep picker open for time selection
                    } else {
                      // Time selected, update and close
                      const newDate = new Date(reminderDate || new Date());
                      newDate.setHours(selectedDate.getHours());
                      newDate.setMinutes(selectedDate.getMinutes());
                      setReminderDate(newDate);
                      setShowReminderPicker(false);
                    }
                  } else if (event.type === 'dismissed') {
                    // Picker dismissed, close it
                    setShowReminderPicker(false);
                  }
                } else {
                  // iOS: Handle datetime mode
                  if (event.type === 'set' && selectedDate) {
                    setReminderDate(selectedDate);
                    setShowReminderPicker(false);
                  } else if (event.type === 'dismissed') {
                    setShowReminderPicker(false);
                  }
                }
              }}
            />
          )}
          {dueDate &&
            reminderDate &&
            reminderDate.getTime() > dueDate.getTime() && (
              <Text style={styles.warningText}>
                ⚠️ Warning: Reminder date is after the due date
              </Text>
            )}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Task</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  warningText: {
    fontSize: 14,
    color: '#ff6b6b',
    marginTop: 8,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
  },
});

