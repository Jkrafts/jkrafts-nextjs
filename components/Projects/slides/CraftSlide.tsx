'use client';

import { ProjectSlide } from "@/data/projects";

interface CraftSlideProps {
  data: ProjectSlide & {
    index: number;
    skills: string[];
  };
}

const CraftSlide = ({ data }: CraftSlideProps) => {
  
  const { title, bullets, index, skills } = data;

  return (
    <div className="flex flex-col justify-around gap-12 text-center">
      <h3 className="font-heading text-xl">
        <span>{index + 1}.</span>&nbsp;
        {title}
      </h3>

      <div>
        {bullets && (
          <ul className="space-y-4 list-disc list-inside">
            {bullets.map((bullet, idx) => (
              <li key={idx}>{bullet}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {skills && skills.map((skill, index) => (
          <span key={index} className="px-3 py-1 bg-gray-500 rounded-full text-sm">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

export default CraftSlide;