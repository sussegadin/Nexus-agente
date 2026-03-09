import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, Switch,
} from 'react-native';
import { colors, spacing, radius } from '../constants/theme';
import { AI_MODELS, VIDEO_MODELS } from '../utils/api';
import { Storage } from '../utils/storage';
import { t } from '../utils/i18n';

const LANGS = [
  { code: 'pt-BR', label: '🇧🇷 Português BR' },
  { code: 'es',    label: '🇪🇸 Español' },
  { code: 'en',    label: '🇺🇸 English' },
];

export default function SettingsScreen({ appState, onUpdate, onReset }) {
  const s = appState;
  const [anthropic, setAnthropic] = useState(s.apiKeys?.anthropic || '');
  const [openai, setOpenai] = useState(s.apiKeys?.openai || '');
  const [runway, setRunway] = useState(s.apiKeys?.runway || '');
  const [kling, setKling] = useState(s.apiKeys?.kling || '');
  const [name, setName] = useState(s.userName || '');
  const [goal, setGoal] = useState(s.userGoal || '');
  const [lang, setLang] = useState(s.lang || 'pt-BR');
  const [model, setModel] = useState(s.activeModel || AI_MODELS[0].id);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await onUpdate({
      apiKeys: { anthropic: anthropic.trim(), openai: openai.trim(), runway: runway.trim(), kling: kling.trim() },
      userName: name.trim(),
      userGoal: goal.trim(),
      lang,
      activeModel: model,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => {
    Alert.alert('NEXUS', t(lang, 'resetConfirm'), [
      { text: t(lang, 'no') },
      { text: t(lang, 'yes'), style: 'destructive', onPress: async () => {
        await Storage.reset();
        onReset();
      }},
    ]);
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{t(lang, 'settingsTitle')}</Text>
      </View>

      {/* Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t(lang, 'profile')}</Text>
        <TextInput style={styles.inp} value={name} onChangeText={setName}
          placeholder={t(lang, 'namePlaceholder')} placeholderTextColor={colors.textMuted} />
        <TextInput style={[styles.inp, { marginTop: spacing.s }]} value={goal} onChangeText={setGoal}
          placeholder={t(lang, 'goalPlaceholder')} placeholderTextColor={colors.textMuted} />
      </View>

      {/* Language */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t(lang, 'language')}</Text>
        {LANGS.map(l => (
          <TouchableOpacity
            key={l.code}
            style={[styles.optionRow, lang === l.code && styles.optionActive]}
            onPress={() => setLang(l.code)}
          >
            <Text style={styles.optionText}>{l.label}</Text>
            {lang === l.code && <Text style={{ color: colors.accent, fontSize: 16 }}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* AI Model */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t(lang, 'currentModel')}</Text>
        {AI_MODELS.map(m => (
          <TouchableOpacity
            key={m.id}
            style={[styles.optionRow, model === m.id && styles.optionActive]}
            onPress={() => setModel(m.id)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.optionText}>{m.label}</Text>
              <Text style={styles.optionSub}>{m.provider}</Text>
            </View>
            {model === m.id && <Text style={{ color: colors.accent, fontSize: 16 }}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Video AI */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Modelos de Vídeo IA</Text>
        {VIDEO_MODELS.map(m => (
          <View key={m.id} style={styles.optionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionText}>{m.label}</Text>
              <Text style={styles.optionSub}>{m.provider}</Text>
            </View>
            <View style={styles.badge}><Text style={styles.badgeText}>Em breve</Text></View>
          </View>
        ))}
      </View>

      {/* API Keys */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t(lang, 'apiKeys')}</Text>

        {[
          { label: 'Anthropic (Claude) *', val: anthropic, set: setAnthropic, ph: 'sk-ant-...' },
          { label: 'OpenAI (Whisper / Voz)', val: openai, set: setOpenai, ph: 'sk-...' },
          { label: 'Runway (Vídeo IA)', val: runway, set: setRunway, ph: 'rw-...' },
          { label: 'Kling AI (Vídeo IA)', val: kling, set: setKling, ph: 'kling-...' },
        ].map(field => (
          <View key={field.label} style={{ marginBottom: spacing.s }}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <TextInput
              style={styles.inp}
              value={field.val}
              onChangeText={field.set}
              placeholder={field.ph}
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        ))}
      </View>

      {/* Save */}
      <TouchableOpacity style={styles.saveBtn} onPress={save} activeOpacity={0.8}>
        <Text style={styles.saveBtnText}>{saved ? t(lang, 'saved') : t(lang, 'save')}</Text>
      </TouchableOpacity>

      {/* Danger zone */}
      <View style={[styles.section, { borderColor: colors.red + '44' }]}>
        <Text style={[styles.sectionTitle, { color: colors.red }]}>{t(lang, 'dangerZone')}</Text>
        <TouchableOpacity style={styles.resetBtn} onPress={reset}>
          <Text style={styles.resetText}>{t(lang, 'resetApp')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>{t(lang, 'version')}</Text>
      <Text style={[styles.footer, { color: colors.textDim, marginTop: 4, marginBottom: 32 }]}>{t(lang, 'credits')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.l, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },

  section: { marginHorizontal: spacing.l, marginBottom: spacing.l, backgroundColor: colors.surface, borderRadius: radius.l, borderWidth: 1, borderColor: colors.border, padding: spacing.m },
  sectionTitle: { fontSize: 11, color: colors.accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: spacing.m, fontWeight: '700' },

  inp: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.m, padding: spacing.m, color: colors.text, fontSize: 14, fontFamily: 'monospace' },
  fieldLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 6, letterSpacing: 1 },

  optionRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.m, borderRadius: radius.m, marginBottom: 4, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
  optionActive: { borderColor: colors.accent, backgroundColor: colors.accentDim },
  optionText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  optionSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  badge: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, color: colors.textMuted },

  saveBtn: { marginHorizontal: spacing.l, backgroundColor: colors.accent, borderRadius: radius.m, padding: spacing.m, alignItems: 'center', marginBottom: spacing.l },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  resetBtn: { padding: spacing.m, borderRadius: radius.m, borderWidth: 1, borderColor: colors.red + '66', alignItems: 'center' },
  resetText: { color: colors.red, fontWeight: '600' },

  footer: { textAlign: 'center', fontSize: 11, color: colors.textMuted },
});
