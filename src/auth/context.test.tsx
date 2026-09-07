import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  onAuthStateChange: vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  }),
  signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
}))

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: { auth: authMocks },
}))

import { AuthProvider } from './context'
import { useAuth } from './useAuth'

function AuthControls() {
  const { isLoading, signInWithGoogle, signOut } = useAuth()

  return (
    <>
      <span>{isLoading ? 'Loading' : 'Ready'}</span>
      <button type="button" onClick={() => void signInWithGoogle()}>
        Sign in
      </button>
      <button type="button" onClick={() => void signOut()}>
        Sign out
      </button>
    </>
  )
}

describe('AuthProvider', () => {
  it('restores a session and delegates Google login and logout to Supabase', async () => {
    render(
      <AuthProvider>
        <AuthControls />
      </AuthProvider>,
    )

    expect(await screen.findByText('Ready')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    await waitFor(() => {
      expect(authMocks.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: new URL(window.location.pathname, window.location.origin).toString(),
        },
      })
      expect(authMocks.signOut).toHaveBeenCalledOnce()
    })
  })
})
