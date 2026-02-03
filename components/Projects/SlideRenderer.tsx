import CoverSlide from './slides/CoverSlide';
import ChallengeSlide from './slides/ChallengeSlide';
import CraftSlide from './slides/CraftSlide';
import ProcessSlide from './slides/ProcessSlide';
import ResultSlide from './slides/ResultSlide';

export function SlideRenderer({ slide }: { slide: any }) {
  
  switch (slide.type) {
    case 'challenge':
      return <ChallengeSlide data={slide} />;

    case 'craft':
      return <CraftSlide data={slide} />;

    case 'process':
      return <ProcessSlide data={slide} />;

    case 'result':
      return <ResultSlide data={slide} />;

    default:
      return <CoverSlide data={slide} />;
  }
}
