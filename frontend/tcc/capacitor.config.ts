import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'CuritibAtiva',
  webDir: 'www',
  server: {
    androidScheme: 'http'
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#1DA1F2',
      style: 'DEFAULT',
    },
    LocalNotifications: {
      smallIcon: 'ic_notification',
      iconColor: '#488AFF',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert', 'banner', 'list'],
    },
  },
};

export default config;
