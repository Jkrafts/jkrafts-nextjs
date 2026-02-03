'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { projects } from '@/data/projects';
import ProjectsSlider, { StorySliderHandle } from '@/components/Projects/ProjectsSlider';{}
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Scrollbar } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';


const Page: React.FC = () => {
  
  const storySliderRef = useRef<StorySliderHandle | null>(null);

  return (
    <div className="h-svh flex flex-col justify-center items-center">

      <div className="mb-12 text-center select-none">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-extrabold text-text z-10">
          Project Stories
        </h1>
        <p className="text-center mt-4 mb-8 text-text">
          Tap on a project to explore the idea, craft and execution.
        </p>
      </div>

      <div className="w-full max-w-7xl mx-auto">
        <div className="flex overflow-x-auto gap-x-8 project-stories relative">
          <Swiper
            spaceBetween={32}
            slidesPerView={5}
            navigation={{
              enabled: true,
              nextEl: '.projects-next',
              prevEl: '.projects-prev',
            }}
            scrollbar={{ 
              el: '.swiper-projects-scrollbar',
              draggable: true 
            }}
            modules={[Navigation,Scrollbar]}
            className="pb-8! px-4!"
          >

            {projects.map((project, index) => (
              <SwiperSlide
                key={index}
                onClick={() => storySliderRef.current?.open(index)}
                className="w-60 shrink-0 flex flex-col gap-4  justify-center items-center cursor-pointer select-none"
              >
                <div className="p-4 h-32 w-32 mx-auto border rounded-full text-center project-stories-avatar">
                  <Image 
                    src={'https://picsum.photos/200'} 
                    alt={project.title} 
                    width={128} 
                    height={128} 
                    draggable={false}
                    className="rounded-full object-cover mx-auto" 
                  />
                </div>

                <div className="mt-auto">
                  <h2 className="project-stories-name text-center">
                    {project.title}
                  </h2>
                </div>
              </SwiperSlide>
            ))}

            {/* Scrollbar */}
              <div className='swiper-projects-scrollbar h-2 absolute bottom-4 inset-x-0 cursor-grab active:cursor-grabbing'></div>

          </Swiper>

          {/* Navigation Buttons */}
          <div className="projects-prev absolute left-0 top-1/3 -translate-y-1/3 z-10 w-10 h-10 bg-black/50 dark:bg-white dark:text-black cursor-pointer backdrop-blur-sm rounded-full flex justify-center items-center project-stories-nav project-stories-prev">
            ‹
          </div>
          <div className="projects-next absolute right-0 top-1/3 -translate-y-1/3 z-10 w-10 h-10 bg-black/50 dark:bg-white dark:text-black cursor-pointer backdrop-blur-sm rounded-full flex justify-center items-center project-stories-nav project-stories-next">
            ›
          </div>
        </div>
      </div>

      <ProjectsSlider ref={storySliderRef} projects={projects} />

    </div>
  );
};

export default Page;
