'use client';

import Image from 'next/image';
import { ProjectSlide } from "@/data/projects";

interface ProcessSlideProps {
  data: ProjectSlide & {
    index: number;
  };
}

const ProcessSlide = ({ data }: ProcessSlideProps) => {
    const { title, media, index } = data;
  return (
    <div className="flex flex-col justify-around gap-12">
      <h3 className="font-heading text-xl text-center">
        <span>{index + 1}.</span>&nbsp;
        {title}
      </h3>

      <div>
        {media && (
          media.type === 'image' ? (
            <Image
              src={media.src}
              alt={title || 'Process Image'}
              width={800}
              height={600}
              className="mx-auto"
              />
          ) : (
            <video
              src={media.src}
              controls
              className="mx-auto"  
            />
          )
        )}
      </div>
    </div>
  );
}

export default ProcessSlide;