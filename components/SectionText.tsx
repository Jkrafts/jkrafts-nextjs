'use client';


const SectionText = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="overflow-hidden py-10 md:py-16 lg:py-20 px-4 md:px-8 lg:px-16 h-svh flex flex-col items-center justify-center gap-y-8 lg:gap-y-12">
      {children}
    </div>
  );
}

const SectionHeading = ({ children }: { children: React.ReactNode }) => {
  return (
    <h2 className="font-instrument font-medium text-center text-3xl md:text-4xl lg:text-6xl">
      {children}
    </h2>
  );
}

const SectionParagraph = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="text-lg md:text-2xl text-center max-w-4xl font-manrope">
      {children}
    </div>
  );
}

SectionText.Heading = SectionHeading;
SectionText.Paragraph = SectionParagraph;

export default SectionText;