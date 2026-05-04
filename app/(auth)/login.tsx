"use client";

import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth as firebaseAuth } from "../src/services/firebase";
import { DevotionalService } from "../src/services/devotional.service";
import { useAuth } from "../src/context/AuthContext";
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => { if (user) router.replace("/(tabs)"); }, [user]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = "Obrigatório";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Inválido";
    if (!form.password) e.password = "Obrigatório";
    else if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
    if (tab === "register" && !form.name) e.name = "Obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, form.email, form.password);
      await DevotionalService.findUser({ uid: cred.user.uid, email: cred.user.email || "", displayName: cred.user.displayName || "" });
      router.replace("/(tabs)");
    } catch (err: any) { setErrors({ general: "Erro ao logar" }); }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, form.email, form.password);
      await DevotionalService.saveUser({ uid: cred.user.uid, email: cred.user.email || "", displayName: form.name || cred.user.displayName || "" });
      router.replace("/(tabs)");
    } catch (err: any) { setErrors({ general: "Erro ao registrar" }); }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      await DevotionalService.findUser({ uid: cred.user.uid, email: cred.user.email || "", displayName: cred.user.displayName || "" });
      router.replace("/(tabs)");
    } catch (err: any) { setErrors({ general: "Erro com Google" }); }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-4xl font-bold text-white mb-2">Comece agora</Text>
          <Text className="text-white text-sm mb-8 text-center">Crie uma conta ou faça login</Text>

          <View className="flex-row mb-6">
            <Pressable onPress={() => setTab("login")} className={`px-6 py-2 rounded-l-lg ${tab === "login" ? "bg-white" : "bg-white/50"}`}>
              <Text className={`font-bold ${tab === "login" ? "text-primary" : "text-gray-400"}`}>Login</Text>
            </Pressable>
            <Pressable onPress={() => setTab("register")} className={`px-6 py-2 rounded-r-lg ${tab === "register" ? "bg-white" : "bg-white/50"}`}>
              <Text className={`font-bold ${tab === "register" ? "text-primary" : "text-gray-400"}`}>Registrar</Text>
            </Pressable>
          </View>

          <View className="w-full max-w-xs bg-white rounded-xl p-6">
            {tab === "register" && (
              <View className="mb-4">
                <Text className="text-sm text-gray-700 mb-1">Nome</Text>
                <TextInput placeholder="Seu nome" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} className="w-full px-3 py-2 border border-gray-400 rounded" autoCapitalize="words" />
                {errors.name && <Text className="text-red-500 text-sm">{errors.name}</Text>}
              </View>
            )}
            <View className="mb-4">
              <Text className="text-sm text-gray-700 mb-1">Email</Text>
              <TextInput placeholder="seu@email.com" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} className="w-full px-3 py-2 border border-gray-400 rounded" keyboardType="email-address" autoCapitalize="none" />
              {errors.email && <Text className="text-red-500 text-sm">{errors.email}</Text>}
            </View>
            <View className="mb-4">
              <Text className="text-sm text-gray-700 mb-1">Senha</Text>
              <TextInput placeholder="******" value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} className="w-full px-3 py-2 border border-gray-400 rounded" secureTextEntry />
              {errors.password && <Text className="text-red-500 text-sm">{errors.password}</Text>}
            </View>
            {errors.general && <Text className="text-red-500 text-sm text-center mb-4">{errors.general}</Text>}
            <Pressable onPress={tab === "login" ? handleLogin : handleRegister} disabled={loading} className="w-full py-3 bg-secondary rounded-lg">
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white text-center font-bold">{tab === "login" ? "Entrar" : "Registrar"}</Text>}
            </Pressable>
            <View className="mt-4">
              <Text className="text-center text-sm text-gray-500 mb-2">Ou</Text>
              <Pressable onPress={handleGoogle} disabled={loading} className="w-full py-3 border border-gray-400 rounded-lg">
                <Text className="text-center text-primary">Entrar com Google</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}