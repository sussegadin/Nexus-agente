import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Modal, ActivityIndicator, Alert, Vibration,
} from 'react-native';
import { colors, spacing, radius } from '../constants/theme';
import { generateRoutine } from '../utils/api';
import { t } from '../utils/i18n';

const PERIODS = ['manha', 'tarde', 'noite'];
const PERIOD_ICONS = { manha: '🌅', tarde: '☀️', noite: '🌙' };
const PERIOD_KEYS = { manha: 'morning', tarde: 'afternoon', noite: 'evening' };

export default function RoutineScreen({ appState, onUpdate }) {
  const { apiKeys, activeModel, userGoal, lang, tasks = {}, stats } = appState;
  const [allTasks, setAllTasks] = useState({
    manha: tasks.manha || [],
    tarde: tasks.tarde || [],
    noite: tasks.noite || [],
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState('manha');
  const [taskName, setTaskName] = useState('');
  const [taskTime, setTaskTime] = useState('08:00');
  const [generating, setGenerating] = useState(false);

  const all = [...allTasks.manha, ...allTasks.tarde, ...allTasks.noite];
  const done = all.filter(t => t.done).length;
  const pct = all.length > 0 ? Math.round((done / all.length) * 100) : 0;

  const toggle = async (period, id) => {
    Vibration.vibrate(40);
    const updated = {
      ...allTasks,
      [period]: allTasks[period].map(t =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    };
    setAllTasks(updated);
    const wasDone = !allTasks[period].find(t => t.id === id)?.done;
    await onUpdate({
      tasks: updated,
      stats: { ...stats, tasksDone: (stats?.tasksDone || 0) + (wasDone ? 1 : -1) },
    });
  };

  const addTask = async () => {
    if (!taskName.trim()) return;
    const task = { id: Date.now().toString(), title: taskName.trim(), time: taskTime, done: false };
    const updated = { ...allTasks, [currentPeriod]: [...allTasks[currentPeriod], task] };
    setAllTasks(updated);
    await onUpdate({ tasks: updated });
    setTaskName('');
    setTaskTime('08:00');
    setModalOpen(false);
  };

  const deleteTask = async (period, id) => {
    const updated = { ...allTasks, [period]: allTasks[period].filter(t => t.id !== id) };
    setAllTasks(updated);
    await onUpdate({ tasks: updated });
  };

  const genRoutine = async () => {
    if (!apiKeys.anthropic) { Alert.alert('NEXUS', 'Configure a API key Anthropic.'); return; }
    setGenerating(true);
    try {
      const routine = await generateRoutine({ apiKey: apiKeys.anthropic, model: activeModel, userGoal, lang });
      const updated = {
        manha: (routine.manha || []).map((t, i) => ({ id: 'gen' + Date.now() + i, title: t.title, time: t.time || '08:00', done: false })),
        tarde: (routine.tarde || []).map((t, i) => ({ id: 'gen2' + Date.now() + i, title: t.title, time: t.time || '13:00', done: false })),
        noite: (routine.noite || []).map((t, i) => ({ id: 'gen3' + Date.now() + i, title: t.title, time: t.time || '19:00', done: false })),
      };
      setAllTasks(updated);
      await onUpdate({ tasks: updated });
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
    setGenerating(false);
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{t(lang, 'dailyRoutine')}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBlock}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>{t(lang, 'dailyProgress')}</Text>
          <Text style={styles.progressPct}>{pct}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.progressSub}>{done} / {all.length} tarefas</Text>
      </View>

      {/* Periods */}
      {PERIODS.map(period => (
        <View key={period} style={styles.periodBlock}>
          <View style={styles.periodHeader}>
            <Text style={styles.periodIcon}>{PERIOD_ICONS[period]}</Text>
            <Text style={styles.periodTitle}>{t(lang, PERIOD_KEYS[period])}</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => { setCurrentPeriod(period); setModalOpen(true); }}
            >
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {allTasks[period].length === 0 ? (
            <Text style={styles.emptyText}>{t(lang, 'noTasks')}</Text>
          ) : (
            allTasks[period].map(task => (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskItem, task.done && styles.taskDone]}
                onPress={() => toggle(period, task.id)}
                onLongPress={() => Alert.alert('Deletar', task.title, [
                  { text: t(lang, 'no') },
                  { text: t(lang, 'yes'), onPress: () => deleteTask(period, task.id) },
                ])}
                activeOpacity={0.7}
              >
                <View style={[styles.check, task.done && styles.checkDone]}>
                  {task.done && <Text style={{ fontSize: 10, color: colors.bg }}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>{task.title}</Text>
                  {task.time && <Text style={styles.taskTime}>{task.time}</Text>}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      ))}

      {/* Generate */}
      <TouchableOpacity style={styles.genBtn} onPress={genRoutine} disabled={generating} activeOpacity={0.8}>
        {generating
          ? <><ActivityIndicator size="small" color={colors.accent} /><Text style={styles.genText}> {t(lang, 'generating')}</Text></>
          : <Text style={styles.genText}>✦ {t(lang, 'generateRoutine')}</Text>}
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* Add Task Modal */}
      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setModalOpen(false)}>
          <View style={styles.modal}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>{t(lang, 'addTask')}</Text>
            <Text style={styles.fieldLabel}>{t(lang, 'taskName')}</Text>
            <TextInput
              style={styles.inp}
              value={taskName}
              onChangeText={setTaskName}
              placeholder={t(lang, 'taskPlaceholder')}
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <Text style={styles.fieldLabel}>{t(lang, 'taskTime')}</Text>
            <TextInput
              style={styles.inp}
              value={taskTime}
              onChangeText={setTaskTime}
              placeholder="08:00"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalOpen(false)}>
                <Text style={styles.cancelText}>{t(lang, 'cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={addTask}>
                <Text style={styles.confirmText}>{t(lang, 'add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.l, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },

  progressBlock: { marginHorizontal: spacing.l, marginBottom: spacing.l, backgroundColor: colors.surface, borderRadius: radius.l, padding: spacing.m, borderWidth: 1, borderColor: colors.border },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.s },
  progressLabel: { fontSize: 13, color: colors.textMuted },
  progressPct: { fontSize: 13, color: colors.accent, fontWeight: '700' },
  track: { backgroundColor: colors.surface2, borderRadius: 4, height: 8, overflow: 'hidden', marginBottom: 6 },
  fill: { height: '100%', backgroundColor: colors.accent, borderRadius: 4 },
  progressSub: { fontSize: 11, color: colors.textDim },

  periodBlock: { marginHorizontal: spacing.l, marginBottom: spacing.l },
  periodHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.s },
  periodIcon: { fontSize: 18 },
  periodTitle: { flex: 1, fontSize: 13, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 2, fontWeight: '600' },
  addBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: colors.bg, fontSize: 20, fontWeight: '700', lineHeight: 22 },
  emptyText: { fontSize: 13, color: colors.textDim, fontFamily: 'monospace', padding: spacing.s },

  taskItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.s, backgroundColor: colors.surface, borderRadius: radius.m, padding: spacing.m, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  taskDone: { opacity: 0.5 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: colors.green, borderColor: colors.green },
  taskTitle: { fontSize: 14, color: colors.text, fontWeight: '500' },
  taskTitleDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  taskTime: { fontSize: 11, color: colors.textMuted, fontFamily: 'monospace', marginTop: 2 },

  genBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: spacing.l, padding: spacing.m, borderRadius: radius.m, borderWidth: 1, borderColor: colors.accent, borderStyle: 'dashed' },
  genText: { fontSize: 14, color: colors.accent, fontWeight: '600' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.l, paddingBottom: 40 },
  handle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.m },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.m },
  fieldLabel: { fontSize: 11, color: colors.accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, marginTop: spacing.s },
  inp: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.m, padding: spacing.m, color: colors.text, fontSize: 14 },
  modalBtns: { flexDirection: 'row', gap: spacing.s, marginTop: spacing.l },
  cancelBtn: { flex: 1, padding: spacing.m, borderRadius: radius.m, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelText: { color: colors.textMuted, fontWeight: '600' },
  confirmBtn: { flex: 1, padding: spacing.m, borderRadius: radius.m, backgroundColor: colors.accent, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '700' },
});
