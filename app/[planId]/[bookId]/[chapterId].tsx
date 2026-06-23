"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../src/context/AuthContext";
import { DevotionalService } from "../../../src/services/devotional.service";
import { BibleService, BIBLE_VERSIONS } from "../../../src/services/bible.service";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView, Platform, Image, Modal, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BibleVersion, ChapterData } from "../../../src/types";

const questions = [
  "VOCÊ VIU O AGIR DE DEUS NESSE CAPÍTULO?",
  "O QUE DEUS FALOU COM VOCÊ?",
  "O QUE EU QUERO DIZER PARA DEUS?",
  "QUAL É A MINHA AÇÃO PRÁTICA? (DETALHE QUAL VAI SER SUA AÇÃO PRÁTICA AO LONGO DA SEMANA)",
  "HÁ ALGUM PECADO QUE EU PRECISO CONFESSAR AO SENHOR?",
  "QUAL MILAGRE O SENHOR FEZ POR VOCÊ HOJE? PODE SER ALGO PEQUENO OU GRANDE, UM DETALHE QUE MOSTROU O CUIDADO DELE",
];

export default function QuestionsPage() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ title?: string; chapter?: string; bookKey?: string }>();
  const title = searchParams.title;
  const chapter = searchParams.chapter;
  const bookKey = searchParams.bookKey;
  const params = useLocalSearchParams<{ planId: string; bookId: string; chapterId: string }>();
  const planId = params.planId;
  const bookId = params.bookId;
  const chapterId = params.chapterId;

  const { user } = useAuth();
  const [answers, setAnswers] = useState<string[]>(Array(6).fill(""));
  const [isDone, setIsDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bibleVersion, setBibleVersion] = useState<BibleVersion>(BIBLE_VERSIONS[0]);
  const [bibleChapter, setBibleChapter] = useState<ChapterData | null>(null);
  const [bibleLoading, setBibleLoading] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);

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

  useEffect(() => {
    BibleService.getSavedVersion().then(v => setBibleVersion(v));
  }, []);

  useEffect(() => {
    const bookName = bookKey || (title ? title.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : null);
    if (!bookName || !chapter) return;
    setBibleLoading(true);
    const chapterNum = parseInt(chapter as string, 10);
    BibleService.getChapter(bookName, chapterNum, bibleVersion.id).then(data => {
      setBibleChapter(data);
      setBibleLoading(false);
    });
  }, [bookKey, title, chapter, bibleVersion.id]);

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => { const u = [...prev]; u[index] = value; return u; });
  };

  const handleVersionChange = async (version: BibleVersion) => {
    setBibleVersion(version);
    await BibleService.setVersion(version);
    setShowVersionModal(false);
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
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; }
  body { 
    font-family: Helvetica, Arial, sans-serif; 
    color: #FFFFFF; 
    background-color: #189E50;
    padding: 0;
    margin: 0;
  }
  .page {
    position: relative;
    width: 100%;
    min-height: 100%;
    background-color: #189E50;
  }
  .header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100px;
    background-color: #273107;
  }
  .logo {
    position: absolute;
    top: 20px;
    left: 25px;
    font-size: 24px;
    font-weight: bold;
    color: #FFFFFF;
    letter-spacing: 2px;
  }
  .subtitle {
    position: absolute;
    top: 50px;
    left: 25px;
    font-size: 11px;
    color: rgba(255,255,255,0.8);
  }
  .content {
    position: relative;
    padding: 120px 25px 70px 25px;
  }
  h1 {
    font-size: 16px;
    font-weight: bold;
    text-align: left;
    margin-bottom: 25px;
    padding: 10px 0;
    color: #FFFFFF;
  }
  .question {
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
    color: #FFFFFF;
    margin-top: 18px;
    margin-bottom: 8px;
  }
  .answer {
    font-size: 10px;
    color: #273107;
    background-color: #FFFFFF;
    padding: 10px;
    border-radius: 6px;
    min-height: 45px;
    margin-bottom: 18px;
  }
  .done {
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    padding: 12px;
    background-color: #189E50;
    border-radius: 6px;
    margin-top: 20px;
  }
  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: #273107;
  }
  .footer-text {
    position: absolute;
    top: 22px;
    left: 25px;
    font-size: 11px;
    color: rgba(255,255,255,0.7);
  }
  @page {
    size: A4;
    margin: 0;
  }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo">PERTENCER</div>
    <div class="subtitle">devocional diário</div>
  </div>
  <div class="content">
    <h1>${title} ${chapter}</h1>
    ${questions.map((q, i) => `
      <div class="question">${q}</div>
      <div class="answer">${answers[i] || '—'}</div>
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
      const error = e as Error;
      if (error?.message?.includes('Printing did not complete') || error?.message?.includes('cancelled')) {
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
      
      <Pressable style={styles.versionSelector} onPress={() => setShowVersionModal(true)}>
        <Text style={styles.versionText}>{bibleVersion.name} - {bibleVersion.abbreviation}</Text>
        <Text style={styles.versionArrow}>▼</Text>
      </Pressable>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
        {!bibleLoading && bibleChapter && bibleChapter.verses.length > 0 && (
          <View style={styles.bibleSection}>
<WebView
                source={{
                  html: `
                    <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #273107; line-height: 1.6; padding: 16px; margin: 0; -webkit-user-select: text; user-select: text; }
                        .ref { font-weight: bold; text-align: center; margin-bottom: 12px; }
                        .verse { margin-bottom: 8px; text-align: justify; }
                        .vn { font-weight: bold; color: #189E50; margin-right: 6px; }
                      </style>
                    </head>
                    <body>
                      <div class="ref">${bibleChapter.bookName} ${bibleChapter.chapter}</div>
                      ${bibleChapter.verses.map(v => `<div class="verse"><span class="vn">${v.verse}</span>${v.text}</div>`).join('')}
                    </body>
                    </html>
                  `
                }}
                style={styles.bibleWebView}
              />
          </View>
        )}
        {bibleLoading && (
          <View style={styles.bibleLoading}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.bibleLoadingText}>Carregando texto bíblico...</Text>
          </View>
        )}
        {!bibleLoading && !bibleChapter && (
          <View style={styles.bibleError}>
            <Text style={styles.bibleErrorText}>Erro ao carregar a bíblia.</Text>
          </View>
        )}

        <Text style={styles.questionsTitle}>REFLEXÃO</Text>
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
    <VersionModal 
      visible={showVersionModal} 
      versions={BIBLE_VERSIONS} 
      selected={bibleVersion} 
      onSelect={handleVersionChange} 
      onClose={() => setShowVersionModal(false)} 
    />
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
  questionText: { fontSize: 14, color: '#000000', marginBottom: 6, textTransform: 'uppercase', fontWeight: '600' },
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
  versionSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#273107', paddingVertical: 8, paddingHorizontal: 16, marginHorizontal: 16, borderRadius: 8, marginBottom: 8 },
  versionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  versionArrow: { color: '#FFFFFF', fontSize: 10, marginLeft: 8 },
   bibleSection: { backgroundColor: '#D9D9D9', borderRadius: 8, padding: 16, marginBottom: 16, minHeight: 400, overflow: 'hidden' },
   bibleWebView: { flex: 1, minHeight: 400, backgroundColor: '#D9D9D9' },
   bibleReference: { fontSize: 16, fontWeight: 'bold', color: '#273107', marginBottom: 12, textAlign: 'center' },
  verseText: { fontSize: 14, color: '#273107', lineHeight: 22, marginBottom: 8, textAlign: 'justify' },
  verseNumber: { fontWeight: 'bold', color: '#189E50' },
  bibleLoading: { alignItems: 'center', padding: 20 },
  bibleLoadingText: { color: '#FFFFFF', marginTop: 8, fontSize: 12 },
  bibleError: { backgroundColor: '#D9D9D9', borderRadius: 8, padding: 24, marginBottom: 16, alignItems: 'center' },
  bibleErrorText: { color: '#EF4444', fontSize: 14 },
  questionsTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginVertical: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.3)' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, width: '85%', maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#273107', textAlign: 'center', marginBottom: 16 },
  modalOption: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalOptionSelected: { backgroundColor: '#189E50' },
  modalOptionText: { fontSize: 16, color: '#273107' },
  modalOptionTextSelected: { color: '#FFFFFF' },
  modalOptionAbbr: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});

const VersionModal = ({ visible, versions, selected, onSelect, onClose }: { visible: boolean; versions: BibleVersion[]; selected: BibleVersion; onSelect: (v: BibleVersion) => void; onClose: () => void }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Selecione a Versão</Text>
        {versions.map(v => (
          <TouchableOpacity key={v.id} style={[styles.modalOption, selected.id === v.id && styles.modalOptionSelected]} onPress={() => onSelect(v)}>
            <Text style={[styles.modalOptionText, selected.id === v.id && styles.modalOptionTextSelected]}>{v.name}</Text>
            <Text style={[styles.modalOptionAbbr, selected.id === v.id && styles.modalOptionTextSelected]}>({v.abbreviation})</Text>
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  </Modal>
);