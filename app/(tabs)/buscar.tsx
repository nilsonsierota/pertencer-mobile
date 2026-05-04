"use client";

import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { DevotionalService } from "../../src/services/devotional.service";
import type { SearchResult } from "../../src/types";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Image } from "react-native";
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
    return <View style={styles.loading}><Image source={require("../../assets/Logo. 25 [GIF].gif")} style={{ width: 80, height: 80 }} /></View>;
  }

  if (!user) return null;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Text style={styles.title}>Buscar palavra</Text>
        <TextInput
          placeholder="Digite pelo menos 3 caracteres..."
          placeholderTextColor="#9CA3AF"
          value={searchTerm}
          onChangeText={(text) => { setSearchTerm(text); if (text.length < 3) setHasSearched(false); }}
          onSubmitEditing={handleSearch}
          style={styles.input}
          returnKeyType="search"
        />
        <Pressable onPress={handleSearch} disabled={searchTerm.length < 3 || searching} style={[styles.button, searchTerm.length < 3 && styles.buttonDisabled]}>
          <Text style={styles.buttonText}>{searching ? "Buscando..." : "Buscar"}</Text>
        </Pressable>

        {searching && <View style={styles.loadingContainer}><Image source={require("../../assets/Logo. 25 [GIF].gif")} style={{ width: 60, height: 60 }} /></View>}
        {!searching && hasSearched && total === 0 && <Text style={styles.noResults}>Nenhum resultado para "{searchTerm}"</Text>}
        {total > 0 && (
          <ScrollView style={styles.results} keyboardShouldPersistTaps="handled">
            <Text style={styles.resultsCount}>{total} resultado(s)</Text>
            {results.map((result, index) => (
              <Pressable key={index} onPress={() => handleResultClick(result)} style={styles.resultItem}>
                <Text style={styles.resultTitle}>{result.bookTitle} - Capitulo {result.chapterNumber}</Text>
                <Text style={styles.resultPlan}>{result.planName}</Text>
                <Text style={styles.resultText}>"{result.matchedText}"</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#189E50' },
  container: { flex: 1, backgroundColor: '#189E50', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 24 },
  input: { width: '100%', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#9CA3AF', borderRadius: 8, marginBottom: 8, fontSize: 16 },
  button: { width: '100%', paddingVertical: 8, borderRadius: 8, backgroundColor: '#189E50', borderWidth: 1, borderColor: '#FFFFFF' },
  buttonDisabled: { backgroundColor: '#9CA3AF', borderWidth: 1, borderColor: '#9CA3AF' },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  loadingContainer: { paddingVertical: 32 },
  noResults: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingVertical: 32 },
  results: { flex: 1, marginTop: 16 },
  resultsCount: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 8 },
  resultItem: { backgroundColor: 'transparent', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 2, borderColor: '#000000' },
  resultTitle: { fontWeight: 'bold', color: '#000000', fontSize: 16 },
  resultPlan: { color: '#000000', fontSize: 14 },
  resultText: { color: '#000000', fontStyle: 'italic', marginTop: 8, fontSize: 14 },
});