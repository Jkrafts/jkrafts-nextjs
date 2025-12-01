'use client';

import { useState } from 'react';
import ScrollStack, { ScrollStackItem } from '@/components/ScrollStack';
import useForceRerender from '@/hooks/useForceRerender';

export const ScrollStackContainer = () => {

  const [key, forceRerender] = useForceRerender();
  const [itemDistance, setItemDistance] = useState(200);
  const [itemStackDistance, setItemStackDistance] = useState(30);
  const [baseScale, setBaseScale] = useState(0.85);
  const [rotationAmount, setRotationAmount] = useState(0);
  const [blurAmount, setBlurAmount] = useState(0);
  const [stackPosition, setStackPosition] = useState('30%');
  const [scaleEndPosition, setscaleEndPosition] = useState('10%');

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ScrollStack
        // key={key}
        itemDistance={itemDistance}
        itemStackDistance={itemStackDistance}
        stackPosition={stackPosition}
        baseScale={baseScale}
        scaleEndPosition={scaleEndPosition}
        rotationAmount={rotationAmount}
        blurAmount={blurAmount}
        useWindowScroll={true}
      >
        <ScrollStackItem itemClassName='bg-red-500'>
          <h2>Card 1</h2>
          <p>This is the first card in the stack</p>
        </ScrollStackItem>
        
        <ScrollStackItem itemClassName='bg-blue-500'>
          <h2>Card 2</h2>
          <p>This is the second card in the stack</p>
        </ScrollStackItem>
        <ScrollStackItem itemClassName='bg-green-500'>
          <h2>Card 3</h2>
          <p>This is the third card in the stack</p>
        </ScrollStackItem>
      </ScrollStack>
    </div>
  )
}
