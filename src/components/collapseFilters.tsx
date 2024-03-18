import { MutableRefObject, ReactNode, useEffect, useRef, useState } from "react";

interface CollapseOptions {
    title: string,
    children: ReactNode,
    className?: string
}

/** Collapse component */
export const CollapseFilters: React.FC<CollapseOptions> = ({title, children, className}) => {
    const [show,setShow] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null) as MutableRefObject<HTMLDivElement>;

    useEffect(()=>{
        if(contentRef && contentRef.current && contentRef.current.scrollHeight && show) {
            contentRef.current.style.height = "max-content";
        }
    },[contentRef,children]);

    return (
        <div title={title} ref={contentRef} style={ show ? { height: contentRef.current.scrollHeight + "px" } : { height: "38px" }} 
        className={`mb-0 flex ${className} flex-col border rounded-md dark:border-gray-400 border-zinc-800 h-14 overflow-hidden transition-height duration-300 ease-in-out`}>
            <button id="collapse-button" style={{borderBottomWidth:'1px'}} className="w-full border-black dark:border-white flex flex-row justify-between items-center outline-none p-3 transition-all duration-300" onClick={(e)=>setShow(!show)}>
                <p className="text-xs text-zinc-800 dark:text-gray-200">{title}</p>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`z-20 ${show ? 'rotate-180 duration-300' : ''} transition-all duration-500 w-3 h-3 text-zinc-800 dark:text-gray-200`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
            <div id="collapse-content" className="px-4 mb-4 mt-2" >
                {children}
            </div>
        </div>
    );
};