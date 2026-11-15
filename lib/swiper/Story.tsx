type StoryProps = {
  title?: string
  category?: string
  duration?: number
  accentColor?: string
  /** CSS variables painting the project's pattern (`patternStyle()`). */
  pattern?: Record<string, string>
  /** Zero-based chapter index; shifts the pattern so each chapter differs. */
  chapter?: number
  closeButton?: boolean
  onClose?: () => void
  children: React.ReactNode
}

export default function Story({
  title,
  category,
  duration,
  accentColor,
  pattern,
  chapter = 0,
  closeButton = true,
  onClose,
  children,
}: StoryProps) {
  return (
    <div className="swiper-slide select-none" data-duration={duration}>
      {/* The slide's colour and pattern live on this inner element, not on
          the slide: Swiper owns the slide's style attribute and removes it
          whenever the slider is destroyed (e.g. re-created by React), which
          would silently drop React's inline variables. */}
      <div
        className="story-surface"
        aria-hidden="true"
        data-pattern={pattern ? '' : undefined}
        style={{ '--project-accent': accentColor, '--chapter': chapter, ...pattern } as React.CSSProperties}
      />
      <div className="stories-slider-user project-header">
        {title && <div className="stories-slider-user-name">{title}</div>}
        {category && <div className="stories-slider-user-date">{category}</div>}
      </div>

      {closeButton && (
        <div className="stories-slider-actions">
          <button
            type="button"
            className="stories-slider-close-button"
            aria-label="Close story"
            onClick={onClose}
          />
        </div>
      )}

      <div className="stories-slider-content">
        <div className="story-body">{children}</div>
      </div>
    </div>
  )
}
