import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Clipboard, Alert,
} from 'react-native';
import { colors, spacing, radius } from '../constants/theme';
import { generateSocialIdeas, refineIdea } from '../utils/api';
import { t } from '../utils/i18n';

const PLATFORMS = ['all', 'Instagram', 'TikTok', 'YouTube', 'X/Twitter'];
const PLATFORM_ICONS = { Instagram: '📸', TikTok: '🎵', YouTube: '▶️', 'X/Twitter': '✖️', all: '✦' };
const PLATFORM_COLORS = { Instagram: '#E1306C', TikTok: '#FF0050', YouTube: '#FF0000', 'X/Twitter': '#1DA1F2' };

export default function SocialScreen({ appState, onUpdate }) {
  const { apiKeys, activeModel, userGoal, lang, socialIdeas = [], stats } = appState;
  const [filter, setFilter] = useState('all');
  const [ideas, setIdeas] = useState(socialIdeas.length > 0 ? socialIdeas : [
    { id: '1', platform: 'Instagram', tag: 'Bastidores', text: 'Mostre seu processo criativo e ambiente de trabalho — autenticidade gera conexão.' },
    { id: '2', platform: 'TikTok', tag: 'Vídeo Rápido', text: 'Tutorial de 30s: a dica que mudou sua rotina. Começa direto no ponto.' },
    { id: '3', platform: 'YouTube', tag: 'Vlog', text: 'Um dia na minha vida — mostre o real, não o perfeito.' },
    { id: '4', platform: 'X/Twitter', tag: 'Thread', text: '5 coisas que aprendi em 30 dias tentando [seu objetivo]. Thread 🧵' },
  ]);
  const [generating, setGenerating] = useState(false);
  const [refiningId, setRefiningId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const filtered = filter === 'all' ? ideas : ideas.filter(i => i.platform === filter);

  const generate = async () => {
    if (!apiKeys.anthropic) { Alert.alert('NEXUS', 'Configure a API key Anthropic.'); return; }
    setGenerating(true);
    try {
      const newIdeas = await generateSocialIdeas({ apiKey: apiKeys.anthropic, model: activeModel, userGoal, lang });
      const withIds = newIdeas.map((i, idx) => ({ ...i, id: Date.now().toString() + idx }));
      const merged = [...withIds, ...ideas].slice(0, 20);
      setIdeas(merged);
      await onUpdate({
        socialIdeas: merged,
        stats: { ...stats, posts: (stats?.posts || 0) + newIdeas.length },
      });
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
    setGenerating(false);
  };

  const refine = async (idea) => {
    if (!apiKeys.anthropic) return;
    setRefiningId(idea.id);
    try {
      const refined = await refineIdea({ apiKey: apiKeys.anthropic, model: activeModel, idea: idea.text, lang });
      const updated = ideas.map(i => i.id === idea.id ? { ...i, text: refined } : i);
      setIdeas(updated);
      await onUpdate({ socialIdeas: updated });
    } catch {}
    setRefiningId(null);
  };

  const copy = (idea) => {
    Clipboard.setString(idea.text);
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{t(lang, 'contentIdeas')}</Text>
      </View>

      {/* Filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
        {PLATFORMS.map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.pill, filter === p && styles.pillActive]}
            onPress={() => setFilter(p)}
          >
            <Text style={[styles.pillText, filter === p && styles.pillTextActive]}>
              {PLATFORM_ICONS[p]} {p === 'all' ? t(lang, 'allPlatforms') : p}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Ideas */}
      <View style={styles.list}>
        {filtered.map(idea => (
          <View key={idea.id} style={styles.ideaCard}>
            <View style={styles.ideaHeader}>
              <Text style={styles.ideaIcon}>{PLATFORM_ICONS[idea.platform] || '💡'}</Text>
              <View style={[styles.ideaBadge, { backgroundColor: (PLATFORM_COLORS[idea.platform] || colors.accent) + '22' }]}>
                <Text style={[styles.ideaBadgeText, { color: PLATFORM_COLORS[idea.platform] || colors.accent }]}>{idea.platform}</Text>
              </View>
              <View style={styles.ideaTagBadge}>
                <Text style={styles.ideaTagText}>{idea.tag}</Text>
              </View>
            </View>
            <Text style={styles.ideaText}>{idea.text}</Text>
            <View style={styles.ideaActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => copy(idea)}>
                <Text style={styles.actionText}>{copiedId === idea.id ? t(lang, 'copied') : `📋 ${t(lang, 'copy')}`}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnAccent]} onPress={() => refine(idea)} disabled={!!refiningId}>
                {refiningId === idea.id
                  ? <ActivityIndicator size="small" color={colors.accent} />
                  : <Text style={[styles.actionText, { color: colors.accent }]}>{`✨ ${t(lang, 'refineAI')}`}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Generate button */}
      <TouchableOpacity style={styles.genBtn} onPress={generate} disabled={generating} activeOpacity={0.8}>
        {generating
          ? <><ActivityIndicator size="small" color={colors.accent} /><Text style={styles.genText}> {t(lang, 'generating')}</Text></>
          : <Text style={styles.genText}>✦ {t(lang, 'generateIdeas')}</Text>}
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.l, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  pillsRow: { paddingHorizontal: spacing.l, gap: 8, paddingBottom: spacing.m },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  pillActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  pillText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  pillTextActive: { color: colors.accent },
  list: { paddingHorizontal: spacing.l, gap: spacing.s },
  ideaCard: { backgroundColor: colors.surface, borderRadius: radius.l, padding: spacing.m, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.s },
  ideaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.s },
  ideaIcon: { fontSize: 18 },
  ideaBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  ideaBadgeText: { fontSize: 11, fontWeight: '700' },
  ideaTagBadge: { backgroundColor: colors.surface2, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  ideaTagText: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  ideaText: { fontSize: 14, color: colors.text, lineHeight: 21, marginBottom: spacing.m },
  ideaActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 9, borderRadius: radius.m, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.surface2 },
  actionBtnAccent: { borderColor: colors.accentDim, backgroundColor: colors.accentDim },
  actionText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  genBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: spacing.l, marginTop: spacing.m, padding: spacing.m, borderRadius: radius.m, borderWidth: 1, borderColor: colors.accent, borderStyle: 'dashed' },
  genText: { fontSize: 14, color: colors.accent, fontWeight: '600' },
});
