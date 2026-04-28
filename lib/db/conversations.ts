import { getServerSupabase } from "@/lib/db/client";
import type {
  ConversationChannel,
  ConversationMessage,
  ConversationRecord,
} from "@/lib/types";

interface UpsertConversationInput {
  id?: string | null;
  clerkUserId: string;
  channel: ConversationChannel;
  title: string;
  messages: ConversationMessage[];
  model?: string;
  providerId?: string;
}

interface ConversationRow {
  id: string;
  clerk_user_id: string;
  channel: string;
  title: string;
  messages: unknown;
  model: string | null;
  provider_id: string | null;
  created_at: string;
  updated_at: string;
}

function rowToRecord(row: ConversationRow): ConversationRecord {
  return {
    channel: row.channel as ConversationChannel,
    clerkUserId: row.clerk_user_id,
    createdAt: row.created_at,
    id: row.id,
    messages: (row.messages ?? []) as ConversationMessage[],
    model: row.model ?? undefined,
    providerId: row.provider_id ?? undefined,
    title: row.title,
    updatedAt: row.updated_at,
  };
}

export async function upsertConversation(
  input: UpsertConversationInput
): Promise<ConversationRecord> {
  const db = getServerSupabase();
  const messagesJson = JSON.parse(JSON.stringify(input.messages));

  if (input.id) {
    const { data: existing } = await db
      .from("conversations")
      .select("*")
      .eq("id", input.id)
      .single();

    const existingRow = existing as ConversationRow | null;

    if (existingRow && existingRow.clerk_user_id === input.clerkUserId) {
      const { data, error } = await db
        .from("conversations")
        .update({
          messages: messagesJson,
          model: input.model ?? null,
          provider_id: input.providerId ?? null,
          title: input.title,
        } as never)
        .eq("id", input.id)
        .select("*")
        .single();

      if (error) {
        throw error;
      }
      return rowToRecord(data as ConversationRow);
    }
  }

  const { data, error } = await db
    .from("conversations")
    .insert({
      channel: input.channel,
      clerk_user_id: input.clerkUserId,
      messages: messagesJson,
      model: input.model ?? null,
      provider_id: input.providerId ?? null,
      title: input.title,
    } as never)
    .select("*")
    .single();

  if (error) {
    throw error;
  }
  return rowToRecord(data as ConversationRow);
}

export async function listConversations(
  clerkUserId: string,
  channel?: ConversationChannel,
  limit = 20
): Promise<ConversationRecord[]> {
  const db = getServerSupabase();

  let query = db
    .from("conversations")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (channel) {
    query = query.eq("channel", channel);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return ((data ?? []) as ConversationRow[]).map(rowToRecord);
}

export async function getConversation(
  id: string,
  clerkUserId: string
): Promise<ConversationRecord | null> {
  const db = getServerSupabase();

  const { data, error } = await db
    .from("conversations")
    .select("*")
    .eq("id", id)
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return rowToRecord(data as ConversationRow);
}

export async function deleteConversation(
  id: string,
  clerkUserId: string
): Promise<boolean> {
  const db = getServerSupabase();

  const { error } = await db
    .from("conversations")
    .delete()
    .eq("id", id)
    .eq("clerk_user_id", clerkUserId);

  if (error) {
    throw error;
  }
  return true;
}

export async function countUserConversations(
  clerkUserId: string,
  channel?: ConversationChannel
): Promise<number> {
  const db = getServerSupabase();

  let query = db
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("clerk_user_id", clerkUserId);

  if (channel) {
    query = query.eq("channel", channel);
  }

  const { count, error } = await query;
  if (error) {
    throw error;
  }
  return count ?? 0;
}
