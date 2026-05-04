"use client";

import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { DevotionalService } from "../../src/services/devotional.service";
import type { SearchResult } from "../../src/types";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";

export default function BuscarPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/(auth)/login");
  }, [authLoading, user]);

  const { data, isLoading: searching } = useQuery<{ results: SearchResult[]; total: number }>({
    queryKey: ["search", user?.uid, searchTerm],
    enabled: !!user && !!searchTerm && searchTerm.length >= 3 && hasSearched,
    queryFn: () => DevotionalService.searchUserDevotionals(user!.uid, searchTerm),
  });

  const handleSearch = () => {
    if (searchTerm.length >= 3) setHasSearched(true);
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(`/${result.planId}/${result.bookId}/${result.chapterId}?title=${encodeURIComponent(result.bookTitle)}&chapter=${result.chapterNumber}`);
  };

  const results = data?.results ?? [];
  const total = data?.total ?? 0;

  if (authLoading) {
    return <View className="flex-1 items-center justify-center bg-background"><ActivityIndicator size="large" color="#FFFFFF" /></View>;
  }

  if (!user) return null;

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-white text-center mb-6">Buscar palavra</Text>
      <TextInput
        placeholder="Digite pelo menos 3 caracteres..."
        value={searchTerm}
        onChangeText={(text) => { setSearchTerm(text); if (text.length < 3) setHasSearched(false); }}
        onSubmitEditing={handleSearch}
        className="w-full px-3 py-2 bg-white border border-gray-400 rounded mb-2"
      />
      <Pressable onPress={handleSearch} disabled={searchTerm.length < 3 || searching} className={`w-full py-2 rounded ${searchTerm.length < 3 ? 'bg-gray-400' : 'bg-secondary'}`}>
        <Text className="text-white text-center font-bold">{searching ? "Buscando..." : "Buscar"}</Text>
      </Pressable>

      {searching && <View className="py-8"><ActivityIndicator size="large" color="#FFFFFF" /></View>}
      {!searching && hasSearched && total === 0 && <Text className="text-white/60 text-center py-8">Nenhum resultado para "{searchTerm}"</Text>}
      {total > 0 && (
        <ScrollView className="flex-1 mt-4">
          <Text className="text-white/70 text-sm mb-2">{total} resultado(s)</Text>
          {results.map((result, index) => (
            <Pressable key={index} onPress={() => handleResultClick(result)} className="bg-white p-3 rounded-lg mb-2">
              <Text className="font-bold text-primary">{result.bookTitle} - Capitulo {result.chapterNumber}</Text>
              <Text className="text-gray-500 text-sm">{result.planName}</Text>
              <Text className="text-secondary italic mt-1">"{result.matchedText}"</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}