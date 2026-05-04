"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../src/context/AuthContext";
import { DevotionalService } from "../../../src/services/devotional.service";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";

const questions = [
  "VOCÊ VIU O AGIR DE DEUS NESSE CAPÍTULO?",
  "O QUE DEUS FALOU COM VOCÊ?",
  "O QUE EU QUERO DIZER PARA DEUS?",
  "QUAL É A MINHA AÇÃO PRÁTICA?",
  "HÁ ALGUM PECADO QUE EU PRECISO CONFESSAR AO SENHOR?",
  "QUAL MILAGRE O SENHOR FEZ POR VOCÊ HOJE?",
];

export default function QuestionsPage() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ title?: string; chapter?: string }>();
  const title = searchParams.title;
  const chapter = searchParams.chapter;
  const params = useLocalSearchParams<{ planId: string; bookId: string; chapterId: string }>();
  const planId = params.planId;
  const bookId = params.bookId;
  const chapterId = params.chapterId;

  const { user } = useAuth();
  const [answers, setAnswers] = useState<string[]>(Array(6).fill(""));
  const [isDone, setIsDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !chapterId) { setLoading(false); return; }
    DevotionalService.getUserDevotional(user.uid, chapterId).then(dev => {
      if (dev) {
        setAnswers([dev.answerOne, dev.answerTwo, dev.answerThree, dev.answerFour, dev.answerFive, dev.answerSix || ""]);
        setIsDone(dev.done);
      }
      setLoading(false);
    });
  }, [user, chapterId]);

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => { const u = [...prev]; u[index] = value; return u; });
  };

  const handleSave = async () => {
    if (!user || !chapterId) { Alert.alert("Erro", "Necessario login"); return; }
    const allFilled = answers.every(a => a.trim() !== "");
    if (!allFilled) { Alert.alert("Atenção", "Preencha todos os campos"); return; }
    setSaving(true);
    try {
      const existing = await DevotionalService.getUserDevotional(user.uid, chapterId);
      if (existing) {
        await DevotionalService.updateUserDevotional(existing.id, { userId: user.uid, bookId, answerOne: answers[0], answerTwo: answers[1], answerThree: answers[2], answerFour: answers[3], answerFive: answers[4], answerSix: answers[5], done: isDone });
      } else {
        await DevotionalService.saveUserDevotional({ userId: user.uid, chapterId, bookId, answerOne: answers[0], answerTwo: answers[1], answerThree: answers[2], answerFour: answers[3], answerFive: answers[4], answerSix: answers[5], done: isDone });
      }
      Alert.alert("Sucesso", "Meditação salva!");
      router.replace("/(tabs)");
    } catch (e) { Alert.alert("Erro", "Falha ao salvar"); }
    setSaving(false);
  };

  const handleSharePdf = async () => {
    try {
      const html = `<html><head><style>body{font-family:Arial;padding:20px}h1{font-size:18px}.q{font-size:12px;font-weight:bold;margin-top:15px}.a{font-size:11px;margin-bottom:15px;color:#555}</style></head><body><h1>${title} ${chapter}</h1>${questions.map((q,i)=>`<div class="q">${q}</div><div class="a">${answers[i]||'—'}</div>`).join('')}</body></html>`;
      const { uri } = await Print.printToHtmlAsync(html);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Minha Meditação" });
      }
    } catch (e) { Alert.alert("Erro", "Falha ao gerar PDF"); }
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#FFFFFF" /></View>;

  return (
    <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={100}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}><Text style={styles.backText}>{"< Capitulos"}</Text></Pressable>
      </View>
      <Text style={styles.title}>{title} {chapter}</Text>
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
        {questions.map((q, i) => (
          <View key={i} style={styles.question}>
            <Text style={styles.questionText}>{q}</Text>
            <TextInput 
              value={answers[i]} 
              onChangeText={(v) => handleAnswerChange(i, v)} 
              style={styles.input} 
              multiline 
              numberOfLines={4} 
              placeholder="Escreva..."
              placeholderTextColor="#9CA3AF"
              editable={!isDone} 
              textAlignVertical="top"
            />
          </View>
        ))}
        <View style={styles.checkContainer}>
          <Pressable onPress={() => setIsDone(!isDone)} style={styles.checkRow}>
            <View style={[styles.checkBox, isDone && styles.checkBoxChecked]}>
              {isDone && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>Terminei de responder</Text>
          </Pressable>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={handleSharePdf} style={styles.actionButton}><Text style={styles.actionText}>Compartilhar</Text></Pressable>
          <Pressable onPress={handleSave} disabled={saving} style={styles.actionButton}>
            {saving ? <ActivityIndicator size="small" color="#189E50" /> : <Text style={styles.actionText}>Salvar</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#189E50' },
  container: { flex: 1, backgroundColor: '#189E50' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  backButton: { padding: 8 },
  backText: { color: '#FFFFFF', fontSize: 14 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  question: { marginBottom: 16 },
  questionText: { fontSize: 14, color: '#FFFFFF', marginBottom: 6, textTransform: 'uppercase', fontWeight: '600' },
  input: { 
    width: '100%', 
    padding: 12, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 8, 
    color: '#273107', 
    minHeight: 100, 
    textAlignVertical: 'top',
    fontSize: 16,
    lineHeight: 22,
  },
  checkContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20 },
  checkRow: { flexDirection: 'row', alignItems: 'center' },
  checkBox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: '#FFFFFF', marginRight: 8, alignItems: 'center', justifyContent: 'center' },
  checkBoxChecked: { backgroundColor: '#FFFFFF' },
  checkMark: { color: '#273107', fontSize: 16, fontWeight: 'bold' },
  checkLabel: { color: '#FFFFFF', fontSize: 14 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 40 },
  actionButton: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#FFFFFF', borderRadius: 8, minWidth: 120, alignItems: 'center' },
  actionText: { color: '#273107', fontWeight: 'bold', fontSize: 14 },
});