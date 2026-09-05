import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { App } from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('tiselumi:onboarding_seen_v1', 'true')
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

  it('shows welcome modal on first visit and opens mood matcher when clicking Try as Guest', () => {
    localStorage.clear() // Fresh visitor
    render(<App />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Welcome to Tiselumi')).toBeInTheDocument()

    const tryBtn = screen.getByRole('button', { name: /Try as Guest/i })
    fireEvent.click(tryBtn)

    // Welcome modal closes and Mood Matcher opens
    expect(screen.getByText('Match Your Mood')).toBeInTheDocument()
  })

  it('opens a separate login modal when clicking Log In in header', () => {
    render(<App />)

    const loginHeaderBtn = screen.getByRole('button', { name: 'Log In' })
    fireEvent.click(loginHeaderBtn)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Log in')).toBeInTheDocument()
    expect(screen.queryByLabelText('Mix name')).not.toBeInTheDocument()
  })

  it('saves guest mixes across reloads and deletes them persistently', async () => {
    const view = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Deep Calm/i }))
    await screen.findByRole('button', { name: /Pause mix/i })
    fireEvent.click(screen.getByRole('button', { name: /sounds? playing/i }))
    fireEvent.click(await screen.findByRole('button', { name: /Save mix/i }))
    fireEvent.change(screen.getByLabelText('Mix name'), { target: { value: 'My evening' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save in this browser' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    view.unmount()
    const reload = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /✨\s*My evening/ }))
    expect(await screen.findByRole('button', { name: /Pause mix/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Delete mix: My evening' }))
    reload.unmount()
    render(<App />)
    expect(screen.queryByText('My evening')).not.toBeInTheDocument()
  })

  it('keeps the form open when browser storage refuses a save', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Deep Calm/i }))
    await screen.findByRole('button', { name: /Pause mix/i })
    fireEvent.click(screen.getByRole('button', { name: /sounds? playing/i }))
    fireEvent.click(await screen.findByRole('button', { name: /Save mix/i }))
    fireEvent.change(screen.getByLabelText('Mix name'), { target: { value: 'Unsaved' } })
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save in this browser' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Could not save')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    write.mockRestore()
    fireEvent.click(screen.getByRole('button', { name: 'Save in this browser' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('ignores malformed stored presets', () => {
    localStorage.setItem(
      'tiselumi:custom_presets_v2',
      JSON.stringify([null, { id: 'bad', name: 'Broken', tracks: { unknown: 4 } }]),
    )
    render(<App />)
    expect(screen.queryByText('Broken')).not.toBeInTheDocument()
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

  it('opens mood matcher, toggles multiple mood tags, and generates active mix', async () => {
    render(<App />)

    // Open mood matcher drawer
    const trigger = screen.getByRole('button', { name: /Mood Matcher/i })
    fireEvent.click(trigger)

    expect(screen.getByText('Match Your Mood')).toBeInTheDocument()

    // Click "Insomnia" mood
    const insomniaBtn = screen.getByRole('button', { name: /Insomnia/i })
    fireEvent.click(insomniaBtn)

    // Master bar should appear with active sounds
    expect(
      await screen.findByRole('complementary', { name: /Master control/i }),
    ).toBeInTheDocument()

    // Click "Anxiety Relief" as second mood (multi-tag combination)
    const anxietyBtn = screen.getByRole('button', { name: /Anxiety Relief/i })
    fireEvent.click(anxietyBtn)

    expect(screen.getByText(/Up to 3 moods combined/i)).toBeInTheDocument()

    // Reset moods
    const resetBtn = screen.getByRole('button', { name: /Reset/i })
    fireEvent.click(resetBtn)

    expect(screen.queryByRole('button', { name: /Reset/i })).not.toBeInTheDocument()
  })

  it('opens and dismisses the freemium save mix modal', async () => {
    render(<App />)

    // Start a preset to have active sounds
    const presetBtn = screen.getByRole('button', { name: /Deep Calm/i })
    fireEvent.click(presetBtn)

    // Open the master bar drawer
    const activeCountBtn = await screen.findByRole('button', { name: /sounds? playing/i })
    fireEvent.click(activeCountBtn)

    // Click "Save mix" button
    const saveMixBtn = await screen.findByRole('button', { name: /Save mix/i })
    fireEvent.click(saveMixBtn)

    // Save modal should be visible with EN texts
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Save Custom Soundscapes')).toBeInTheDocument()
    expect(screen.getByText(/Saved only in this browser/)).toBeInTheDocument()

    // Click "Continue as Guest"
    const continueBtn = screen.getByRole('button', { name: /Continue as Guest/i })
    fireEvent.click(continueBtn)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders localized modal text in Russian and recovers from corrupted history', async () => {
    // Inject corrupted history in localStorage
    localStorage.setItem(
      'tiselumi:mood_history_v1',
      JSON.stringify([{ invalid: 'broken' }, null, 'garbage']),
    )

    render(<App />)

    // Switch to Russian
    const ruButton = screen.getByRole('button', { name: 'RU' })
    fireEvent.click(ruButton)

    // Start a preset to have active sounds
    const presetBtn = screen.getByRole('button', { name: /Глубокий покой/i })
    fireEvent.click(presetBtn)

    // Open master drawer
    const activeCountBtn = await screen.findByRole('button', {
      name: /звук.* играет|звук.* играют/i,
    })
    fireEvent.click(activeCountBtn)

    // Click save mix
    const saveMixBtn = await screen.findByRole('button', { name: /Сохранить микс/i })
    fireEvent.click(saveMixBtn)

    expect(screen.getByText('Сохранение персональных миксов')).toBeInTheDocument()
    expect(screen.getByText(/миксы сохраняются только в текущем браузере/)).toBeInTheDocument()
  })

  it('allows pausing and resuming the active mix without losing selected tracks', async () => {
    render(<App />)

    // Start a preset with active tracks
    const presetBtn = screen.getByRole('button', { name: /Deep Calm/i })
    fireEvent.click(presetBtn)

    // Find Pause button in Master bar
    const pauseBtn = await screen.findByRole('button', { name: /Pause mix/i })
    expect(pauseBtn).toBeInTheDocument()

    // Click Pause
    fireEvent.click(pauseBtn)

    // Should now show Resume mix and paused status indicator
    const resumeBtn = await screen.findByRole('button', { name: /Resume mix/i })
    expect(resumeBtn).toBeInTheDocument()
    expect(screen.getByText(/paused/i)).toBeInTheDocument()

    // Track count should remain intact
    expect(screen.getByText(/sounds? playing/i)).toBeInTheDocument()

    // Click Resume
    fireEvent.click(resumeBtn)
    expect(await screen.findByRole('button', { name: /Pause mix/i })).toBeInTheDocument()

    // Click Clear mix (Stop all)
    const clearBtn = screen.getByRole('button', { name: /Clear mix/i })
    fireEvent.click(clearBtn)

    // Master bar should disappear because mix is cleared
    expect(screen.queryByRole('button', { name: /Pause mix/i })).not.toBeInTheDocument()
  })

  it('opens immersive fullscreen while playing and exits on tap', async () => {
    render(<App />)

    // Start a preset so the mix is playing
    const presetBtn = screen.getByRole('button', { name: /Deep Calm/i })
    fireEvent.click(presetBtn)

    // Open the immersive overlay
    const immersiveBtn = await screen.findByRole('button', { name: /Focus mode/i })
    fireEvent.click(immersiveBtn)

    const overlay = await screen.findByRole('dialog', { name: /Immersion/i })
    expect(overlay).toBeInTheDocument()

    // Tap anywhere on the overlay to come back
    fireEvent.click(overlay)

    expect(screen.queryByRole('dialog', { name: /Immersion/i })).not.toBeInTheDocument()
  })
})
