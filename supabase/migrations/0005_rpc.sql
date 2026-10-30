-- =============================================================================
-- 0005 — Fonctions RPC transactionnelles (transitions de statut)
-- Chaque fonction : valide les préconditions, écrit les horodatages côté serveur,
-- insère notification + audit DANS LA MÊME transaction. Idempotentes (double clic).
-- Les erreurs métier sont des codes stables dans le message d'exception.
-- =============================================================================

create function private.rpc_begin()
returns uuid language plpgsql set search_path = ''
as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED' using errcode = 'P0001'; end if;
  if not private.is_active_user() then raise exception 'ACCOUNT_BLOCKED' using errcode = 'P0001'; end if;
  perform set_config('mosali.rpc', '1', true);   -- local à la transaction
  return v_uid;
end;
$$;

create function private.offer_result(p_id uuid)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object('id', o.id, 'status', o.status, 'published_at', o.published_at,
                            'closed_at', o.closed_at, 'deadline', o.deadline)
  from public.offers o where o.id = p_id
$$;

-- ---- UC-1 Publier -----------------------------------------------------------
create function public.publish_offer(p_offer_id uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid; v_offer public.offers; v_profile public.profiles;
  v_missing text[] := '{}'; v_skills int;
begin
  v_uid := private.rpc_begin();
  select * into v_offer from public.offers where id = p_offer_id and owner_id = v_uid for update;
  if not found then raise exception 'OFFER_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_offer.status = 'active' then return private.offer_result(p_offer_id); end if;  -- idempotent
  if v_offer.status <> 'draft' then raise exception 'INVALID_STATUS' using errcode = 'P0001'; end if;

  select * into v_profile from public.profiles where id = v_uid;
  if v_profile.active_casquette <> 'porteur' then raise exception 'CASQUETTE_REQUIRED' using errcode = 'P0001'; end if;
  if v_profile.identity_status <> 'approved' then raise exception 'IDENTITY_REQUIRED' using errcode = 'P0001'; end if;

  select count(*) into v_skills from public.offer_skills where offer_id = p_offer_id;
  if v_offer.description is null or char_length(v_offer.description) < 30 then v_missing := v_missing || 'description'; end if;
  if v_offer.category_id   is null then v_missing := v_missing || 'category_id';   end if;
  if v_offer.budget_min    is null then v_missing := v_missing || 'budget_min';    end if;
  if v_offer.budget_max    is null then v_missing := v_missing || 'budget_max';    end if;
  if v_offer.duration_days is null then v_missing := v_missing || 'duration_days'; end if;
  if v_offer.contract_type is null then v_missing := v_missing || 'contract_type'; end if;
  if v_offer.deadline      is null then v_missing := v_missing || 'deadline';      end if;
  if v_skills = 0                 then v_missing := v_missing || 'skills';        end if;
  if array_length(v_missing, 1) > 0 then
    raise exception 'MISSING_FIELDS' using errcode = 'P0001', detail = array_to_string(v_missing, ',');
  end if;

  -- Hypothèse §4.7 : date limite obligatoire, durée de vie maximale 90 jours.
  if v_offer.deadline <= now() or v_offer.deadline > now() + interval '90 days' then
    raise exception 'INVALID_DEADLINE' using errcode = 'P0001';
  end if;

  update public.offers set status = 'active', published_at = now() where id = p_offer_id;
  perform private.notify(v_uid, 'offer', 'Offre publiée', v_offer.title, '/mes-offres/' || p_offer_id);
  perform private.write_audit(v_uid, 'offers', 'publish', p_offer_id, 'medium',
    jsonb_build_object('status', 'draft'), jsonb_build_object('status', 'active'));
  return private.offer_result(p_offer_id);
end;
$$;

-- ---- UC-2 Clôturer (mission pourvue, irréversible) --------------------------
create function public.close_offer(p_offer_id uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid; v_offer public.offers;
begin
  v_uid := private.rpc_begin();
  select * into v_offer from public.offers where id = p_offer_id and owner_id = v_uid for update;
  if not found then raise exception 'OFFER_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_offer.status = 'filled' then return private.offer_result(p_offer_id); end if;   -- idempotent
  if v_offer.status <> 'active' then raise exception 'INVALID_STATUS' using errcode = 'P0001'; end if;

  update public.offers set status = 'filled', closed_at = now() where id = p_offer_id;
  -- Package 3 : ajouter ici (ou via trigger conditionnel) applications pending -> closed.
  perform private.notify(v_uid, 'offer', 'Offre clôturée', v_offer.title, '/mes-offres/' || p_offer_id);
  perform private.write_audit(v_uid, 'offers', 'close_offer', p_offer_id, 'medium',
    jsonb_build_object('status', 'active'), jsonb_build_object('status', 'filled'));
  return private.offer_result(p_offer_id);
end;
$$;

-- ---- Dépublier / annuler ----------------------------------------------------
create function public.cancel_offer(p_offer_id uuid, p_reason text default null)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid; v_offer public.offers;
begin
  v_uid := private.rpc_begin();
  select * into v_offer from public.offers where id = p_offer_id and owner_id = v_uid for update;
  if not found then raise exception 'OFFER_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_offer.status = 'cancelled' then return private.offer_result(p_offer_id); end if;
  if v_offer.status <> 'active' then raise exception 'INVALID_STATUS' using errcode = 'P0001'; end if;

  update public.offers set status = 'cancelled', closed_at = now() where id = p_offer_id;
  perform private.notify(v_uid, 'offer', 'Offre annulée', v_offer.title, '/mes-offres/' || p_offer_id);
  perform private.write_audit(v_uid, 'offers', 'cancel_offer', p_offer_id, 'medium',
    jsonb_build_object('status', 'active'),
    jsonb_build_object('status', 'cancelled', 'reason', left(p_reason, 500)));
  return private.offer_result(p_offer_id);
end;
$$;

-- ---- Prolonger la date limite ----------------------------------------------
create function public.extend_offer_deadline(p_offer_id uuid, p_new_deadline timestamptz)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid; v_offer public.offers;
begin
  v_uid := private.rpc_begin();
  select * into v_offer from public.offers where id = p_offer_id and owner_id = v_uid for update;
  if not found then raise exception 'OFFER_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_offer.status <> 'active' then raise exception 'INVALID_STATUS' using errcode = 'P0001'; end if;
  if p_new_deadline <= greatest(now(), coalesce(v_offer.deadline, now()))
     or p_new_deadline > now() + interval '90 days' then
    raise exception 'INVALID_DEADLINE' using errcode = 'P0001';
  end if;

  update public.offers set deadline = p_new_deadline, expiry_notified_at = null where id = p_offer_id;
  perform private.write_audit(v_uid, 'offers', 'extend_deadline', p_offer_id, 'low',
    jsonb_build_object('deadline', v_offer.deadline), jsonb_build_object('deadline', p_new_deadline));
  return private.offer_result(p_offer_id);
end;
$$;

-- ---- UC-4 Modération --------------------------------------------------------
create function public.moderate_remove_offer(p_offer_id uuid, p_reason text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid; v_offer public.offers;
begin
  v_uid := private.rpc_begin();
  if private.current_app_role() not in ('moderator', 'super_admin') then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;
  if p_reason is null or char_length(btrim(p_reason)) < 5 then
    raise exception 'REASON_REQUIRED' using errcode = 'P0001';
  end if;
  select * into v_offer from public.offers where id = p_offer_id for update;
  if not found then raise exception 'OFFER_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_offer.status = 'cancelled' and v_offer.is_moderated then return private.offer_result(p_offer_id); end if;
  if v_offer.status <> 'active' then raise exception 'INVALID_STATUS' using errcode = 'P0001'; end if;

  update public.offers
     set status = 'cancelled', is_moderated = true, moderation_reason = btrim(p_reason), closed_at = now()
   where id = p_offer_id;
  update public.offer_reports set status = 'actioned' where offer_id = p_offer_id and status = 'open';
  perform private.notify(v_offer.owner_id, 'system', 'Offre retirée par la modération',
    'Motif : ' || btrim(p_reason), '/mes-offres/' || p_offer_id);
  perform private.write_audit(v_uid, 'offers', 'moderate_remove', p_offer_id, 'high',
    jsonb_build_object('status', 'active'),
    jsonb_build_object('status', 'cancelled', 'reason', btrim(p_reason)));
  return private.offer_result(p_offer_id);
end;
$$;

create function public.moderate_restore_offer(p_offer_id uuid, p_justification text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid; v_offer public.offers;
begin
  v_uid := private.rpc_begin();
  if private.current_app_role() <> 'super_admin' then raise exception 'FORBIDDEN' using errcode = 'P0001'; end if;
  if p_justification is null or char_length(btrim(p_justification)) < 5 then
    raise exception 'REASON_REQUIRED' using errcode = 'P0001';
  end if;
  select * into v_offer from public.offers where id = p_offer_id for update;
  if not found then raise exception 'OFFER_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_offer.status = 'active' then return private.offer_result(p_offer_id); end if;
  -- Point §4.5 : seul le rétablissement d'une offre retirée par modération est permis.
  if v_offer.status <> 'cancelled' or not v_offer.is_moderated then
    raise exception 'INVALID_STATUS' using errcode = 'P0001';
  end if;
  if v_offer.deadline is not null and v_offer.deadline <= now() then
    raise exception 'INVALID_DEADLINE' using errcode = 'P0001';
  end if;

  update public.offers
     set status = 'active', is_moderated = false, moderation_reason = null, closed_at = null
   where id = p_offer_id;
  perform private.notify(v_offer.owner_id, 'system', 'Offre rétablie', v_offer.title, '/mes-offres/' || p_offer_id);
  perform private.write_audit(v_uid, 'offers', 'moderate_restore', p_offer_id, 'high',
    jsonb_build_object('status', 'cancelled', 'reason', v_offer.moderation_reason),
    jsonb_build_object('status', 'active', 'justification', btrim(p_justification)));
  return private.offer_result(p_offer_id);
end;
$$;

-- Signaler sans retirer (note interne)
create function public.flag_offer(p_offer_id uuid, p_note text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid; v_report uuid;
begin
  v_uid := private.rpc_begin();
  if private.current_app_role() not in ('moderator', 'super_admin') then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;
  if p_note is null or char_length(btrim(p_note)) < 3 then raise exception 'REASON_REQUIRED' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.offers where id = p_offer_id and status = 'active') then
    raise exception 'OFFER_NOT_FOUND' using errcode = 'P0001';
  end if;
  insert into public.offer_reports (offer_id, reporter_id, reason) values (p_offer_id, v_uid, btrim(p_note))
    returning id into v_report;
  perform private.write_audit(v_uid, 'offers', 'flag_offer', p_offer_id, 'medium', null,
    jsonb_build_object('report_id', v_report));
  return jsonb_build_object('report_id', v_report);
end;
$$;

-- ---- Expiration automatique (appelée par pg_cron) ---------------------------
create function private.expire_offers()
returns void language plpgsql security definer set search_path = ''
as $$
begin
  perform set_config('mosali.rpc', '1', true);

  with soon as (
    update public.offers set expiry_notified_at = now()
     where status = 'active' and expiry_notified_at is null
       and deadline > now() and deadline <= now() + interval '3 days'   -- J-3 (§4.7)
    returning id, owner_id, title
  )
  insert into public.notifications (user_id, category, title, body, link)
  select owner_id, 'offer', 'Votre offre expire bientôt', title, '/mes-offres/' || id from soon;

  with expired as (
    update public.offers set status = 'expired', closed_at = now()
     where status = 'active' and deadline < now()
    returning id, owner_id, title
  ), notified as (
    insert into public.notifications (user_id, category, title, body, link)
    select owner_id, 'offer', 'Votre offre a expiré', title, '/mes-offres/' || id from expired
    returning 1
  )
  insert into public.audit_logs (actor_id, module, action_type, entity_id, criticality, after)
  select null, 'offers', 'expire', id, 'low', jsonb_build_object('status', 'expired') from expired;
end;
$$;

-- ---- Privilèges d'exécution : authenticated uniquement ----------------------
revoke all on function public.publish_offer(uuid)                       from public, anon;
revoke all on function public.close_offer(uuid)                         from public, anon;
revoke all on function public.cancel_offer(uuid, text)                  from public, anon;
revoke all on function public.extend_offer_deadline(uuid, timestamptz)  from public, anon;
revoke all on function public.moderate_remove_offer(uuid, text)         from public, anon;
revoke all on function public.moderate_restore_offer(uuid, text)        from public, anon;
revoke all on function public.flag_offer(uuid, text)                    from public, anon;
grant execute on function public.publish_offer(uuid)                      to authenticated;
grant execute on function public.close_offer(uuid)                        to authenticated;
grant execute on function public.cancel_offer(uuid, text)                 to authenticated;
grant execute on function public.extend_offer_deadline(uuid, timestamptz) to authenticated;
grant execute on function public.moderate_remove_offer(uuid, text)        to authenticated;
grant execute on function public.moderate_restore_offer(uuid, text)       to authenticated;
grant execute on function public.flag_offer(uuid, text)                   to authenticated;
revoke all on function private.expire_offers() from public, anon, authenticated;
