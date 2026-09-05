import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/i18n/context'
import { SleepTimerControl } from './SleepTimerControl'

describe('SleepTimerControl', () => {
  it('starts a manually configured duration in hours, minutes, and seconds', () => {
    const onStartTimer = vi.fn()

    render(
      <I18nProvider>
        <SleepTimerControl
          secondsLeft={null}
          isActive={false}
          onStartTimer={onStartTimer}
          onCancelTimer={vi.fn()}
        />
      </I18nProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Sleep Timer' }))
    fireEvent.change(screen.getByLabelText('Hours'), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText('Seconds'), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Start timer' }))

    expect(onStartTimer).toHaveBeenCalledWith(3723)
  })

  it('shows the active duration in hours, minutes, and seconds', () => {
    render(
      <I18nProvider>
        <SleepTimerControl
          secondsLeft={3723}
          isActive
          onStartTimer={vi.fn()}
          onCancelTimer={vi.fn()}
        />
      </I18nProvider>,
    )

    expect(screen.getByRole('button', { name: 'Sleep Timer' })).toHaveTextContent('01:02:03')
  })
})
