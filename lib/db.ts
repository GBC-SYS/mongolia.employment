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
}

export interface PrayerAnswer {
  id: string;
  author: string;
  content: string;
  createdAt: string;
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
  const { data: row, error } = await supabase
    .from("qt_debriefings")
    .insert({ day, author: data.author || "익명", grace: data.grace, improvement: data.improvement })
    .select()
    .single();
  if (error) throw error;
  return {
    id: row.id,
    author: row.author,
    grace: row.grace,
    improvement: row.improvement,
    createdAt: row.created_at,
  };
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

export async function addPrayerAnswer(
  letterId: string,
  data: { author: string; content: string }
): Promise<PrayerAnswer> {
  const { data: row, error } = await supabase
    .from("prayer_answers")
    .insert({ letter_id: letterId, author: data.author || "익명", content: data.content })
    .select()
    .single();
  if (error) throw error;
  return {
    id: row.id,
    author: row.author,
    content: row.content,
    createdAt: row.created_at,
  };
}
