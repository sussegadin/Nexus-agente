import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { colors, spacing, radius } from '../constants/theme';
import { callClaude, buildSystemPrompt, transcribeAudio } from '../utils/api';
import { t } from '../utils/i18n';

export default function ChatScreen({ appState, onUpdate }) {
  const { apiKeys, activeModel, userName, userGoal, lang, tasks, stats, chatHistory = [] } = appState;
  const [messages, setMessages] = useState(
    chatHistory.length > 0 ? chatHistory : [
      { id: '0', role: 'agent', text: `${t(lang, 'goodMorning')}, ${userName}! Como posso te ajudar hoje?` }
    ]
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    return () => { Speech.stop(); };
  }, []);

  const speak = (text) => {
    if (!voiceEnabled) return;
    Speech.stop();
    Speech.speak(text, {
      language: lang === 'pt-BR' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US',
      rate: 0.9,
    });
  };

  const send = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput('');
    Speech.stop();

    const userMsg = { id: Date.now().toString(), role: 'user', text: userText };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setLoading(true);
    setStatus(t(lang, 'thinking'));

    try {
      const history = newMsgs
        .filter(m => m.role !== 'agent' || m.id !== '0')
        .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
        .slice(-16);

      const system = buildSystemPrompt({ userName, userGoal, lang, tasks, stats });
      const reply = await callClaude({ apiKey: apiKeys.anthropic, model: activeModel, system, messages: history });

      const agentMsg = { id: (Date.now() + 1).toString(), role: 'agent', text: reply };
      const finalMsgs = [...newMsgs, agentMsg];
      setMessages(finalMsgs);
      speak(reply);

      await onUpdate({
        chatHistory: finalMsgs.slice(-20),
        stats: { ...stats, msgs: (stats?.msgs || 0) + 1 },
      });
    } catch (e) {
      const errMsg = { id: (Date.now() + 1).toString(), role: 'agent', text: t(lang, 'errorApi') + '\n' + e.message };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const startRecording = async () => {
    if (!apiKeys.openai) {
      Alert.alert('NEXUS', 'Configure a API key da OpenAI para usar voz.');
      return;
    }
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) { Alert.alert('NEXUS', t(lang, 'errorMic')); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(rec);
      setIsRecording(true);
      setStatus(t(lang, 'listening'));
    } catch (e) {
      Alert.alert('NEXUS', t(lang, 'errorMic'));
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    setStatus(t(lang, 'thinking'));
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    try {
      const text = await transcribeAudio({ apiKey: apiKeys.openai, audioUri: uri, lang });
      if (text) send(text);
      else setStatus('');
    } catch {
      setStatus('');
    }
  };

  const clearChat = () => {
    setMessages([{ id: '0', role: 'agent', text: `${t(lang, 'goodMorning')}, ${userName}! Como posso ajudar?` }]);
    onUpdate({ chatHistory: [] });
    Speech.stop();
  };

  const renderMsg = ({ item }) => (
    <View style={[styles.msgRow, item.role === 'user' ? styles.userRow : styles.agentRow]}>
      {item.role === 'agent' && <View style={styles.agentAvatar}><Text style={{ fontSize: 14 }}>🧠</Text></View>}
      <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.agentBubble]}>
        <Text style={[styles.bubbleText, item.role === 'user' && styles.userBubbleText]}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.agentAvatarLg}><Text style={{ fontSize: 20 }}>🧠</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.agentName}>NEXUS</Text>
          <Text style={styles.agentStatus}>{status || '● online'}</Text>
        </View>
        <TouchableOpacity onPress={() => setVoiceEnabled(v => !v)} style={styles.voiceToggle}>
          <Text style={{ fontSize: 18 }}>{voiceEnabled ? '🔊' : '🔇'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
          <Text style={styles.clearText}>{t(lang, 'clearChat')}</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={i => i.id}
        renderItem={renderMsg}
        contentContainerStyle={styles.msgList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Typing indicator */}
      {loading && (
        <View style={styles.typingRow}>
          <View style={styles.agentAvatar}><Text style={{ fontSize: 12 }}>🧠</Text></View>
          <View style={styles.agentBubble}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder={t(lang, 'typeMessage')}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={1000}
          onSubmitEditing={() => send()}
        />
        <TouchableOpacity
          style={[styles.micBtn, isRecording && styles.micActive]}
          onPress={isRecording ? stopRecording : startRecording}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 18 }}>{isRecording ? '⏹' : '🎤'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendDisabled]}
          onPress={() => send()}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.s, padding: spacing.m, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bg },
  agentAvatarLg: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accentDim, borderWidth: 1, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  agentAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.accentDim, borderWidth: 1, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  agentName: { fontSize: 15, fontWeight: '700', color: colors.text },
  agentStatus: { fontSize: 11, color: colors.green, fontFamily: 'monospace' },
  voiceToggle: { padding: spacing.s },
  clearBtn: { padding: spacing.s },
  clearText: { fontSize: 12, color: colors.textMuted },

  msgList: { padding: spacing.m, gap: spacing.s, paddingBottom: 16 },
  msgRow: { flexDirection: 'row', gap: spacing.s, marginBottom: 8 },
  agentRow: { alignItems: 'flex-start' },
  userRow: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', borderRadius: 18, padding: 12 },
  agentBubble: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: colors.accent, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  userBubbleText: { color: '#fff' },

  typingRow: { flexDirection: 'row', gap: spacing.s, padding: spacing.m, paddingTop: 0 },

  inputArea: { flexDirection: 'row', gap: spacing.s, padding: spacing.m, paddingBottom: Platform.OS === 'ios' ? 30 : spacing.m, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'flex-end' },
  textInput: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.l, paddingHorizontal: spacing.m, paddingVertical: 10, color: colors.text, fontSize: 14, maxHeight: 100, lineHeight: 20 },
  micBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  micActive: { borderColor: colors.red, backgroundColor: 'rgba(224,92,92,0.15)' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.4 },
  sendIcon: { fontSize: 16, color: '#fff', marginLeft: 2 },
});
