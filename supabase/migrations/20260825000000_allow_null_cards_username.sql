-- OAuth tabanlı Next.js uygulaması kart sahipliğini user_id ve RLS ile yönetir.
-- Legacy Streamlit uygulaması username göndermeye devam edebilir.
alter table public.cards
  alter column username drop not null;
