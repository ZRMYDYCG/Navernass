import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import {
  createNovel,
  getChatSessions,
  getNovels,
  getSession,
  signInEmail,
  signOut,
  signUpEmail,
  startAgentPrompt,
  type Novel,
} from "@/lib/api";

const colors = {
  background: "#f5f5f4",
  foreground: "#1c1917",
  muted: "#f5f5f4",
  mutedForeground: "#78716c",
  border: "#d6d3d1",
  white: "#ffffff",
  destructive: "#dc2626",
};

export function AgentScreen() {
  const queryClient = useQueryClient();
  const session = useQuery({ queryKey: ["session"], queryFn: getSession });
  const user = session.data?.user;
  const novels = useQuery({ queryKey: ["novels"], queryFn: getNovels, enabled: Boolean(user) });
  const [activeNovelId, setActiveNovelId] = useState<string>();
  const activeNovel = useMemo(
    () => novels.data?.find((novel) => novel.id === (activeNovelId ?? novels.data?.[0]?.id)),
    [activeNovelId, novels.data],
  );
  const sessions = useQuery({
    queryKey: ["sessions", activeNovel?.id],
    queryFn: () => getChatSessions(activeNovel!.id),
    enabled: Boolean(activeNovel?.id),
  });
  const [prompt, setPrompt] = useState("");
  const [lastReply, setLastReply] = useState("");
  const [error, setError] = useState<string>();

  const starter = useMutation({
    mutationFn: () => createNovel("未命名作品"),
    onSuccess: (novel) => {
      setActiveNovelId(novel.id);
      void queryClient.invalidateQueries({ queryKey: ["novels"] });
    },
  });

  const send = useMutation({
    mutationFn: async () => {
      if (!activeNovel || !prompt.trim()) return "";
      return startAgentPrompt({
        novelId: activeNovel.id,
        sessionId: sessions.data?.[0]?.id,
        prompt: prompt.trim(),
      });
    },
    onSuccess: (text) => {
      setPrompt("");
      setLastReply(text || "已发送，稍后下拉刷新会话。");
      void queryClient.invalidateQueries({ queryKey: ["sessions", activeNovel?.id] });
    },
    onError: (caught) => setError(errorMessage(caught, "发送失败")),
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.shell}>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Narraverse Mobile</Text>
            <Text style={styles.title}>Agent</Text>
            <Text style={styles.subtitle}>
              {user ? user.name || user.email || "已登录" : "登录后开始移动端创作"}
            </Text>
          </View>

          {user ? (
            <SignedInPanel
              novels={novels.data ?? []}
              activeNovelId={activeNovel?.id}
              loading={novels.isLoading}
              creating={starter.isPending}
              onCreate={() => starter.mutate()}
              onSelect={setActiveNovelId}
              onSignOut={async () => {
                await signOut();
                setActiveNovelId(undefined);
                queryClient.clear();
                void queryClient.invalidateQueries({ queryKey: ["session"] });
              }}
            />
          ) : (
            <AuthPanel
              onDone={() => void queryClient.invalidateQueries({ queryKey: ["session"] })}
            />
          )}

          {user ? (
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.sectionTitle}>{activeNovel?.title ?? "选择或创建作品"}</Text>
                <Text style={styles.subtitle}>{sessions.data?.[0]?.title || "新对话"}</Text>
              </View>
              <TextField
                label="给 Agent 的指令"
                value={prompt}
                multiline
                placeholder="例如：帮我设计第一章的冲突和结尾钩子"
                onChangeText={setPrompt}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                loading={send.isPending}
                disabled={!activeNovel || !prompt.trim()}
                onPress={() => send.mutate()}
              >
                发送给 Agent
              </Button>
              {lastReply ? <Text style={styles.reply}>{lastReply}</Text> : null}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SignedInPanel({
  novels,
  activeNovelId,
  loading,
  creating,
  onCreate,
  onSelect,
  onSignOut,
}: {
  novels: Novel[];
  activeNovelId?: string;
  loading: boolean;
  creating: boolean;
  onCreate: () => void;
  onSelect: (id: string) => void;
  onSignOut: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>作品</Text>
        <Button compact variant="secondary" onPress={onSignOut}>
          退出
        </Button>
      </View>
      {loading ? <Text style={styles.subtitle}>正在读取作品...</Text> : null}
      <View style={styles.stackSmall}>
        {novels.map((novel) => (
          <Button
            key={novel.id}
            variant={novel.id === activeNovelId ? "primary" : "secondary"}
            onPress={() => onSelect(novel.id)}
          >
            {novel.title}
          </Button>
        ))}
      </View>
      <Button loading={creating} variant="secondary" onPress={onCreate}>
        新建作品
      </Button>
    </View>
  );
}

function AuthPanel({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const auth = useMutation({
    mutationFn: () =>
      mode === "login"
        ? signInEmail({ email, password })
        : signUpEmail({ name: name || email, email, password }),
    onSuccess: onDone,
    onError: (caught) => setError(errorMessage(caught, "登录失败")),
  });

  return (
    <View style={styles.card}>
      <View style={styles.segment}>
        <Button
          compact
          variant={mode === "login" ? "primary" : "secondary"}
          onPress={() => setMode("login")}
        >
          登录
        </Button>
        <Button
          compact
          variant={mode === "register" ? "primary" : "secondary"}
          onPress={() => setMode("register")}
        >
          注册
        </Button>
      </View>
      {mode === "register" ? <TextField label="昵称" value={name} onChangeText={setName} /> : null}
      <TextField label="邮箱" value={email} onChangeText={setEmail} />
      <TextField label="密码" value={password} secureTextEntry onChangeText={setPassword} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button loading={auth.isPending} onPress={() => auth.mutate()}>
        {mode === "login" ? "登录" : "注册"}
      </Button>
    </View>
  );
}

function errorMessage(caught: unknown, fallback: string) {
  if (!(caught instanceof Error)) return fallback;
  if (caught.message === "Failed to fetch") return "无法连接后端，请确认后端已启动。";
  return caught.message || fallback;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    minHeight: "100%",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 28,
  },
  shell: {
    width: "100%",
    maxWidth: 430,
    gap: 16,
  },
  hero: {
    gap: 6,
    paddingHorizontal: 2,
    paddingTop: 4,
  },
  header: {
    gap: 4,
  },
  eyebrow: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  title: {
    color: colors.foreground,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
  card: {
    gap: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 18,
    shadowColor: colors.foreground,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  segment: {
    flexDirection: "row",
    alignSelf: "flex-start",
    gap: 10,
    borderRadius: 16,
    backgroundColor: colors.muted,
    padding: 4,
  },
  stackSmall: {
    gap: 8,
  },
  sectionTitle: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: "700",
  },
  error: {
    color: colors.destructive,
    fontSize: 14,
  },
  reply: {
    borderRadius: 12,
    backgroundColor: colors.muted,
    color: colors.foreground,
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
  },
});
