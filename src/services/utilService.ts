import confetti from "canvas-confetti";
import { injectable } from "inversify";
import React from "react";

// noinspection JSUnusedGlobalSymbols
/**
 * Service to handle code utility operations
 */
@injectable()
export class UtilService {

    constructor(){
        
    }

    /**
     * Format a date time string
     * @required @param dateTimeStr
     * Date time string for formatting
     */
    formatDateTime(dateTimeStr: string): string {
        const date = new Date(dateTimeStr);
    
        // Pad single digit numbers with leading zeros
        const pad = (n: number) => n.toString().padStart(2, '0');
    
        const year = date.getUTCFullYear();
        const month = pad(date.getUTCMonth() + 1);
        const day = pad(date.getUTCDate());
        const hours = pad(date.getUTCHours());
        const minutes = pad(date.getUTCMinutes());
        const seconds = pad(date.getUTCSeconds());
    
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    /** Get regex for validating email address */
    getEmailRegex(): RegExp{
        // eslint-disable-next-line no-control-regex
        return new RegExp(/(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i);
    }

    /**Get current datetime string for region where this app will be running */
    getCurrentDateTime(): string{
        return new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString();
    }

    /**show error related to an input field and scroll to the fiels
     * @required @param elementRef
     * Element reference that has an error
     * @required @param content
     * Error message to display
     */
    handleErrorInputField(
        elementRef: React.RefObject<HTMLElement>,
        content: string
      ) {
        if (elementRef.current) {
          // Set the innerHTML
          elementRef.current.innerHTML = content;
      
          // Scroll to the element
          elementRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /** Run snow confetti animation*/
    runSnow = () => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        let skew = 1;
    
        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }
    
        (function frame() {
            const timeLeft = animationEnd - Date.now();
            const ticks = Math.max(200, 500 * (timeLeft / duration));
            skew = Math.max(0.8, skew - 0.001);
    
        confetti({
            particleCount: 2,
            startVelocity: 1,
            ticks: ticks,
            origin: {
            x: Math.random(),
            // since particles fall down, skew start toward the top
            y: (Math.random() * skew) - 0.2
            },
            colors: ['#FF6600'],
            shapes: ['circle'],
            gravity: randomInRange(0.4, 0.6),
            scalar: randomInRange(0.4, 1),
            drift: randomInRange(-0.4, 0.4)
        });
    
        if (timeLeft > 0) {
            requestAnimationFrame(frame);
        }
        }());
    };
}