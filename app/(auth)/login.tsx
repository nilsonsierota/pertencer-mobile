"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { auth as firebaseAuth } from "../../src/services/firebase";
import { loginWithEmail, registerWithEmail, signInWithCredential, GoogleAuthProvider } from "../../src/services/firebase-auth";
import { DevotionalService } from "../../src/services/devotional.service";
import { useAuth } from "../../src/context/AuthContext";
import * as WebBrowser from "expo-web-browser";
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  
  const handleGoogleLogin = useCallback(async () => {
    setLoading(true);
    try {
      const redirectUri = "https://auth.expo.io/@pertencer/pertencer-mobile";
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=openid%20profile%20email&access_type=offline`;
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      
      if (result.type === "success" && result.url) {
        const hash = result.url.split("#")[1];
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        
        if (accessToken) {
          const credential = GoogleAuthProvider.credential(accessToken);
          await signInWithCredential(firebaseAuth!, credential);
          router.replace("/(tabs)");
        }
      }
    } catch (err: any) {
      console.log("Google login error:", err);
      setErrors({ general: "Erro ao fazer login com Google" });
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
        <View style={styles.content}>
          <Text style={styles.title}>Comece agora</Text>
          <Text style={styles.subtitle}>Crie uma conta ou faça login</Text>

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
                <TextInput placeholder="Seu nome" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} style={styles.input} autoCapitalize="words" />
                {errors.name && <Text style={styles.error}>{errors.name}</Text>}
              </View>
            )}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput placeholder="seu@email.com" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
              {errors.email && <Text style={styles.error}>{errors.email}</Text>}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <TextInput placeholder="******" value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} style={styles.input} secureTextEntry />
              {errors.password && <Text style={styles.error}>{errors.password}</Text>}
            </View>
            {errors.general && <Text style={styles.errorCenter}>{errors.general}</Text>}
            <Pressable onPress={tab === "login" ? handleLogin : handleRegister} disabled={loading} style={styles.button}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{tab === "login" ? "Entrar" : "Registrar"}</Text>}
            </Pressable>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>
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
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { color: '#FFFFFF', fontSize: 14, marginBottom: 32, textAlign: 'center' },
  tabContainer: { flexDirection: 'row', marginBottom: 24 },
  tab: { paddingHorizontal: 24, paddingVertical: 8, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
  tabActive: { backgroundColor: '#FFFFFF' },
  tabInactive: { backgroundColor: 'rgba(255,255,255,0.5)' },
  tabText: { fontWeight: 'bold', fontSize: 16 },
  tabTextActive: { color: '#273107' },
  tabTextInactive: { color: '#9CA3AF' },
  form: { width: '100%', maxWidth: 320, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: '#374151', marginBottom: 4 },
  input: { width: '100%', paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#9CA3AF', borderRadius: 8, fontSize: 16 },
  error: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  errorCenter: { color: '#EF4444', fontSize: 12, textAlign: 'center', marginBottom: 16 },
  button: { width: '100%', paddingVertical: 12, backgroundColor: '#189E50', borderRadius: 8 },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  googleButton: { width: '100%', paddingVertical: 12, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#9CA3AF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  googleIcon: { marginRight: 8 },
  googleButtonText: { color: '#374151', fontWeight: '600', fontSize: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { color: '#9CA3AF', marginHorizontal: 12, fontSize: 14 },
});