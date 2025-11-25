import { useEffect, useRef, useState } from "react";
import { ScreenshotFrame } from "./ScreenshotFrame";

interface StorySectionProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
  step: string;
  isScreenshot?: boolean;
}

export function StorySection({ title, description, image, imageAlt, reverse, step, isScreenshot = false }: StorySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center py-20 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${reverse ? "md:grid-flow-dense" : ""}`}
    >
      {/* Image side */}
      <div className={`relative group ${reverse ? "md:col-start-2" : ""}`}>
        {!isScreenshot && (
          <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        )}
        
        {isScreenshot ? (
          <div className="relative">
            <ScreenshotFrame 
              image={image}
              alt={imageAlt}
              variant="browser"
            />
            {/* Glass overlay with step number */}
            <div className="absolute top-10 left-10 w-16 h-16 rounded-2xl bg-white/90 dark:bg-card/90 backdrop-blur-glass border border-white/20 flex items-center justify-center shadow-glass z-10">
              <span className="text-2xl font-heading font-bold text-primary">
                {step}
              </span>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl shadow-elegant border border-border/50">
            <img
              src={image}
              alt={imageAlt}
              className="w-full h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* Glass overlay with step number */}
            <div className="absolute top-6 left-6 w-16 h-16 rounded-2xl bg-white/80 dark:bg-card/80 backdrop-blur-glass border border-white/20 flex items-center justify-center shadow-glass">
              <span className="text-2xl font-heading font-bold text-primary">
                {step}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content side */}
      <div className={reverse ? "md:col-start-1 md:row-start-1" : ""}>
        <div className="space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            Passo {step}
          </div>
          
          <h3 className="text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight">
            {title}
          </h3>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* Decorative architectural lines */}
          <div className="flex gap-3 pt-4">
            <div className="h-1 w-20 bg-primary rounded-full" />
            <div className="h-1 w-12 bg-accent rounded-full" />
            <div className="h-1 w-8 bg-arch-gold rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
