import { Card } from "@/models/card";
import { SectionEnum } from "@/models/sectionEnum";
import "@/app/globals.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSharedState } from "@/app/contexts/context";

interface CardListProps {
    items: Card[],
    section?: SectionEnum,
    paginate?: boolean,
    pageLength?: number,
    naviagteTo: string,
}

/** Card Grid component */
export const CardGrid: React.FC<CardListProps> = ({items,section,paginate=false,pageLength=10,naviagteTo}) => {

    const pages = Math.ceil(items.length/pageLength);

    const [currentPage,setCurrentPage] = useState(1);
    const [minPage, setMinPage] = useState(1);
    const [maxPage,setMaxPage] = useState(pages);
    const { currency, useCurrentCurrency } = useSharedState();

    const pageElements = [];

    if (paginate) {
        
        for (let i = minPage; i <= maxPage; i++) {
            pageElements.push(<button onClick={()=>setCurrentPage(i)} style={{borderRadius: '50%'}} key={i} className={`flex-shrink-0 text-lg ${currentPage === i ? 'bg-orange-600 text-white' : 'text-black dark:text-white'} flex flex-row items-center justify-center h-8 w-8`}>{i}</button>)
        }
    
    }

    useEffect(()=>{window.scrollTo(0,0);},[currentPage]);

    return <div> 
        <div className="grid mb-8 grid-flow-row gap-x-4 card-grid max-sm:hidden text-neutral-600 sm:grid-cols-2 md:grid-cols-3">
            {paginate ? items.filter((_item,index)=>(index >= (currentPage-1) * pageLength && index < currentPage * pageLength)).map((item,index)=>{
                return <div key={index} className="my-2 rounded dark:shadow-gray-500 md:hover:-translate-y-1 shadow-md shadow-zinc-700 bg-white dark:bg-slate-800 duration-500 md:dark:hover:shadow-orange-400 max-md:dark:active:shadow-orange-400 md:dark:hover:shadow-md max-md:dark:active:shadow-md md:hover:shadow-md max-md:active:shadow-md md:hover:shadow-orange-600 max-md:active:shadow-orange-600"
                >
                        <figure>
                            <Link href={`${naviagteTo}${section === SectionEnum.CATEGORIES ? '?category='+encodeURIComponent(item.title): '?id='+encodeURIComponent(item.id)}`}>
                                <img alt={item.title} src={item.image} className="rounded-t h-64 w-full object-cover dark:border-b-0 border-b border-b-gray-600" />
                            </Link>
                            {section !== SectionEnum.CATEGORIES ?
                            <figcaption className="p-4">
                                {section === SectionEnum.FLASH_SALES ? 
                                    <div className="flex flex-row items-start justify-between">
                                        <div>
                                            <div className="border text-sm rounded-sm text-white bg-orange-600 p-1 w-fit border-orange-600">{item.oldPrice ? Math.round((((item.price||0)-(item.oldPrice))/(item.oldPrice))*100)+"% off": null}</div>
                                            <p className="ml-1 text-orange-400">Deal</p>
                                        </div>
                                        <div className="flex flex-row items-start gap-x-3">
                                            <button title="add to favorites" className="text-orange-400 md:hover:text-gray-500 md:active:text-gray-500 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200"><i className="fa-solid fa-heart fa-lg"></i></button>
                                            <button title="add to cart"><i className="fa-solid fa-plus fa-lg text-orange-400 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i></button>
                                        </div>
                                    </div>
                                : null}
                                {section === SectionEnum.PRODUCTS || section === SectionEnum.FEATURED ? 
                                <div className="flex flex-row items-start justify-between">
                                    <div className="flex flex-row items-start gap-x-3">
                                        <button title="add to favorites" className="text-orange-400 md:hover:text-gray-500 max-md:active:text-gray-500 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200"><i className="fa-solid fa-heart fa-lg"></i></button>
                                        <button title="add to cart"><i className="fa-solid fa-plus fa-lg text-orange-400 md:dark:hover:text-gray-200 md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i></button>
                                    </div>
                                </div>
                                : null}
                                <div className="flex flex-row items-center gap-x-2">
                                    <p className="text-lg text-gray-800 dark:text-gray-100">
                                        {(currency?.symbol||'')+' '+useCurrentCurrency(item.price||0)}
                                    </p>
                                    {section === SectionEnum.FLASH_SALES ? <p className="text-sm line-through text-gray-800 dark:text-gray-300">Was: {(currency?.symbol||'')+' '+useCurrentCurrency(item.oldPrice||0)}</p> : null}
                                </div>
                                <small className="text-sm text-black dark:text-white">
                                    {item.title}
                                </small>
                            </figcaption>
                            : <figcaption>
                                <div className="text-black dark:text-white uppercase p-4">{item.title}</div>    
                            </figcaption>}
                        </figure>
                </div>
            }) : items.map((item,index)=>
                <div key={index} className="my-2 rounded dark:shadow-gray-500 md:hover:-translate-y-1 shadow-md shadow-zinc-700 bg-white dark:bg-slate-800 duration-500 md:dark:hover:shadow-orange-400 max-md:dark:active:shadow-orange-400 md:dark:hover:shadow-md max-md:dark:active:shadow-md md:hover:shadow-md max-md:active:shadow-md md:hover:shadow-orange-600 max-md:active:shadow-orange-600"
                >
                        <figure>
                            <Link  href={`${naviagteTo}${section === SectionEnum.CATEGORIES ? '?category='+encodeURIComponent(item.title): '?id='+encodeURIComponent(item.id)}`}>
                                <img alt={item.title} src={item.image} className="rounded-t h-56 xl:h-64 w-full object-cover dark:border-b-0 border-b border-b-gray-600" />
                            </Link>
                            {section !== SectionEnum.CATEGORIES ?
                            <figcaption className="p-4">
                                {section === SectionEnum.FLASH_SALES ? 
                                    <div className="flex flex-row items-start justify-between">
                                        <div>
                                            <div className="border text-sm rounded-sm text-white bg-orange-600 p-1 w-fit border-orange-600">{item.oldPrice ? Math.round((((item.price||0)-(item.oldPrice))/(item.oldPrice))*100)+"% off": null}</div>
                                            <p className="ml-1 text-orange-400">Deal</p>
                                        </div>
                                        <div className="flex flex-row items-start gap-x-3">
                                            <button title="add to favorites" className="text-orange-400 md:hover:text-gray-500 md:active:text-gray-500 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200"><i className="fa-solid fa-heart fa-lg"></i></button>
                                            <button title="add to cart"><i className="fa-solid fa-plus fa-lg text-orange-400 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i></button>
                                        </div>
                                    </div>
                                : null}
                                {section === SectionEnum.PRODUCTS ? 
                                <div className="flex flex-row items-start justify-between">
                                    <div className="flex flex-row items-start gap-x-3">
                                        <button title="add to favorites" className="text-orange-400 md:hover:text-gray-500 max-md:active:text-gray-500 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200"><i className="fa-solid fa-heart fa-lg"></i></button>
                                        <button title="add to cart"><i className="fa-solid fa-plus fa-lg text-orange-400 md:dark:hover:text-gray-200 md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i></button>
                                    </div>
                                </div>
                                : null}
                                <div className="flex flex-row items-center gap-x-2">
                                    <p className="text-lg text-gray-800 dark:text-gray-100">
                                        {(currency?.symbol||'')+' '+useCurrentCurrency(item.price||0)}
                                    </p>
                                    {section === SectionEnum.FLASH_SALES ? <p className="text-sm line-through text-gray-800 dark:text-gray-300">Was: {(currency?.symbol||'')+' '+useCurrentCurrency(item.oldPrice||0)}</p> : null}
                                </div>
                                <small className="text-sm text-black dark:text-white">
                                    {item.title}
                                </small>
                            </figcaption>
                            : <figcaption>
                                <div className="text-black dark:text-white uppercase p-4">{item.title}</div>    
                            </figcaption>}
                        </figure>
                </div>
            )}
        </div>
        {paginate ? items.filter((_item,index)=>(index >= (currentPage-1) * pageLength && index < currentPage * pageLength)).map((item,index)=>{
            return  <Link href={`${naviagteTo}${section === SectionEnum.CATEGORIES ? '?category='+encodeURIComponent(item.title): '?id='+encodeURIComponent(item.id)}`} key={index} className="sm:hidden mx-1 flex flex-row mb-4 gap-x-4 rounded-md shadow-sm shadow-zinc-700 bg-white dark:bg-slate-800 dark:shadow-slate-300 md:dark:hover:shadow-orange-400 max-md:dark:active:shadow-orange-400 md:dark:hover:shadow-md max-md:dark:active:shadow-md md:hover:shadow-md max-md:active:shadow-md md:hover:shadow-orange-600 max-md:active:shadow-orange-600">
            <div className="w-3/12 hoz-card2 h-32 flex-shrink-0">
                <img alt={item.title} src={item.image} className="rounded-t h-full w-full object-cover dark:border-l-0 border-l border-b-gray-600" />
            </div>
            <div className="text-black dark:text-white overflow-hidden">
                <h4 className="text-lg whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.title}</h4>
                {section !== SectionEnum.CATEGORIES ?
                <>
                    <div className="flex flex-row gap-x-3 items-center">
                        <p className="font-bold">{(currency?.symbol||'')+' '+useCurrentCurrency(item.price||0)}</p>
                        {section === SectionEnum.FLASH_SALES ? <p className="text-sm line-through text-gray-800 dark:text-gray-300">Was: {(currency?.symbol||'')+' '+useCurrentCurrency(item.oldPrice||0)}</p> : null}
                    </div>

                    {section === SectionEnum.FLASH_SALES ? <p className="ml-1 text-orange-400">Deal</p> : null}

                    <div className="flex flex-row items-start gap-x-3">
                        <button title="add to favorites" className="text-orange-400 md:hover:text-gray-500 max-md:active:text-gray-500 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200"><i className="fa-solid fa-heart fa-lg"></i></button>
                        <button title="add to cart"><i className="fa-solid fa-plus fa-lg text-orange-400 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i></button>
                    </div>
                </>
                : null}
            </div>
        </Link>
        }) : items.map((item,index)=>{
            return  <Link href={`${naviagteTo}${section === SectionEnum.CATEGORIES ? '?category='+encodeURIComponent(item.title): '?id='+encodeURIComponent(item.id)}`} key={index} className="sm:hidden mx-1 flex flex-row mb-4 gap-x-4 rounded-md shadow-sm shadow-zinc-700 bg-white dark:bg-slate-800 dark:shadow-slate-300 md:dark:hover:shadow-orange-400 max-md:dark:active:shadow-orange-400 md:dark:hover:shadow-md max-md:dark:active:shadow-md md:hover:shadow-md max-md:active:shadow-md md:hover:shadow-orange-600 max-md:active:shadow-orange-600">
            <div className="w-3/12 hoz-card2 h-32 flex-shrink-0">
                <img alt={item.title} src={item.image} className="rounded-t h-full w-full object-cover dark:border-l-0 border-l border-b-gray-600" />
            </div>
            <div className="text-black dark:text-white overflow-hidden">
                <h4 className="text-lg whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.title}</h4>
                {section !== SectionEnum.CATEGORIES ?
                <>
                    <div className="flex flex-row gap-x-3 items-center">
                        <p className="font-bold">{(currency?.symbol||'')+' '+useCurrentCurrency(item.price||0)}</p>
                        {section === SectionEnum.FLASH_SALES ? <p className="text-sm line-through text-gray-800 dark:text-gray-300">Was: {(currency?.symbol||'')+' '+useCurrentCurrency(item.oldPrice||0)}</p> : null}
                    </div>

                    {section === SectionEnum.FLASH_SALES ? <p className="ml-1 text-orange-400">Deal</p> : null}

                    <div className="flex flex-row items-start gap-x-3">
                        <button title="add to favorites" className="text-orange-400 md:hover:text-gray-500 max-md:active:text-gray-500 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200"><i className="fa-solid fa-heart fa-lg"></i></button>
                        <button title="add to cart"><i className="fa-solid fa-plus fa-lg text-orange-400 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i></button>
                    </div>
                </>
                : null}
            </div>
        </Link>
        })}
        {paginate ? 
        <div className="flex flex-row gap-x-2">
            <button onClick={()=>{
                if(currentPage-1 < minPage && minPage-1 >= 1) {
                    setMinPage(minPage-1);
                    setMaxPage(maxPage-1)
                }
                currentPage-1 >= 1 ? setCurrentPage(currentPage-1) : null
                }} disabled={currentPage===1}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3.0" stroke="currentColor" className={`transition-all rotate-90 w-5 h-5 ${currentPage === 1 ? 'dark:text-gray-400 text-zinc-400' : 'dark:text-white text-zinc-800'}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
            <div className={`${minPage > 1 ? 'inline' : 'hidden'} text-black dark:text-white mt-2`}>...</div>
            <div style={{maxWidth:'155px'}} className="flex flex-row overflow-hidden border-orange-500 gap-x-2">
                {pageElements}
            </div>
            <div className={`${currentPage < pages ? 'inline' : 'hidden'} text-black dark:text-white mt-2`}>...</div>
            <button onClick={()=>{
                if(currentPage+1 > maxPage && maxPage+1 <= pages) {
                    setMaxPage(maxPage+1);
                    setMinPage(minPage+1);
                }
                currentPage+1 <= pages ? setCurrentPage(currentPage+1) : null
                }} disabled={currentPage===pages}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3.0" stroke="currentColor" className={`transition-all -rotate-90 w-5 h-5 ${currentPage === pages ? 'dark:text-gray-400 text-zinc-400' : 'dark:text-white text-zinc-800'}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
        </div>
        : null}
    </div>
}