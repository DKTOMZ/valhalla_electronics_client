import { CarouselImage } from "@/models/carouselImage";
import React, {useCallback, useEffect, useState} from "react";
import "@/app/globals.css";

interface CarouselProps {
  images: CarouselImage[],
  timeout?: number,
  autoScroll?: boolean
}


/**
 * Carousel Slider component
 */
const CarouselSlider: React.FC<CarouselProps> = ({images, timeout=5000, autoScroll=true}) => {
  const [currentIndex, setCurrentIndex] = useState(0); // create state to keep track of images index, set the default index to 0
  const [maxHeight, setMaxHeight] = useState(0);

  const slideRight = () => {
    setCurrentIndex((currentIndex + 1) % images.length); // increases index by 1
  };

  const slideLeft = useCallback(() => {
    const nextIndex = currentIndex - 1;
    if (nextIndex < 0) {
      setCurrentIndex(images.length - 1); // returns last index of images array if index is less than 0
    } else {
      setCurrentIndex(nextIndex);
    }
  },[currentIndex, images.length]);

  useEffect(()=>{
    if(autoScroll) {
      const interval = setInterval(()=>{
        slideLeft();
      },timeout);
      return () => clearInterval(interval);
    }
  },[autoScroll, currentIndex, images.length, slideLeft, timeout]);

  useEffect(() => {
    // Calculate and set the height of the carousel to match the tallest image
    let maxHeight = 999;
    images.forEach((image) => {
      const img = new Image();
      img.src = image.source;
      img.onload = () => {
        if (img.height < maxHeight) {
          maxHeight = img.height;
          setMaxHeight(maxHeight);
        }
      };
    });
  }, [images]);

  
  return (
    images.length > 0 && (
      <div className="flex flex-row w-full h-full justify-center items-center mb-16 relative">
        <button title="slide left" className="p-1 absolute z-10 left-0 text-3xl bg-orange-500 md:hover:bg-orange-400 max-md:active:bg-orange-400 text-white" onClick={slideLeft}>{"<"}</button>
        {images.map((image,index)=>{
          return <img style={index === currentIndex ? {maxHeight:maxHeight}: {}} key={index} className={`dark:brightness-75 transition-opacity object-cover duration-1000 ${index === currentIndex ? 'opacity-100 w-full md:w-4/5 lg:w-3/5' : 'opacity-0 max-h-0 max-w-0 '}`} src={image.source} alt={image.label} />
        })}
        <button title="slide right" className="p-1 absolute right-0 text-3xl bg-orange-500 md:hover:bg-orange-400 max-md:active:bg-orange-400 text-white" onClick={slideRight}>{">"}</button>
        <div className="flex flex-row absolute -bottom-6">
          {images.map((_image,index)=>{
            return <div key={index} className={`h-1 w-8 mx-1 ${index === currentIndex ? 'bg-orange-400' : 'dark:bg-zinc-500 bg-gray-400'}`}></div>
          })}
        </div>
        <button className="absolute z-10 top-3/4 bg-orange-500 w-2/5 max-sm:w-3/5 text-ellipsis text-lg overflow-hidden whitespace-nowrap md:hover:bg-orange-400 max-md:active:bg-orange-400 py-1 md:py-2 px-2 rounded-md text-white">{images[currentIndex].label}</button>
      </div>
    )
  );
};

export default CarouselSlider;