'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/upload'
import { Button } from '@/components/Button'

export function CreatePost() {
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !media) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let mediaUrl = null
      if (media) mediaUrl = await uploadFile(media, 'posts')

      await supabase.from('posts').insert({
        user_id: user.id,
        content: content.trim(),
        media_urls: mediaUrl ? [mediaUrl] : []
      })

      setContent('')
      setMedia(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-current/10 rounded-xl mb-6"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What's happening?"
          className="w-full bg-transparent resize-none text-lg"
          rows={3}
        />
        <div className="flex items-center justify-between">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setMedia(e.target.files?.[0] || null)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="p-2 rounded-full hover:bg-current/5 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </button>
          <Button disabled={loading || (!content.trim() && !media)}>
            {loading ? 'Posting...' : 'Post'}
          </Button>
        </div>
        {media && <div className="text-sm opacity-70">📎 {media.name}</div>}
      </form>
    </motion.div>
  )
}
