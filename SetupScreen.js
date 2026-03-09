import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { colors, spacing, radius } from '../constants/theme';
import { Storage } from '../utils/storage';
import { t } from '../utils/i18n';

const LANGS = [
  { code: 'pt-BR', label: '🇧🇷 Português' },
  { code: 'es',    label: '🇪🇸 Español' },
  { code: 'en',    label: '🇺🇸 English' },
];

export default function SetupScreen({ onDone }) {
  const [lang, setLang] = useState('pt-BR');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [runwayKey, setRunwayKey] = useState('');
  const [klingKey, setKlingKey] = useState('');
  const [userName, setUserName] = useState('');
  const [userGoal, setUserGoal] = useState('');
  const [loading, setLoading] = useState(false);

  const activate = async () => {
    if (!anthropicKey.trim()) {
      Alert.alert('NEXUS', t(lang, 'required'));
      return;
    }
    setLoading(true);
    await Storage.update({
      configured: true,
      apiKeys: { anthropic: anthropicKey.trim(), openai: openaiKey.trim(), runway: runwayKey.trim(), kling: klingKey.trim() },
      userName: userName.trim() || 'Gilmar',
      userGoal: userGoal.trim() || 'Ser mais produtivo',
      lang,
    });
    setLoading(false);
    onDone();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Orb */}
        <View style={styles.orb}>
          <Text style={styles.orbEmoji}>🧠</Text>
        </View>
        <Text style={styles.title}>{t(lang, 'setupTitle')}</Text>
        <Text style={styles.sub}>{t(lang, 'setupSub')}</Text>

        {/* Language */}
        <Text style={styles.label}>{t(lang, 'language')}</Text>
        <View style={styles.langRow}>
          {LANGS.map(l => (
            <TouchableOpacity
              key={l.code}
              style={[styles.langBtn, lang === l.code && styles.langActive]}
              onPress={() => setLang(l.code)}
            >
              <Text style={[styles.langText, lang === l.code && styles.langTextActive]}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Name */}
        <Text style={styles.label}>{t(lang, 'yourName')}</Text>
        <TextInput style={styles.input} value={userName} onChangeText={setUserName}
          placeholder={t(lang, 'namePlaceholder')} placeholderTextColor={colors.textMuted}
          autoCorrect={false} />

        {/* Goal */}
        <Text style={styles.label}>{t(lang, 'yourGoal')}</Text>
        <TextInput style={styles.input} value={userGoal} onChangeText={setUserGoal}
          placeholder={t(lang, 'goalPlaceholder')} placeholderTextColor={colors.textMuted} />

        {/* API Keys */}
        <Text style={[styles.label, { marginTop: spacing.l }]}>{t(lang, 'anthropicKey')} *</Text>
        <TextInput style={styles.input} value={anthropicKey} onChangeText={setAnthropicKey}
          placeholder={t(lang, 'anthropicPlaceholder')} placeholderTextColor={colors.textMuted}
          secureTextEntry autoCorrect={false} autoCapitalize="none" />

        <Text style={styles.label}>{t(lang, 'openaiKey')}</Text>
        <TextInput style={styles.input} value={openaiKey} onChangeText={setOpenaiKey}
          placeholder={t(lang, 'openaiPlaceholder')} placeholderTextColor={colors.textMuted}
          secureTextEntry autoCorrect={false} autoCapitalize="none" />

        <Text style={styles.label}>{t(lang, 'runwayKey')}</Text>
        <TextInput style={styles.input} value={runwayKey} onChangeText={setRunwayKey}
          placeholder={t(lang, 'runwayPlaceholder')} placeholderTextColor={colors.textMuted}
          secureTextEntry autoCorrect={false} autoCapitalize="none" />

        <Text style={styles.label}>{t(lang, 'klingKey')}</Text>
        <TextInput style={styles.input} value={klingKey} onChangeText={setKlingKey}
          placeholder={t(lang, 'klingPlaceholder')} placeholderTextColor={colors.textMuted}
          secureTextEntry autoCorrect={false} autoCapitalize="none" />

        <TouchableOpacity style={styles.btn} onPress={activate} disabled={loading} activeOpacity={0.8}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>{t(lang, 'activate')}</Text>}
        </TouchableOpacity>

        <Text style={styles.footer}>{t(lang, 'keysLocal')}</Text>
        <Text style={[styles.footer, { color: colors.textDim, marginTop: 4 }]}>NEXUS v1.0 · Open Source · @sussegadin</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.l, paddingTop: 60, paddingBottom: 60 },
  orb: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.accentDim, borderWidth: 1, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: spacing.m },
  orbEmoji: { fontSize: 38 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.l },
  label: { fontSize: 11, color: colors.accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, marginTop: spacing.m },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.m, padding: spacing.m, color: colors.text, fontSize: 14, fontFamily: 'monospace' },
  langRow: { flexDirection: 'row', gap: 8 },
  langBtn: { flex: 1, paddingVertical: 10, borderRadius: radius.m, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.surface },
  langActive: { borderColor: colors.accent, backgroundColor: colors.accentDim },
  langText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  langTextActive: { color: colors.accent },
  btn: { backgroundColor: colors.accent, borderRadius: radius.m, padding: spacing.m, alignItems: 'center', marginTop: spacing.l },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 11, color: colors.textMuted, marginTop: spacing.m, lineHeight: 16 },
});
