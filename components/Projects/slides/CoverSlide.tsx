'use client';

import { ProjectSlide } from "@/data/projects";

interface CoverSlideProps {
  data: ProjectSlide;
}

const CoverSlide = ({ data }: CoverSlideProps) => {
  return (
    <>
      <div className="banner-wrapper">
        <div className="banner" style={{ '--accent-color': `${data?.accentColor}` } as React.CSSProperties}>
          <div className="icon"><i className="fa-brands fa-codepen"></i></div>
          <div className="title font-heading">{data?.title}</div>
          <div className="descr font-instrument">{data?.body}</div>
        </div>
      </div>
    </>
  );
}

export default CoverSlide;