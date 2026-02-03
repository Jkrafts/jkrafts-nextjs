import React, { useEffect, useRef } from 'react'
import createStoriesSlider from '@/vendor/swiper/stories-slider/stories-slider.esm.js'

import { Swiper, SwiperModule } from 'swiper/types'

type ProjectsSliderProps = {
  Swiper: any
  EffectCube?: SwiperModule
  Virtual?: SwiperModule
  enabled?: boolean
  autoplayDuration?: number

  onProjectsSlider?: (instance: any) => void
  onSlidesIndexesChange?: (mainIndex:number, subIndex: number) => void
  onAutoplayStart?: () => void
  onAutoplayStop?: () => void
  onEnd?: () => void

  children: React.ReactNode
}

export default function StoriesSlider({
  Swiper,
  EffectCube,
  Virtual,
  enabled = true,
  autoplayDuration = 6000,
  onProjectsSlider,
  onSlidesIndexesChange,
  onAutoplayStart,
  onAutoplayStop,
  onEnd,
  children,
  ...rest
}: ProjectsSliderProps) {
  const elRef = useRef<HTMLDivElement | null>(null)
  const sliderRef = useRef<any>(null)

  useEffect(() => {
    if (!elRef.current) return

    sliderRef.current = createStoriesSlider(elRef.current, {
      Swiper,
      EffectCube,
      Virtual,
      enabled,
      autoplayDuration,
      onSlidesIndexesChange,
      onAutoplayStart,
      onAutoplayStop,
      onEnd,
    })

    onProjectsSlider?.(sliderRef.current)

    return () => {
      sliderRef.current?.destroy?.()
    }
  }, [
    elRef,
    sliderRef,
    Swiper,
    EffectCube,
    Virtual,
    enabled,
    autoplayDuration,
    onSlidesIndexesChange,
    onAutoplayStart,
    onAutoplayStop,
    onEnd,
    onProjectsSlider,
  ])

  return (
    <div className="stories-slider projects-slider" ref={elRef} {...rest}>
      <div className="swiper">
        <div className="swiper-wrapper">{children}</div>
      </div>
    </div>
  )
}
