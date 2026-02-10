'use client';

const IntroText = () => {
  return (
    <div className="overflow-hidden py-10 md:py-16 lg:py-20 px-6 md:px-8 lg:px-16 h-svh flex flex-col items-center justify-center gap-y-8 lg:gap-y-12">
      <h2 className="font-instrument font-medium text-center text-3xl md:text-4xl lg:text-6xl">
        The Story Behind Jkrafts
      </h2>

      <div className="te">
        <p className="text-lg md:text-2xl text-center max-w-4xl font-manrope">
          Jkrafts was born from a simple idea — the web should work as good as it looks. Over time, that idea evolved into a practice focused on building purposeful digital solutions that support businesses, not just decorate them.

          I believe in clean code, thoughtful design, and long-term thinking. Every project is approached with care, curiosity, and attention to detail.
        </p>
      </div>
    </div>
  );
}

export default IntroText;