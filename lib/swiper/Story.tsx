import Pattern1 from '@/public/pattern_1.svg'
import Pattern2 from '@/public/pattern_2.svg'
import Pattern3 from '@/public/pattern_3.svg'
import Pattern4 from '@/public/pattern_4.svg'
import Pattern5 from '@/public/pattern_5.svg'

type ProjectSlideProps = {
  title?: string
  subtitle?: string
  category?: string
  slideIndex: number
  duration?: number
  accentColor?: string
  projectCoverImage?: React.ReactNode

  closeButton?: boolean
  onClose?: () => void

  children: React.ReactNode
}

const patterns = [
  Pattern1,
  Pattern2,
  Pattern3,
  Pattern4,
  Pattern5,
];

export default function Story({
  title,
  subtitle,
  category,
  duration,
  accentColor,
  slideIndex,
  closeButton = true,
  onClose,
  children,
  ...rest
}: ProjectSlideProps) {
   const patternIndex = slideIndex % patterns.length;
  return (
    <div
      className="swiper-slide select-none"
      data-duration={duration}
      style={{ '--project-accent': accentColor, '--stories-slider-bg-img': `url(${patterns[patternIndex].src})` } as React.CSSProperties}
      {...rest}
    >
      {/* Header */}
      <div className="stories-slider-user project-header">
        <div className="project-meta">
          {title && <div className="stories-slider-user-name">{title}</div>}
          {subtitle && (
            <div className="stories-slider-user-date">{subtitle}</div>
          )}
          {category && <span className="project-category">{category}</span>}
        </div>
      </div>

      {/* Close */}
      {closeButton && (
        <div className="stories-slider-actions">
          <button
            type="button"
            className="stories-slider-close-button"
            onClick={onClose}
          />
        </div>
      )}

      {/* Content */}
      <div className="stories-slider-content bg-black/50 backdrop-blur-sm bg-blend-overlay">
        <div className="stories-slider-content-inner px-10">
          {children}
        </div>
      </div>
    </div>
  )
}
