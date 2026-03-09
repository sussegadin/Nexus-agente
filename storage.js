import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  STATE: 'nexus_state_v1',
};

const DEFAULT_STATE = {
  // Auth / Setup
  configured: false,
  apiKeys: {
    anthropic: '',
    openai: '',
    runway: '',
    kling: '',
  },
  userName: '',
  userGoal: '',
  lang: 'pt-BR',
  activeModel: 'claude-sonnet-4-20250514',

  // Tasks
  tasks: { manha: [], tarde: [], noite: [] },

  // Chat
  chatHistory: [],

  // Social
  socialIdeas: [],

  // Stats / Evolution
  stats: {
    msgs: 0,
    tasksDone: 0,
    posts: 0,
    streak: 1,
    lastActiveDate: null,
  },

  // Activity feed
  activityFeed: [],
};

export const Storage = {
  async get() {
    try {
      const raw = await AsyncStorage.getItem(KEYS.STATE);
      if (!raw) return { ...DEFAULT_STATE };
      return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_STATE };
    }
  },

  async set(data) {
    try {
      await AsyncStorage.setItem(KEYS.STATE, JSON.stringify(data));
    } catch {}
  },

  async update(partial) {
    const current = await Storage.get();
    const next = { ...current, ...partial };
    await Storage.set(next);
    return next;
  },

  async reset() {
    try {
      await AsyncStorage.removeItem(KEYS.STATE);
    } catch {}
  },
};
