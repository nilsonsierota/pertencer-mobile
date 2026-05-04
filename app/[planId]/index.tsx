"use client";

import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../src/services/firebase";
import { DevotionalService } from "../../src/services/devotional.service";
import type { Book } from "../../src/types";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";

export default function BookListPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ title?: string }>();
  const title = params.title;
  const routeParams = useLocalSearchParams<{ planId: string }>();
  const planId = routeParams.planId;
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/(auth)/login");
  }, [authLoading, user, router]);

  const { data: books = [], isLoading } = useQuery<Book[]>({
    queryKey: ["books", planId, user?.uid],
    enabled: !!user && !!planId,
    queryFn: () => DevotionalService.getBooks(user!.uid, planId!),
  });

  if (authLoading || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="text-white mt-2">Carregando livros...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-2">
        <Pressable onPress={() => router.back()} className="p-2">
          <Text className="text-white text-sm">{"< Planos"}</Text>
        </Pressable>
      </View>
      <Text className="text-2xl font-bold text-white text-center mb-4">{title}</Text>
      <ScrollView className="flex-1 p-4">
        {books.length === 0 && <Text className="text-white/60 text-center">Nenhum livro</Text>}
        {books.map((book) => (
          <Pressable key={book.id} onPress={() => router.push(`/${planId}/${book.id}?title=${encodeURIComponent(book.title)}`)}
            className={`w-full p-4 mb-3 rounded-lg border-2 border-primary ${book.isToday ? 'bg-primary' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center">
              <Text className={`text-lg font-bold ${book.isToday ? 'text-white' : 'text-primary'}`}>{book.title}</Text>
              <View className="text-right">
                <Text className={`text-sm font-bold ${book.isToday ? 'text-white' : 'text-primary'}`}>{book.donePercentage}%</Text>
                <Text className={`text-xs ${book.isToday ? 'text-white/70' : 'text-gray-500'}`}>{book.doneChapters}/{book.totalChapters}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}