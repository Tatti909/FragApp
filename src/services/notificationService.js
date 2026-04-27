import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// const WISHLIST_REMINDER_SECONDS = 10;
const WISHLIS_REMINDER_SECONDS = 60 * 60 * 24;
const WISHLIST_CHANNEL_ID = 'wishlist-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function scheduleWishlistReminder(fragrance) {
  try {
    const { granted } = await Notifications.requestPermissionsAsync();

    if (!granted) {
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(WISHLIST_CHANNEL_ID, {
        name: 'Wishlist reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Remember to try ${fragrance.name}`,
        body: `You saved ${fragrance.name} by ${fragrance.brand} to your wishlist.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: WISHLIST_REMINDER_SECONDS,
        channelId: WISHLIST_CHANNEL_ID,
      },
    });
  } catch {
  }
}
