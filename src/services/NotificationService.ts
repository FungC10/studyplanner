import PushNotification from 'react-native-push-notification';
import {Task} from '../types/Task';

class NotificationService {
  private notificationIdCounter = 1000;

  constructor() {
    this.configure();
  }

  private configure() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    PushNotification.createChannel(
      {
        channelId: 'study-planner-reminders',
        channelName: 'Study Planner Reminders',
        channelDescription: 'Notifications for study tasks and assessments',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`),
    );
  }

  scheduleTaskReminder(task: Task) {
    if (!task.reminderDate || task.isCompleted) {
      return;
    }

    const reminderTime = new Date(task.reminderDate).getTime();
    const now = Date.now();

    if (reminderTime <= now) {
      return;
    }

    const notificationId = this.notificationIdCounter++;
    const title = task.isAssessment ? '📝 Assessment Reminder' : '📚 Task Reminder';
    const message = task.isAssessment
      ? `Assessment "${task.title}" is coming up!`
      : `Don't forget: ${task.title}`;

    PushNotification.localNotificationSchedule({
      id: notificationId.toString(),
      channelId: 'study-planner-reminders',
      title: title,
      message: message,
      date: new Date(reminderTime),
      allowWhileIdle: true,
      repeatType: undefined,
      userInfo: {
        taskId: task.id,
      },
    });

    return notificationId;
  }

  scheduleDueDateReminder(task: Task) {
    if (!task.dueDate || task.isCompleted) {
      return;
    }

    const dueTime = new Date(task.dueDate).getTime();
    const now = Date.now();

    if (dueTime <= now) {
      return;
    }

    const reminderTime = dueTime - 24 * 60 * 60 * 1000;
    if (reminderTime <= now) {
      return;
    }

    const notificationId = this.notificationIdCounter++;
    const title = task.isAssessment ? '⚠️ Assessment Due Soon' : '⏰ Task Due Soon';
    const message = task.isAssessment
      ? `Assessment "${task.title}" is due tomorrow!`
      : `Task "${task.title}" is due tomorrow`;

    PushNotification.localNotificationSchedule({
      id: notificationId.toString(),
      channelId: 'study-planner-reminders',
      title: title,
      message: message,
      date: new Date(reminderTime),
      allowWhileIdle: true,
      userInfo: {
        taskId: task.id,
      },
    });

    return notificationId;
  }

  cancelNotification(notificationId: string) {
    PushNotification.cancelLocalNotifications({id: notificationId});
  }

  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }
}

export const notificationService = new NotificationService();

