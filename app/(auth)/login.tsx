"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { loginWithEmail, registerWithEmail, signInWithGoogleIdToken } from "../../src/services/firebase-auth";
import { DevotionalService } from "../../src/services/devotional.service";
import { useAuth } from "../../src/context/AuthContext";
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { configureGoogleSignin, signInWithGoogle, statusCodes } from "../../src/services/google-signin";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => { configureGoogleSignin(); }, []);

  const handleGoogleLogin = useCallback(async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.type === "success" && result.data?.idToken) {
        await signInWithGoogleIdToken(result.data.idToken);
        router.replace("/(tabs)");
      } else {
        throw new Error("No ID token received");
      }
    } catch (err: any) {
      console.log("Google login error:", err);
      if (err.message === "GOOGLE_SIGNIN_NOT_AVAILABLE") {
        setErrors({ general: "Google Sign-In não disponível nesta plataforma" });
      } else if (err.code === statusCodes?.SIGN_IN_CANCELLED) {
        setErrors({});
      } else if (err.code === statusCodes?.IN_PROGRESS) {
        setErrors({ general: "Login já em andamento" });
      } else if (err.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        setErrors({ general: "Google Play Services não disponível" });
      } else {
        setErrors({ general: "Erro ao fazer login com Google" });
      }
    }
    setLoading(false);
  }, []);

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
      const cred = await loginWithEmail(form.email, form.password);
      await DevotionalService.findUser({ uid: cred.user.uid, email: cred.user.email || "", displayName: cred.user.displayName || "" });
      router.replace("/(tabs)");
    } catch (err: any) {
      setErrors({ general: "Email ou senha incorretos" });
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const cred = await registerWithEmail(form.email, form.password);
      await DevotionalService.saveUser({ uid: cred.user.uid, email: cred.user.email || "", displayName: form.name || cred.user.displayName || "" });
      router.replace("/(tabs)");
    } catch (err: any) {
      setErrors({ general: "Erro ao criar conta" });
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.topSection}>
          <Image source={require("../../assets/logo-pertencer.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Comece agora</Text>
          <Text style={styles.subtitle}>Crie uma conta ou faça login para fazer sua meditação</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabContainer}>
            <Pressable onPress={() => setTab("login")} style={[styles.tab, tab === "login" ? styles.tabActive : styles.tabInactive]}>
              <Text style={[styles.tabText, tab === "login" ? styles.tabTextActive : styles.tabTextInactive]}>Login</Text>
            </Pressable>
            <Pressable onPress={() => setTab("register")} style={[styles.tab, tab === "register" ? styles.tabActive : styles.tabInactive]}>
              <Text style={[styles.tabText, tab === "register" ? styles.tabTextActive : styles.tabTextInactive]}>Registrar</Text>
            </Pressable>
          </View>

          <View style={styles.form}>
            {tab === "register" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome</Text>
                <TextInput placeholder="Nome" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} style={styles.input} autoCapitalize="words" />
                {errors.name && <Text style={styles.error}>{errors.name}</Text>}
              </View>
            )}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput placeholder="E-mail" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
              {errors.email && <Text style={styles.error}>{errors.email}</Text>}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <TextInput placeholder="Senha" value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} style={styles.input} secureTextEntry />
              {errors.password && <Text style={styles.error}>{errors.password}</Text>}
            </View>
            {errors.general && <Text style={styles.errorCenter}>{errors.general}</Text>}
            <Pressable onPress={tab === "login" ? handleLogin : handleRegister} disabled={loading} style={styles.button}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{tab === "login" ? "Entrar" : "Registrar"}</Text>}
            </Pressable>
            <Text style={styles.orText}>Ou</Text>
            <Pressable onPress={handleGoogleLogin} disabled={loading} style={styles.googleButton}>
              <Ionicons name="logo-google" size={20} color="#4285F4" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Entrar com Google</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#189E50' },
  scrollContent: { flexGrow: 1 },
  topSection: { alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24 },
  logo: { width: 200, height: 50, marginBottom: 16 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 12, color: '#FFFFFF', opacity: 0.9 },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#D1D5DB',
    overflow: 'hidden',
    marginBottom: 24,
  },
  tab: { paddingVertical: 4, paddingHorizontal: 48 },
  tabActive: { backgroundColor: '#FFFFFF' },
  tabInactive: { backgroundColor: '#E5E7EB' },
  tabText: { fontWeight: '600', fontSize: 16, textAlign: 'center' },
  tabTextActive: { color: '#000000' },
  tabTextInactive: { color: '#9CA3AF' },
  form: { width: '100%', maxWidth: 320, gap: 16 },
  inputGroup: { gap: 4 },
  label: { fontSize: 14, color: '#374151' },
  input: { width: '100%', paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#6B7280', borderRadius: 8, fontSize: 16, backgroundColor: '#FFFFFF' },
  error: { color: '#EF4444', fontSize: 12 },
  errorCenter: { color: '#EF4444', fontSize: 12, textAlign: 'center' },
  button: { width: '100%', paddingVertical: 12, backgroundColor: '#189E50', borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  orText: { textAlign: 'center', color: '#9CA3AF', fontSize: 14 },
  googleButton: { width: '100%', paddingVertical: 12, backgroundColor: 'transparent', borderRadius: 8, borderWidth: 1, borderColor: '#6B7280', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  googleIcon: { marginRight: 8 },
  googleButtonText: { color: '#374151', fontWeight: '600', fontSize: 16 },
});
