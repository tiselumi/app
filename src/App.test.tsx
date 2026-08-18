import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { App } from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the product branding, sound catalog, and presets in English by default', () => {
    render(<App />)

    expect(screen.getAllByText('Tiselumi').length).toBeGreaterThan(0)
    expect(screen.getByText(/Quiet your mind. Ease into sleep/i)).toBeInTheDocument()
    expect(screen.getByText('Rain on Window')).toBeInTheDocument()
    expect(screen.getByText('Night Train Cabin')).toBeInTheDocument()
    expect(screen.getByText('Brown Noise')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Deep Calm/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Night Sleeper Train/i })).toBeInTheDocument()
  })

  it('filters sounds when selecting a category tab', () => {
    render(<App />)

    // Click on "Focus Noise" category tab
    const noiseTab = screen.getByRole('tab', { name: /Focus Noise/i })
    fireEvent.click(noiseTab)

    expect(screen.getByText('Brown Noise')).toBeInTheDocument()
    expect(screen.getByText('Pink Noise')).toBeInTheDocument()
    expect(screen.getByText('White Noise')).toBeInTheDocument()
    // Other categories should be filtered out
    expect(screen.queryByText('Rain on Window')).not.toBeInTheDocument()
    expect(screen.queryByText('Night Train Cabin')).not.toBeInTheDocument()
  })

  it('filters sounds using the search input', () => {
    render(<App />)

    const searchInput = screen.getByRole('textbox', { name: /Search sounds/i })
    fireEvent.change(searchInput, { target: { value: 'train' } })

    expect(screen.getByText('Night Train Cabin')).toBeInTheDocument()
    expect(screen.getByText('Rhythmic Rail Clatter')).toBeInTheDocument()
    expect(screen.queryByText('Brown Noise')).not.toBeInTheDocument()
    expect(screen.queryByText('Ocean Waves')).not.toBeInTheDocument()
  })

  it('allows switching language between English and Russian', () => {
    render(<App />)

    // Switch to Russian
    const ruButton = screen.getByRole('button', { name: 'RU' })
    fireEvent.click(ruButton)

    expect(screen.getByText(/Успокойте мысли. Погрузитесь в сон/i)).toBeInTheDocument()
    expect(screen.getByText('Дождь за окном')).toBeInTheDocument()
    expect(screen.getByText('Купе ночного поезда')).toBeInTheDocument()
    expect(screen.getByText('Коричневый шум')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Глубокий покой/i })).toBeInTheDocument()

    // Switch back to English
    const enButton = screen.getByRole('button', { name: 'EN' })
    fireEvent.click(enButton)

    expect(screen.getByText(/Quiet your mind. Ease into sleep/i)).toBeInTheDocument()
    expect(screen.getByText('Rain on Window')).toBeInTheDocument()
    expect(screen.getByText('Brown Noise')).toBeInTheDocument()
  })
})
