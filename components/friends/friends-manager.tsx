"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { MicOff, Send, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { fallbackCoverWithWidth } from "@/lib/constants/covers";
import { appearsOnlineForFriends } from "@/lib/social/presence";

type FriendRow = {
  friendshipId: string;
  id: string;
  username: string | null;
  email: string | null;
  imageUrl: string | null;
  lastSeenAt: string | null;
  appearOffline: boolean;
};

type ChatMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

function friendOnline(f: FriendRow) {
  return appearsOnlineForFriends({
    appearOffline: f.appearOffline,
    lastSeenAt: f.lastSeenAt,
  });
}

export function FriendsManager() {
  const [email, setEmail] = useState("");
  const [items, setItems] = useState<FriendRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [meId, setMeId] = useState<string | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  const selected = items.find((f) => f.id === selectedId) ?? null;

  const loadFriends = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/friends", { cache: "no-store" });
    const json = await res.json();
    setItems(json.friends ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadFriends();
  }, [loadFriends]);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMeId(d?.user?.id ?? null))
      .catch(() => setMeId(null));
  }, []);

  const loadMessages = useCallback(async (friendUserId: string) => {
    setChatLoading(true);
    try {
      const res = await fetch(
        `/api/friends/messages?friendUserId=${encodeURIComponent(friendUserId)}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (res.ok) setMessages(json.messages ?? []);
      else setMessages([]);
    } finally {
      setChatLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    void loadMessages(selectedId);
    const t = setInterval(() => void loadMessages(selectedId), 5000);
    return () => clearInterval(t);
  }, [selectedId, loadMessages]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedId]);

  async function addFriend() {
    setMessage(null);
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.error ?? "Arkadaş eklenemedi.");
      return;
    }
    setEmail("");
    setMessage("İstek gönderildi veya arkadaş listesine eklendi.");
    await loadFriends();
  }

  async function removeFriend(friendshipId: string) {
    await fetch(
      `/api/friends?friendshipId=${encodeURIComponent(friendshipId)}`,
      { method: "DELETE" }
    );
    if (selectedId) {
      const row = items.find((f) => f.friendshipId === friendshipId);
      if (row?.id === selectedId) setSelectedId(null);
    }
    await loadFriends();
  }

  async function sendChat() {
    if (!selectedId || !draft.trim()) return;
    const res = await fetch("/api/friends/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendUserId: selectedId, body: draft.trim() }),
    });
    if (!res.ok) return;
    setDraft("");
    await loadMessages(selectedId);
  }

  const onlineCount = items.filter((f) => friendOnline(f)).length;

  return (
    <div className="space-y-5">
      <Card className="border-white/[0.07] bg-card/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="size-4 text-accent" />
            Arkadaş ekle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            type="email"
            placeholder="arkadaş@ornek.com"
            className="h-10 w-full rounded-md border border-white/[0.08] bg-background/60 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={() => void addFriend()} className="w-full sm:w-auto">
            E-posta ile davet et
          </Button>
          {message ? (
            <p className="text-xs text-muted-foreground">{message}</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-start">
        <Card className="border-white/[0.07] bg-card/95">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Arkadaş listesi</CardTitle>
            <p className="text-xs font-normal text-muted-foreground">
              {onlineCount} çevrim içi · {items.length} kişi
            </p>
          </CardHeader>
          <CardContent className="space-y-1 p-2 pt-0">
            {loading ? (
              <p className="px-2 py-4 text-sm text-muted-foreground">
                Yükleniyor…
              </p>
            ) : items.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                Henüz bağlantı yok. Yukarıdan e-posta ile davet gönder.
              </p>
            ) : (
              <ul className="max-h-[420px] space-y-0.5 overflow-y-auto pr-1">
                {items.map((f) => {
                  const on = friendOnline(f);
                  const active = selectedId === f.id;
                  return (
                    <li key={f.friendshipId}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(f.id)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-sm transition",
                          active
                            ? "bg-accent/15 text-foreground"
                            : "hover:bg-white/[0.06]"
                        )}
                      >
                        <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
                          {f.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={f.imageUrl}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="flex size-full items-center justify-center text-[10px] font-medium text-muted-foreground">
                              {(f.username ?? f.email ?? "?").slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {f.username ?? f.email ?? "Oyuncu"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {on ? "Çevrim içi" : "Çevrim dışı"}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="flex min-h-[420px] flex-col border-white/[0.07] bg-card/95">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] py-3">
            <div className="min-w-0">
              <CardTitle className="truncate text-base">
                {selected
                  ? selected.username ?? selected.email ?? "Sohbet"
                  : "Sohbet"}
              </CardTitle>
              {selected ? (
                <p className="text-xs font-normal text-muted-foreground">
                  {friendOnline(selected)
                    ? "Çevrim içi"
                    : "Çevrim dışı"}
                </p>
              ) : (
                <p className="text-xs font-normal text-muted-foreground">
                  Mesajlaşmak için soldan bir arkadaş seç.
                </p>
              )}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled
              className="shrink-0 gap-1.5 opacity-70"
              title="Yakında"
            >
              <MicOff className="size-4" />
              Sesli sohbet
            </Button>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3 p-3">
            {!selected ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                <div className="relative size-16 overflow-hidden rounded-full bg-muted opacity-50">
                  <Image
                    src={fallbackCoverWithWidth(200)}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                Sohbet başlatmak için listeden birini seç.
              </div>
            ) : chatLoading && messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Mesajlar yükleniyor…</p>
            ) : (
              <div className="flex max-h-[320px] flex-1 flex-col gap-2 overflow-y-auto rounded-md border border-white/[0.06] bg-background/40 p-2">
                {messages.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">
                    Henüz mesaj yok. İlk mesajı sen gönder.
                  </p>
                ) : (
                  messages.map((m) => {
                    const mine = meId && m.senderId === meId;
                    return (
                      <div
                        key={m.id}
                        className={cn(
                          "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                          mine
                            ? "ml-auto bg-accent/20 text-foreground"
                            : "mr-auto bg-white/[0.06] text-foreground"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {new Date(m.createdAt).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    );
                  })
                )}
                <div ref={listEndRef} />
              </div>
            )}

            {selected ? (
              <div className="flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendChat();
                    }
                  }}
                  placeholder="Mesaj yaz…"
                  className="h-10 min-w-0 flex-1 rounded-md border border-white/[0.08] bg-background/60 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <Button
                  type="button"
                  size="icon"
                  className="shrink-0"
                  onClick={() => void sendChat()}
                  disabled={!draft.trim()}
                  aria-label="Gönder"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            ) : null}

            {selected ? (
              <div className="flex justify-end border-t border-white/[0.06] pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => void removeFriend(selected.friendshipId)}
                >
                  Listeden çıkar
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
