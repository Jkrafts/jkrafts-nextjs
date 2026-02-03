'use client';

import { ProjectSlide } from "@/data/projects";

interface ChallengeSlideProps {
  data: ProjectSlide & { index: number};
}

const ChallengeSlide = ({ data }: ChallengeSlideProps) => {
  
  const { title, body, index } = data;

  return (
     <div className="flex flex-col justify-around gap-12 text-center">
      <h3 className="font-heading text-xl">
        <span>{index + 1}.</span>&nbsp;
        {title}
      </h3>

      <div>
        {body}
      </div>
    </div>
  );
}

export default ChallengeSlide;