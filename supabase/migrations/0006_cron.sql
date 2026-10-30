-- =============================================================================
-- 0006 — Expiration automatique des offres (pg_cron)
-- pg_cron doit être activé (Dashboard > Database > Extensions). Sinon, planifier
-- une Edge Function appelant private.expire_offers() via un wrapper sécurisé.
-- =============================================================================
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.unschedule(jobid) from cron.job where jobname = 'mosali-expire-offers';
    perform cron.schedule('mosali-expire-offers', '*/15 * * * *', 'select private.expire_offers()');
  else
    raise notice 'pg_cron indisponible : expiration non planifiée (voir commentaire).';
  end if;
end $$;
