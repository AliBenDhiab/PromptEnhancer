import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gemini.optimizer.summarizer',
  appName: 'محسن الأوامر وملخص PDF الذكي',
  webDir: 'www', // Important: Your build tool must output to this directory.
  server: {
    androidScheme: 'https'
  }
};

export default config;
