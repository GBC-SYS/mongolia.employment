import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface QtDebriefing {
  id: string;
  author: string;
  grace: string;
  improvement: string;
  createdAt: string;
  editToken?: string; // POST 응답 시에만 포함, 이후 요청에서는 미포함
}

export interface PrayerAnswer {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  editToken?: string; // POST 응답 시에만 포함, 이후 요청에서는 미포함
}

export async function getPrayerCount(): Promise<number> {
  const { data } = await supabase
    .from("prayer_count")
    .select("count")
    .eq("id", 1)
    .single();
  return data?.count ?? 0;
}

export async function incrementPrayerCount(): Promise<number> {
  const { data, error } = await supabase.rpc("increment_prayer_count");
  if (error) throw error;
  return data ?? 0;
}

export async function getQtDebriefings(day: number): Promise<QtDebriefing[]> {
  const { data, error } = await supabase
    .from("qt_debriefings")
    .select("*")
    .eq("day", day)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    author: row.author,
    grace: row.grace,
    improvement: row.improvement,
    createdAt: row.created_at,
  }));
}

export async function addQtDebriefing(
  day: number,
  data: { author: string; grace: string; improvement: string }
): Promise<QtDebriefing> {
  const editToken = crypto.randomUUID();
  const { data: row, error } = await supabase
    .from("qt_debriefings")
    .insert({ day, author: data.author || "익명", grace: data.grace, improvement: data.improvement, edit_token: editToken })
    .select()
    .single();
  if (error) throw error;
  return {
    id: row.id,
    author: row.author,
    grace: row.grace,
    improvement: row.improvement,
    createdAt: row.created_at,
    editToken, // 클라이언트에 1회만 전달
  };
}

export async function updateQtDebriefing(
  id: string,
  data: { grace?: string; improvement?: string },
  editToken: string
): Promise<QtDebriefing> {
  const updates: Record<string, string> = {};
  if (data.grace !== undefined) updates.grace = data.grace;
  if (data.improvement !== undefined) updates.improvement = data.improvement;
  const { data: row, error } = await supabase
    .from("qt_debriefings")
    .update(updates)
    .eq("id", id)
    .eq("edit_token", editToken)
    .select()
    .single();
  if (error) {
    if (error.code === "PGRST116") throw new Error("권한이 없습니다.");
    throw error;
  }
  return {
    id: row.id,
    author: row.author,
    grace: row.grace,
    improvement: row.improvement,
    createdAt: row.created_at,
  };
}

export async function deleteQtDebriefing(id: string, editToken: string): Promise<void> {
  const { data: check } = await supabase
    .from("qt_debriefings")
    .select("id")
    .eq("id", id)
    .eq("edit_token", editToken)
    .maybeSingle();
  if (!check) throw new Error("권한이 없습니다.");
  const { error } = await supabase.from("qt_debriefings").delete().eq("id", id);
  if (error) throw error;
}

export async function getPrayerAnswers(letterId: string): Promise<PrayerAnswer[]> {
  const { data, error } = await supabase
    .from("prayer_answers")
    .select("*")
    .eq("letter_id", letterId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    author: row.author,
    content: row.content,
    createdAt: row.created_at,
  }));
}

export async function updatePrayerAnswer(
  id: string,
  data: { content: string },
  editToken: string
): Promise<PrayerAnswer> {
  const { data: row, error } = await supabase
    .from("prayer_answers")
    .update({ content: data.content })
    .eq("id", id)
    .eq("edit_token", editToken)
    .select()
    .single();
  if (error) {
    if (error.code === "PGRST116") throw new Error("권한이 없습니다.");
    throw error;
  }
  return {
    id: row.id,
    author: row.author,
    content: row.content,
    createdAt: row.created_at,
  };
}

export async function deletePrayerAnswer(id: string, editToken: string): Promise<void> {
  const { data: check } = await supabase
    .from("prayer_answers")
    .select("id")
    .eq("id", id)
    .eq("edit_token", editToken)
    .maybeSingle();
  if (!check) throw new Error("권한이 없습니다.");
  const { error } = await supabase.from("prayer_answers").delete().eq("id", id);
  if (error) throw error;
}

export async function addPrayerAnswer(
  letterId: string,
  data: { author: string; content: string }
): Promise<PrayerAnswer> {
  const editToken = crypto.randomUUID();
  const { data: row, error } = await supabase
    .from("prayer_answers")
    .insert({ letter_id: letterId, author: data.author || "익명", content: data.content, edit_token: editToken })
    .select()
    .single();
  if (error) throw error;
  return {
    id: row.id,
    author: row.author,
    content: row.content,
    createdAt: row.created_at,
    editToken, // 클라이언트에 1회만 전달
  };
}
