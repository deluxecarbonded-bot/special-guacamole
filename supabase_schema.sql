-- Enable extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists uuid-ossp;

-- Profiles table
create table profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  banner_url text,
  followers_count integer default 0,
  following_count integer default 0,
  posts_count integer default 0,
  is_verified boolean default false,
  is_private boolean default false,
  last_seen timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Follows table
create table follows (
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- Posts table
create table posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  content text,
  media_urls text[] default '{}',
  media_type text,
  likes_count integer default 0,
  comments_count integer default 0,
  shares_count integer default 0,
  views_count integer default 0,
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Likes table
create table likes (
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- Comments table
create table comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  likes_count integer default 0,
  parent_id uuid references comments(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Comment likes table
create table comment_likes (
  user_id uuid references profiles(id) on delete cascade not null,
  comment_id uuid references comments(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, comment_id)
);

-- Stories table
create table stories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  media_url text not null,
  media_type text not null,
  views_count integer default 0,
  expires_at timestamptz not null default now() + interval '24 hours',
  created_at timestamptz default now()
);

-- Story views table
create table story_views (
  story_id uuid references stories(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (story_id, user_id)
);

-- Messages table
create table messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Notifications table
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  actor_id uuid references profiles(id) on delete cascade,
  type text not null,
  post_id uuid references posts(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  read boolean default false,
  created_at timestamptz default now()
);

-- Bookmarks table
create table bookmarks (
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- RLS Policies
alter table profiles enable row level security;
alter table follows enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;
alter table comment_likes enable row level security;
alter table stories enable row level security;
alter table story_views enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table bookmarks enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

-- Follows policies
create policy "Follows are viewable by everyone" on follows for select using (true);
create policy "Users can follow others" on follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on follows for delete using (auth.uid() = follower_id);

-- Posts policies
create policy "Posts are viewable by everyone" on posts for select using (true);
create policy "Users can create posts" on posts for insert with check (auth.uid() = user_id);
create policy "Users can update their own posts" on posts for update using (auth.uid() = user_id);
create policy "Users can delete their own posts" on posts for delete using (auth.uid() = user_id);

-- Likes policies
create policy "Likes are viewable by everyone" on likes for select using (true);
create policy "Users can like posts" on likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike posts" on likes for delete using (auth.uid() = user_id);

-- Comments policies
create policy "Comments are viewable by everyone" on comments for select using (true);
create policy "Users can comment on posts" on comments for insert with check (auth.uid() = user_id);
create policy "Users can update their own comments" on comments for update using (auth.uid() = user_id);
create policy "Users can delete their own comments" on comments for delete using (auth.uid() = user_id);

-- Comment likes policies
create policy "Comment likes are viewable by everyone" on comment_likes for select using (true);
create policy "Users can like comments" on comment_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike comments" on comment_likes for delete using (auth.uid() = user_id);

-- Stories policies
create policy "Stories are viewable by everyone" on stories for select using (expires_at > now());
create policy "Users can create stories" on stories for insert with check (auth.uid() = user_id);
create policy "Users can delete their own stories" on stories for delete using (auth.uid() = user_id);

-- Story views policies
create policy "Story views are viewable by story owner" on story_views for select using (auth.uid() = (select user_id from stories where id = story_id));
create policy "Users can view stories" on story_views for insert with check (true);

-- Messages policies
create policy "Users can view their messages" on messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send messages" on messages for insert with check (auth.uid() = sender_id);

-- Notifications policies
create policy "Users can view their notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can mark notifications read" on notifications for update using (auth.uid() = user_id);

-- Bookmarks policies
create policy "Users can view their bookmarks" on bookmarks for select using (auth.uid() = user_id);
create policy "Users can bookmark posts" on bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can remove bookmarks" on bookmarks for delete using (auth.uid() = user_id);

-- Realtime publication
alter publication supabase_realtime add table posts, likes, comments, follows, messages, notifications, stories;

-- Trigger functions
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
