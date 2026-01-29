-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.chapters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  novel_id uuid NOT NULL,
  user_id uuid DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text DEFAULT ''::text,
  order_index integer NOT NULL,
  word_count integer DEFAULT 0,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  volume_id uuid,
  summary text,
  deleted_at timestamp with time zone,
  CONSTRAINT chapters_pkey PRIMARY KEY (id),
  CONSTRAINT chapters_novel_id_fkey FOREIGN KEY (novel_id) REFERENCES public.novels(id),
  CONSTRAINT chapters_volume_id_fkey FOREIGN KEY (volume_id) REFERENCES public.volumes(id)
);
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  title text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  is_pinned boolean DEFAULT false,
  pinned_at timestamp with time zone,
  CONSTRAINT conversations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  user_id uuid DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])),
  content text NOT NULL,
  model text,
  tokens integer,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  thinking text,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
);
CREATE TABLE public.news (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type = ANY (ARRAY['feature'::text, 'update'::text, 'announcement'::text, 'community'::text])),
  title text NOT NULL,
  content text NOT NULL,
  image text,
  link text,
  author text,
  status text DEFAULT 'published'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])),
  priority integer DEFAULT 0,
  read_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT news_pkey PRIMARY KEY (id)
);
CREATE TABLE public.novel_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  novel_id uuid NOT NULL,
  user_id uuid DEFAULT gen_random_uuid(),
  title text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  is_pinned boolean DEFAULT false,
  pinned_at timestamp with time zone,
  CONSTRAINT novel_conversations_pkey PRIMARY KEY (id),
  CONSTRAINT novel_conversations_novel_id_fkey FOREIGN KEY (novel_id) REFERENCES public.novels(id)
);
CREATE TABLE public.novel_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  novel_id uuid NOT NULL,
  user_id uuid DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])),
  content text NOT NULL,
  model text,
  tokens integer,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  thinking text,
  CONSTRAINT novel_messages_pkey PRIMARY KEY (id),
  CONSTRAINT novel_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.novel_conversations(id),
  CONSTRAINT novel_messages_novel_id_fkey FOREIGN KEY (novel_id) REFERENCES public.novels(id)
);
CREATE TABLE public.novels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover text,
  category text,
  tags ARRAY DEFAULT '{}'::text[],
  word_count integer DEFAULT 0,
  chapter_count integer DEFAULT 0,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  published_at timestamp with time zone,
  characters jsonb DEFAULT '[]'::jsonb,
  order_index integer NOT NULL DEFAULT 0,
  relationships jsonb NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT novels_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  website text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  api_key text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.volumes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  novel_id uuid NOT NULL,
  user_id uuid DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  order_index integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at timestamp with time zone,
  CONSTRAINT volumes_pkey PRIMARY KEY (id),
  CONSTRAINT volumes_novel_id_fkey FOREIGN KEY (novel_id) REFERENCES public.novels(id)
);