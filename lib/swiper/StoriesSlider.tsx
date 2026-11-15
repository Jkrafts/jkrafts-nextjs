import React, { useEffect, useRef } from 'react'
import createStoriesSlider from '@/vendor/swiper/stories-slider/stories-slider.esm.js'

import type { SwiperModule } from 'swiper/types'

type StoriesSliderProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Swiper: any
  EffectCube?: SwiperModule
  Virtual?: SwiperModule
  enabled?: boolean
  autoplayDuration?: number
  /** Keep the viewer on one story: its end calls `onEnd` instead of moving on. */
  lockStory?: boolean

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onProjectsSlider?: (instance: any) => void
  onSlidesIndexesChange?: (mainIndex: number, subIndex: number) => void
  onAutoplayStart?: () => void
  onAutoplayStop?: () => void
  onEnd?: () => void
  /** With `lockStory`: the last slide's time is up (the story stays open). */
  onComplete?: () => void

  children: React.ReactNode
}

/**
 * React wrapper around the vendored UI Initiative stories slider. All
 * callback props must be referentially stable: the slider is re-created
 * whenever any of them changes.
 */
export default function StoriesSlider({
  Swiper,
  EffectCube,
  Virtual,
  enabled = true,
  autoplayDuration = 6000,
  lockStory = false,
  onProjectsSlider,
  onSlidesIndexesChange,
  onAutoplayStart,
  onAutoplayStop,
  onEnd,
  onComplete,
  children,
  className,
  ...rest
}: StoriesSliderProps) {
  const elRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    const slider = createStoriesSlider(el, {
      Swiper,
      EffectCube,
      Virtual,
      enabled,
      autoplayDuration,
      lockStory,
      onSlidesIndexesChange,
      onAutoplayStart,
      onAutoplayStop,
      onEnd,
      onComplete,
    })

    onProjectsSlider?.(slider)

    return () => {
      slider?.destroy?.()
    }
  }, [
    Swiper,
    EffectCube,
    Virtual,
    enabled,
    autoplayDuration,
    lockStory,
    onSlidesIndexesChange,
    onAutoplayStart,
    onAutoplayStop,
    onEnd,
    onComplete,
    onProjectsSlider,
  ])

  return (
    <div className={`stories-slider projects-slider ${className ?? ''}`.trim()} ref={elRef} {...rest}>
      <p id="story-instructions" className="sr-only">
        Use the left and right arrow keys to move between chapters, Space to pause, and Escape to close.
      </p>
      <div className="swiper">
        <div className="swiper-wrapper">{children}</div>
      </div>
    </div>
  )
}
