import { createClient } from '@/lib/supabase/client'

export async function uploadFile(file: File, bucket: string) {
  const supabase = createClient()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return publicUrl
}

export async function deleteFile(path: string, bucket: string) {
  const supabase = createClient()
  await supabase.storage.from(bucket).remove([path])
}
