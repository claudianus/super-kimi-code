import { z } from 'zod';

export const memoryKindSchema = z.enum(['semantic', 'episodic', 'procedural', 'prospective', 'governance']);
export type MemoryKind = z.infer<typeof memoryKindSchema>;

export const memoryScopeSchema = z.enum(['user', 'workspace', 'session']);
export type MemoryScope = z.infer<typeof memoryScopeSchema>;

export const memoryStatusSchema = z.enum(['active', 'archived', 'superseded', 'deleted']);
export type MemoryStatus = z.infer<typeof memoryStatusSchema>;

export const memorySourceRefSchema = z.object({
  kind: z.enum(['user', 'tool', 'auto', 'import', 'system']),
  session_id: z.string().optional(),
  agent_id: z.string().optional(),
  turn_id: z.number().optional(),
  message_id: z.string().optional(),
  excerpt: z.string().optional(),
});
export type MemorySourceRef = z.infer<typeof memorySourceRefSchema>;

export const memoryRecordSchema = z.object({
  id: z.string().min(1),
  kind: memoryKindSchema,
  scope: memoryScopeSchema,
  scope_key: z.string().optional(),
  subject: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  confidence: z.number(),
  importance: z.number(),
  status: memoryStatusSchema,
  source: memorySourceRefSchema,
  created_at: z.number(),
  updated_at: z.number(),
  accessed_at: z.number().optional(),
  access_count: z.number(),
  valid_from: z.number().optional(),
  valid_to: z.number().optional(),
  supersedes: z.array(z.string()),
  superseded_by: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()),
});
export type MemoryRecord = z.infer<typeof memoryRecordSchema>;

export const memorySearchResultSchema = z.object({
  memory: memoryRecordSchema,
  score: z.number(),
  reasons: z.array(z.string()),
});
export type MemorySearchResult = z.infer<typeof memorySearchResultSchema>;
