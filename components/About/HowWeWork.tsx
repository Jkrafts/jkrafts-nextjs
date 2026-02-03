'use client';

import SectionText from "../SectionText";

const HowWeWork = () => {
  return (
    <>
      <SectionText>
        <SectionText.Heading>How We Work</SectionText.Heading>
        <SectionText.Paragraph>Our process is designed to ensure quality and efficiency at every step.</SectionText.Paragraph>

        <SectionText.Paragraph>
          <div className="space-y-4 flex flex-col justify-center items-center">
            <ol className="text-justify list-disc">
              <li>Discover — Understand your goals and constraints</li>
              <li>Define — Shape the right solution</li>
              <li>Design — Clean, usable, intentional interfaces</li>
              <li>Build — Scalable, secure, maintainable code</li>
              <li>Refine — Improve, optimize, and grow</li>
            </ol>
          </div>
        </SectionText.Paragraph>
      </SectionText>
    </>
  );
}

export default HowWeWork;