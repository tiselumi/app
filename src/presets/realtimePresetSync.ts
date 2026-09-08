import { supabase } from '@/lib/supabase'

export function subscribeToCloudPresetChanges(userId: string, onChange: () => void): () => void {
  if (!supabase) return () => undefined

  const client = supabase
  let hasSubscribed = false
  const channel = client
    .channel(`mixes:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'mixes',
        filter: `user_id=eq.${userId}`,
      },
      onChange,
    )
    .subscribe((status) => {
      if (status !== 'SUBSCRIBED') return
      if (hasSubscribed) onChange()
      hasSubscribed = true
    })

  return () => {
    void client.removeChannel(channel)
  }
}
