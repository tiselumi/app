import { beforeEach, describe, expect, it, vi } from 'vitest'

const realtimeMocks = vi.hoisted(() => {
  const channel = {
    on: vi.fn(),
    subscribe: vi.fn(),
  }
  return {
    channel,
    createChannel: vi.fn(),
    removeChannel: vi.fn().mockResolvedValue('ok'),
  }
})

vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: realtimeMocks.createChannel,
    removeChannel: realtimeMocks.removeChannel,
  },
}))

import { subscribeToCloudPresetChanges } from './realtimePresetSync'

describe('realtime preset synchronization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    realtimeMocks.createChannel.mockReturnValue(realtimeMocks.channel)
    realtimeMocks.channel.on.mockReturnValue(realtimeMocks.channel)
    realtimeMocks.channel.subscribe.mockReturnValue(realtimeMocks.channel)
  })

  it('subscribes to changes for the signed-in user and removes the channel on cleanup', () => {
    const onChange = vi.fn()
    const cleanup = subscribeToCloudPresetChanges('user-one', onChange)

    expect(realtimeMocks.createChannel).toHaveBeenCalledWith('mixes:user-one')
    expect(realtimeMocks.channel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'mixes',
        filter: 'user_id=eq.user-one',
      },
      onChange,
    )

    cleanup()
    expect(realtimeMocks.removeChannel).toHaveBeenCalledWith(realtimeMocks.channel)
  })

  it('refreshes after database changes and WebSocket reconnections', () => {
    const onChange = vi.fn()
    subscribeToCloudPresetChanges('user-one', onChange)

    const databaseChange = realtimeMocks.channel.on.mock.calls[0]?.[2]
    const statusChange = realtimeMocks.channel.subscribe.mock.calls[0]?.[0]

    databaseChange?.()
    statusChange?.('SUBSCRIBED')
    statusChange?.('SUBSCRIBED')

    expect(onChange).toHaveBeenCalledTimes(2)
  })
})
