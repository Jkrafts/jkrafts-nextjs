type ProjectProps = {
  children: React.ReactNode
}

export default function Stories({ children, ...rest }: ProjectProps) {
  return (
    <div className="swiper-slide project-slide" {...rest}>
      <div className="swiper">
        <div className="swiper-wrapper">{children}</div>
      </div>
    </div>
  )
}
