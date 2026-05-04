"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../src/services/firebase";
import { DevotionalService } from "../../src/services/devotional.service";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";

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

  if (loading) return <View className="flex-1 items-center justify-center bg-background"><ActivityIndicator size="large" color="#FFFFFF" /></View>;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-2">
        <Pressable onPress={() => router.back()} className="p-2"><Text className="text-white text-sm">{"< Capitulos"}</Text></Pressable>
      </View>
      <Text className="text-xl font-bold text-white text-center mb-2">{title} {chapter}</Text>
      <ScrollView className="flex-1 p-4">
        {questions.map((q, i) => (
          <View key={i} className="mb-3">
            <Text className="text-sm text-white mb-1 uppercase">{q}</Text>
            <TextInput value={answers[i]} onChangeText={(v) => handleAnswerChange(i, v)} className="w-full p-2 bg-white rounded text-primary" multiline numberOfLines={3} placeholder="Escreva..."
              editable={!isDone} textAlignVertical="top" />
          </View>
        ))}
        <View className="flex-row items-center mt-4 mb-4">
          <Pressable onPress={() => setIsDone(!isDone)} className="flex-row items-center">
            <View className={`w-6 h-6 rounded border-2 mr-2 items-center justify-center ${isDone ? 'bg-white border-white' : 'border-white'}`}>
              {isDone && <Text className="text-primary">✓</Text>}
            </View>
            <Text className="text-white">Terminei de responder</Text>
          </Pressable>
        </View>
        <View className="flex-row justify-center gap-3 mb-8">
          <Pressable onPress={handleSharePdf} className="px-4 py-2 bg-white rounded"><Text className="text-primary font-bold">Compartilhar</Text></Pressable>
          <Pressable onPress={handleSave} disabled={saving} className="px-4 py-2 bg-white rounded">
            {saving ? <ActivityIndicator size="small" color="#189E50" /> : <Text className="text-primary font-bold">Salvar</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}