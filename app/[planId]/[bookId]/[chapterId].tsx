"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../src/context/AuthContext";
import { DevotionalService } from "../../../src/services/devotional.service";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView, Platform, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
      const html = `
<html>
<head>
<style>
  body { font-family: Arial; padding: 0; margin: 0; color: #FFFFFF; background-image: url('https://raw.githubusercontent.com/nilsonsierota/pertencer-mobile/master/assets/sub-meditacao-base.png'); background-size: cover; background-position: center; min-height: 100vh; }
  .container { min-height: 100vh; display: flex; flex-direction: column; }
  .header { background-color: rgba(39, 49, 7, 0.85); padding: 16px; text-align: center; }
  .logo { font-size: 22px; font-weight: bold; color: #FFFFFF; }
  .subtitle { font-size: 11px; color: rgba(255,255,255,0.8); margin-top: 2px; }
  .content { padding: 16px; flex: 1; }
  h1 { font-size: 16px; text-align: center; margin-bottom: 16px; background-color: rgba(39, 49, 7, 0.9); padding: 10px; border-radius: 8px; }
  .q { font-size: 12px; font-weight: bold; margin-top: 12px; text-transform: uppercase; color: #FFFFFF; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
  .a { font-size: 12px; margin-top: 4px; margin-bottom: 12px; padding: 8px; background-color: rgba(255,255,255,0.95); border-radius: 6px; color: #273107; min-height: 40px; }
  .done { margin-top: 16px; font-weight: bold; text-align: center; padding: 10px; background-color: rgba(24, 158, 80, 0.9); border-radius: 6px; }
  .footer { background-color: rgba(39, 49, 7, 0.85); padding: 14px; text-align: center; }
  .footer-text { font-size: 11px; color: rgba(255,255,255,0.7); }
</style>
</head>
<body>
<div class="container">
<div class="header">
  <div class="logo">PERTENCER</div>
  <div class="subtitle"> devotional diário</div>
</div>
<div class="content">
<h1>${title} - Capítulo ${chapter}</h1>
${questions.map((q, i) => `
<div class="q">${q}</div>
<div class="a">${answers[i] || '—'}</div>
`).join('')}
${isDone ? '<div class="done">✓ Meditação concluída</div>' : ''}
</div>
<div class="footer">
  <div class="footer-text">Pertencer - © ${new Date().getFullYear()}</div>
</div>
</div>
</body>
</html>`;
      
      const printer = await Print.printToFileAsync({ html });
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(printer.uri, { mimeType: "application/pdf", dialogTitle: "Minha Meditação" });
      }
    } catch (e) { 
      if (e?.message?.includes('Printing did not complete') || e?.message?.includes('cancelled')) {
        return;
      }
      Alert.alert("Erro", "Falha ao gerar PDF");
    }
  };

  if (loading) return <View style={styles.loading}><Image source={require("../../../assets/Logo. 25 [GIF].gif")} style={{ width: 80, height: 80 }} /></View>;

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
  checkBoxChecked: { backgroundColor: '#273107' },
  checkMark: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  checkLabel: { color: '#FFFFFF', fontSize: 14 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 40 },
  actionButton: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#273107', borderRadius: 8, minWidth: 120, alignItems: 'center' },
  actionText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});