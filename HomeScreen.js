import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius } from '../constants/theme';
import { t } from '../utils/i18n';

const greetingKey = () => {
  const h = new Date().getHours();
  if (h < 12) return 'goodMorning';
  if (h < 18) return 'goodAfternoon';
  return 'goodEvening';
};

export default function HomeScreen({ appState, onUpdate, navigation }) {
  const { userName, userGoal, lang, tasks, stats, activityFeed } = appState;
  const allTasks = [...(tasks?.manha || []), ...(tasks?.tarde || []), ...(tasks?.noite || [])];
  const doneTasks = allTasks.filter(t => t.done).length;

  const CARDS = [
    { icon: '💬', titleKey: 'talkToNexus', subKey: 'alwaysAvailable', screen: 'Chat', color: colors.accent },
    { icon: '📱', titleKey: 'socialMedia',  subKey: 'contentStrategy',  screen: 'Social', color: colors.blue },
    { icon: '✅', titleKey: 'dailyRoutine', subKey: 'tasksHabits',      screen: 'Routine', color: colors.green },
    { icon: '⚙️', titleKey: 'settingsTitle', subKey: 'switchAnytime',   screen: 'Settings', color: colors.purple },
  ];

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t(lang, greetingKey())},</Text>
          <Text style={styles.name}>{userName} 👋</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(userName||'N').charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      {/* Goal chip */}
      <View style={styles.goalChip}>
        <Text style={styles.goalLabel}>🎯</Text>
        <Text style={styles.goalText} numberOfLines={1}>{userGoal}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { val: allTasks.length, label: t(lang, 'tasksToday') },
          { val: doneTasks,       label: t(lang, 'done') },
          { val: stats?.streak || 1, label: t(lang, 'days') },
        ].map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statVal}>{s.val}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick access */}
      <Text style={styles.sectionTitle}>{t(lang, 'quickAccess')}</Text>
      <View style={styles.cardsGrid}>
        {CARDS.map(card => (
          <TouchableOpacity
            key={card.screen}
            style={styles.card}
            onPress={() => navigation.navigate(card.screen)}
            activeOpacity={0.75}
          >
            <Text style={styles.cardIcon}>{card.icon}</Text>
            <Text style={styles.cardTitle}>{t(lang, card.titleKey)}</Text>
            <Text style={styles.cardSub}>{t(lang, card.subKey)}</Text>
            <View style={[styles.cardBar, { backgroundColor: card.color }]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Activity */}
      <Text style={styles.sectionTitle}>{t(lang, 'recentActivity')}</Text>
      <View style={styles.feedCard}>
        {(activityFeed?.length ? activityFeed.slice(0, 6) : [{ text: t(lang, 'nexusActivated'), time: 'agora' }]).map((item, i) => (
          <View key={i} style={[styles.feedItem, i > 0 && styles.feedBorder]}>
            <View style={styles.feedDot} />
            <Text style={styles.feedText} numberOfLines={1}>{item.text}</Text>
            <Text style={styles.feedTime}>{item.time}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>NEXUS v1.0 · Open Source · @sussegadin</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.l, paddingTop: 60 },
  greeting: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accentDim, borderWidth: 1.5, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.accent },

  goalChip: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: spacing.l, marginBottom: spacing.m, backgroundColor: colors.surface, borderRadius: radius.full, paddingHorizontal: spacing.m, paddingVertical: 8, borderWidth: 1, borderColor: colors.border },
  goalLabel: { fontSize: 13 },
  goalText: { flex: 1, fontSize: 13, color: colors.textMuted },

  statsRow: { flexDirection: 'row', gap: spacing.s, marginHorizontal: spacing.l, marginBottom: spacing.l },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.m, padding: spacing.m, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statVal: { fontSize: 26, fontWeight: '800', color: colors.accent },
  statLabel: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },

  sectionTitle: { fontSize: 11, color: colors.textMuted, letterSpacing: 2.5, textTransform: 'uppercase', marginHorizontal: spacing.l, marginBottom: spacing.s },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s, marginHorizontal: spacing.l, marginBottom: spacing.l },
  card: { width: '48%', backgroundColor: colors.surface, borderRadius: radius.l, padding: spacing.m, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', position: 'relative' },
  cardIcon: { fontSize: 24, marginBottom: 8 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 3 },
  cardSub: { fontSize: 11, color: colors.textMuted },
  cardBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, opacity: 0.7 },

  feedCard: { marginHorizontal: spacing.l, backgroundColor: colors.surface, borderRadius: radius.l, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.l, overflow: 'hidden' },
  feedItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.m },
  feedBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  feedDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent },
  feedText: { flex: 1, fontSize: 13, color: colors.text },
  feedTime: { fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' },

  footer: { textAlign: 'center', fontSize: 10, color: colors.textDim, marginBottom: 24, marginTop: 4 },
});
