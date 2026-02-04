'use client';

import CursorLink from "@/components/TargetCursor/CursorLink";
import { ProjectSlide } from "@/data/projects";

interface ResultSlideProps {
  data: ProjectSlide & {
    index: number;
  };
}

const ResultSlide = ({ data }: ResultSlideProps) => {
    const { title, body, index } = data;

  return (
    <div className="result-slide flex flex-col justify-around gap-12 text-center">
      <h3 className="font-heading text-xl">
        <span>{index + 1}.</span>&nbsp;
        {title}
      </h3>

      <div>
        {body}
      </div>

      <div>
        <CursorLink href="/contact" className="pointer-events-auto! block mx-auto font-manrope text-lg md:text-xl bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition duration-300">Let&apos;s Talk &raquo;</CursorLink>
      </div>
    </div>
  );
}

export default ResultSlide;