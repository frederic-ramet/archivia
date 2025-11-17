'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';

interface PhotoZoomProps {
  src: string;
  alt: string;
}

export default function PhotoZoom({ src, alt }: PhotoZoomProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  return (
    <div className="bg-black rounded-lg overflow-hidden mb-8 relative">
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.5}
        maxScale={5}
        centerOnInit={true}
        onTransformed={(ref) => setZoomLevel(ref.state.scale)}
        doubleClick={{ disabled: false, mode: 'zoomIn' }}
        panning={{ disabled: false, velocityDisabled: false }}
        wheel={{ step: 0.1 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '0',
                paddingBottom: '66.67%',
              }}
              contentStyle={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  priority
                />
              </div>
            </TransformComponent>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2 bg-black bg-opacity-60 rounded-lg px-4 py-2 backdrop-blur-sm">
              <button
                onClick={() => zoomOut()}
                className="text-white hover:text-heritage-300 p-2 rounded transition"
                title="Zoom arrière"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>

              <div className="text-white text-sm font-mono min-w-[60px] text-center">
                {Math.round(zoomLevel * 100)}%
              </div>

              <button
                onClick={() => zoomIn()}
                className="text-white hover:text-heritage-300 p-2 rounded transition"
                title="Zoom avant"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>

              <div className="w-px h-6 bg-white bg-opacity-30 mx-1"></div>

              <button
                onClick={() => resetTransform()}
                className="text-white hover:text-heritage-300 p-2 rounded transition"
                title="Réinitialiser le zoom"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Instructions */}
            <div className="absolute top-4 right-4 z-20 bg-black bg-opacity-50 text-white text-xs px-3 py-2 rounded backdrop-blur-sm">
              Double-clic pour zoomer • Molette pour zoom • Glisser pour déplacer
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
