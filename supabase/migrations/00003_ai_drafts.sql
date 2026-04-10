-- ============================================
-- 00003 — AI draft bundles
-- ============================================
-- Widens poi_drafts.field to allow 'ai_bundle', so a single row can
-- store the full multi-field JSON suggestion produced by the
-- /api/pois/[id]/generate-draft endpoint.

alter table public.poi_drafts
  drop constraint if exists poi_drafts_field_check;

alter table public.poi_drafts
  add constraint poi_drafts_field_check
  check (field in ('description','short_description','ai_bundle'));
