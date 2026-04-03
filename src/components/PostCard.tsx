'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { useRealtimeLikes, useRealtimeComments } from '@/hooks/useRealtime'
import { Heart, MessageCircle, Share, Bookmark } from 'lucide-react'

interface PostCardProps {
  post: any
}

export function PostCard({ post }: PostCardProps) {
  const { likes, liked, toggleLike } = useRealtimeLikes(post.id)
  const comments = useRealtimeComments(post.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-current/10 rounded-xl"
    >
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-full bg-current/10 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{post.profiles?.username || 'User'}</span>
            <span className="opacity-50 text-sm">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
          </div>

          {post.content && <p className="mb-3">{post.content}</p>}

          {post.media_urls?.length > 0 && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img src={post.media_urls[0]} alt="" className="w-full" />
            </div>
          )}

          <div className="flex items-center gap-6 pt-2">
            <button onClick={toggleLike} className={`flex items-center gap-2 ${liked ? 'text-red-500' : ''}`}>
              <motion.div whileTap={{ scale: 1.3 }}>
                <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
              </motion.div>
              <span className="text-sm">{likes}</span>
            </button>
            
            <button className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
              <MessageCircle size={18} />
              <span className="text-sm">{comments.length}</span>
            </button>
            
            <button className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
              <Share size={18} />
              <span className="text-sm">{post.shares_count || 0}</span>
            </button>
            
            <button className="ml-auto opacity-70 hover:opacity-100 transition-opacity">
              <Bookmark size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
