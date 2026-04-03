'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useRealtimePosts() {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    let mounted = true

    const fetchPosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false })
        .limit(50)
      if (mounted) setPosts(data || [])
    }

    fetchPosts()

    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, 
        () => fetchPosts()
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  return posts
}

export function useRealtimeLikes(postId: string) {
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    const fetchLikes = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { count } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', postId)
      setLikes(count || 0)

      const { data } = await supabase.from('likes').select('*').eq('post_id', postId).eq('user_id', user.id).maybeSingle()
      setLiked(!!data)
    }

    fetchLikes()

    const channel = supabase
      .channel(`public:likes:${postId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes', filter: `post_id=eq.${postId}` }, 
        () => fetchLikes()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [postId])

  const toggleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (liked) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id)
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
    }
  }

  return { likes, liked, toggleLike }
}

export function useRealtimeComments(postId: string) {
  const [comments, setComments] = useState<any[]>([])

  useEffect(() => {
    const fetchComments = async () => {
      const { data } = await supabase
        .from('comments')
        .select('*, profiles(*)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      setComments(data || [])
    }

    fetchComments()

    const channel = supabase
      .channel(`public:comments:${postId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, 
        () => fetchComments()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [postId])

  return comments
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('*, actor:profiles!actor_id(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.read).length || 0)
    }

    fetchNotifications()

    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, 
        () => fetchNotifications()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return { notifications, unreadCount }
}
