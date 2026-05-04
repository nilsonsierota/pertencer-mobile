"use client";

import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../src/services/firebase";
import { DevotionalService } from "../../src/services/devotional.service";
import type { Chapter } from "../../src/types";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";

export default function ChapterListPage() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ title?: string }>();
  const title = searchParams.title;
  const params = useLocalSearchParams<{ planId: string; bookId: string }>();
  const planId = params.planId;
  const bookId = params.bookId;
  const { user } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || !bookId) return;
    DevotionalService.getChapters(bookId, user.uid).then(data => { setChapters(data); setLoading(false); });
  }, [bookId, user]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="text-white mt-2">Carregando capitulos...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-2">
        <Pressable onPress={() => router.back()} className="p-2">
          <Text className="text-white text-sm">{"< Livros"}</Text>
        </Pressable>
      </View>
      <Text className="text-2xl font-bold text-white text-center mb-4 uppercase">{title}</Text>
      <ScrollView className="flex-1 p-4">
        <View className="flex flex-row flex-wrap justify-center">
          {chapters.map((chapter) => {
            const isToday = chapter.isToday || false;
            const isDone = chapter.done || false;
            let bgColor = "bg-chapter";
            let textColor = "text-white";
            if (isToday) { bgColor = isDone ? "bg-secondary" : "bg-primary"; }
            else if (isDone) { bgColor = "bg-white"; textColor = "text-primary"; }

            return (
              <Pressable key={chapter.id}
                onPress={() => router.push(`/${planId}/${bookId}/${chapter.id}?title=${encodeURIComponent(title||'')}&chapter=${chapter.number}`)}
                className={`w-14 h-14 m-1 rounded-lg items-center justify-center border-2 ${bgColor} ${textColor}`}>
                <Text className={`font-bold ${textColor}`}>{chapter.number}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}