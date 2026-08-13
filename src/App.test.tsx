import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from './App'

describe('App', () => {
  it('introduces the product and its purpose', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Tiselumi' })).toBeInTheDocument()
    expect(screen.getByText(/calm space to mix familiar sounds/i)).toBeInTheDocument()
  })
})
