'use client';

import { useEffect, useState } from 'react';

const shapes = ['circle', 'square', 'diamond'] as const;
type Shape = (typeof shapes)[number];

export default function Loader() {
    const [currentShape, setCurrentShape] = useState<Shape>('circle');

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentShape((prevShape) => {
                const currentIndex = shapes.indexOf(prevShape);
                return shapes[(currentIndex + 1) % shapes.length];
            });
        }, 1000); // Change shape every 1 second (increased from 2 seconds)

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-white via-docmosaic-sage/10 to-docmosaic-cream z-50">
            <div className="w-20 h-20 relative">
                <div
                    className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                        currentShape === 'circle'
                            ? 'bg-[#C4D6B0] rounded-full'
                            : currentShape === 'square'
                              ? 'border-8 border-[#381D2A] bg-transparent'
                              : 'bg-[#FFA552] rotate-45'
                    }`}
                    style={{
                        clipPath:
                            currentShape === 'circle'
                                ? 'circle(50% at 50% 50%)'
                                : currentShape === 'square'
                                  ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
                                  : 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    }}
                />
            </div>
        </div>
    );
}
