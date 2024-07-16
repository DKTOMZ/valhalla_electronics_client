'use client'
import { Card } from "@/models/card";
import { SectionEnum } from "@/models/sectionEnum";
import "@/app/globals.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSharedState } from "@/app/contexts/context";
import { useSession } from "next-auth/react";
import Loading from "./loading";
import { Product } from "@/models/products";
import { useRouter } from "next/navigation";
import { HttpService } from "@/services/httpService";
import { FrontendServices } from "@/lib/inversify.config";
import { Cart } from "@/models/cart";

interface CardListProps {
    items: Card[],
    section?: SectionEnum,
    paginate?: boolean,
    pageLength?: number,
    navigateTo: string,
}

/** Card Grid component */
export const CardGrid: React.FC<CardListProps> = ({items,section,paginate=false,pageLength=10,navigateTo}) => {

    const pages = Math.ceil(items.length/pageLength);

    const http = FrontendServices.get<HttpService>('HttpService');
    const [currentPage,setCurrentPage] = useState(1);
    const [minPage, setMinPage] = useState(1);
    const [maxPage,setMaxPage] = useState(pages);
    const [saving, setSaving] = useState(false);
    const { currency, useCurrentCurrency } = useSharedState();
    const { data: session , status } = useSession();
    const { cart, setCart, setCartSize } = useSharedState();
    const router = useRouter();
 
    const pageElements = [];

    if (paginate) {
        for (let i = minPage; i <= maxPage; i++) {
            pageElements.push(<button onClick={()=>setCurrentPage(i)} style={{borderRadius: '50%'}} key={i} className={`flex-shrink-0 text-lg ${currentPage === i ? 'bg-orange-600 text-white' : 'text-black dark:text-white'} flex flex-row items-center justify-center h-8 w-8`}>{i}</button>)
        }
    }

    const checkProductIsInCart = (id: string) => {
        if(cart){
            return cart.cartItems.filter((item)=>item._id == id).length > 0;
        }else {
            return false;
        }
    }

    const addToCart = async(item: Product|undefined) => {
        if(!session){
            router.push('/pages/auth/login');
        } else {
            if(item?.stock == 0){
                return;
            }
            setSaving(true);
            if(item){
                item.quantityInCart = 1;
                const response = await http.post<{size:number, cart: Cart}>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/cart/save`,
                JSON.stringify({
                    email: session?.user?.email,
                    cartItem: item
                })
            );
            if(response.status >= 200 && response.status < 300) {
                setCart(response.data.cart);
                setCartSize(response.data.size);
            } else {
                item.quantityInCart = 0;
            }
            }
            setSaving(false);
        }
    };

    useEffect(()=>{window.scrollTo(0,0);},[currentPage]);

    if(!session && !cart && status === 'loading'){
        return <Loading screen={false}/>;
    }

    return <div> 
        <div className="grid mb-8 grid-flow-row gap-x-4 card-grid max-sm:hidden text-neutral-600 sm:grid-cols-2 md:grid-cols-3">
            {paginate ? items.filter((_item,index)=>(index >= (currentPage-1) * pageLength && index < currentPage * pageLength)).map((item,index)=>{
                return <div key={index} className="my-2 rounded dark:shadow-gray-500 md:hover:-translate-y-1 shadow-md shadow-zinc-700 bg-white dark:bg-zinc-700 duration-500 md:dark:hover:shadow-orange-400 max-md:dark:active:shadow-orange-400 md:dark:hover:shadow-md max-md:dark:active:shadow-md md:hover:shadow-md max-md:active:shadow-md md:hover:shadow-orange-600 max-md:active:shadow-orange-600"
                >
                        <figure>
                            <Link href={`${navigateTo}${section === SectionEnum.CATEGORIES ? '?category='+encodeURIComponent(item.title): '?id='+encodeURIComponent(item.id)}`}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img alt={item.title} src={item.image} className="rounded-t h-64 w-full object-cover dark:border-b-0 border-b border-b-gray-600" />
                            </Link>
                            {section !== SectionEnum.CATEGORIES ?
                            <figcaption className="p-4">
                                {section === SectionEnum.FLASH_SALES ? 
                                    <div className="flex flex-row items-center justify-between">
                                        <div>
                                            <div className="border text-sm rounded-sm text-white bg-orange-600 p-1 w-fit border-orange-600">{ item.product ? Math.round(item.product?.discount)+"% off" : null}</div>
                                            <p className="ml-1 text-orange-400">Deal</p>
                                        </div>
                                        {status == 'authenticated' ? 
                                            !checkProductIsInCart(item.id) ? (item.product && item.product.stock > 0) ? <button className="max-sm:hidden" disabled={saving} onClick={()=>addToCart(item.product)} title="add to cart"><i className="fa-solid fa-plus fa-lg text-orange-400 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i></button> : null : <i title="in cart" className="fa-solid fa-check fa-lg text-orange-400 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i>
                                        : null}
                                    </div>
                                : null}
                                {status == 'authenticated' && (section === SectionEnum.PRODUCTS || section === SectionEnum.FEATURED) ? 
                                    !checkProductIsInCart(item.id) ? (item.product && item.product.stock > 0) ? <button className="max-sm:hidden" disabled={saving} onClick={()=>addToCart(item.product)} title="add to cart"><i className="fa-solid fa-plus fa-lg text-orange-400 md:dark:hover:text-gray-200 md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i></button> : null : <i title="in cart" className="fa-solid fa-check fa-lg text-orange-400 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i>
                                : null}
                                <div className="flex flex-row items-center gap-x-2">
                                    <p className="text-lg text-gray-800 dark:text-gray-100">
                                        {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                                        {(currency?.symbol||'loading...'||'')+' '+(item.product && useCurrentCurrency(item.product) * (item.product.discount ? ((100-item.product.discount)/100) : 1))?.toFixed(2)}
                                    </p>
                                    {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                                    {section === SectionEnum.FLASH_SALES ? <p className="text-sm line-through text-gray-800 dark:text-gray-300">Was: {(currency?.symbol||'loading...'||'')+' '+(item.product && useCurrentCurrency(item.product))?.toFixed(2)}</p> : null}
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
                <div key={index} className="my-2 rounded dark:shadow-gray-500 md:hover:-translate-y-1 shadow-md shadow-zinc-700 bg-white dark:bg-zinc-700 duration-500 md:dark:hover:shadow-orange-400 max-md:dark:active:shadow-orange-400 md:dark:hover:shadow-md max-md:dark:active:shadow-md md:hover:shadow-md max-md:active:shadow-md md:hover:shadow-orange-600 max-md:active:shadow-orange-600"
                >
                        <figure>
                            <Link  href={`${navigateTo}${section === SectionEnum.CATEGORIES ? '?category='+encodeURIComponent(item.title): '?id='+encodeURIComponent(item.id)}`}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img alt={item.title} src={item.image} className="rounded-t h-56 xl:h-64 w-full object-cover dark:border-b-0 border-b border-b-gray-600" />
                            </Link>
                            {section !== SectionEnum.CATEGORIES ?
                            <figcaption className="p-4">
                                {section === SectionEnum.FLASH_SALES ? 
                                    <div className="flex flex-row items-center justify-between">
                                        <div>
                                            <div className="border text-sm rounded-sm text-white bg-orange-600 p-1 w-fit border-orange-600">{item.product ? Math.round(item.product?.discount)+"% off" : null}</div>
                                            <p className="ml-1 text-orange-400">Deal</p>
                                        </div>
                                        {status == 'authenticated' ? 
                                            !checkProductIsInCart(item.id) ? (item.product && item.product.stock > 0) ? <button className="max-sm:hidden" disabled={saving} onClick={()=>addToCart(item.product)} title="add to cart"> <i className="fa-solid fa-plus fa-lg text-orange-400 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i></button> : null : <i title="in cart" className="fa-solid fa-check fa-lg text-orange-400 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i>
                                        : null
                                        }
                                    </div>
                                : null}
                                {section === SectionEnum.PRODUCTS && status == 'authenticated' ? 
                                    !checkProductIsInCart(item.id) ? (item.product && item.product.stock > 0) ?  <button className="max-sm:hidden" disabled={saving} onClick={()=>addToCart(item.product)} title="add to cart"><i className="fa-solid fa-plus fa-lg text-orange-400 md:dark:hover:text-gray-200 md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i></button>: null : <i title="in cart" className="fa-solid fa-check fa-lg text-orange-400 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i>
                                : null}
                                <div className="flex flex-row items-center gap-x-2">
                                    <p className="text-lg text-gray-800 dark:text-gray-100">
                                        {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                                        {(currency?.symbol||'loading...'||'')+' '+ (item.product && useCurrentCurrency(item.product) * (item.product.discount ? ((100-item.product.discount)/100): 1))?.toFixed(2)}
                                    </p>
                                    {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                                    {section === SectionEnum.FLASH_SALES ? <p className="text-sm line-through text-gray-800 dark:text-gray-300">Was: {(currency?.symbol||'loading...'||'')+' '+(item.product && useCurrentCurrency(item.product))?.toFixed(2)}</p> : null}
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
            return  <Link href={`${navigateTo}${section === SectionEnum.CATEGORIES ? '?category='+encodeURIComponent(item.title): '?id='+encodeURIComponent(item.id)}`} key={index} className="sm:hidden mx-1 flex flex-row mb-4 gap-x-4 rounded-md shadow-sm shadow-zinc-700 bg-white dark:bg-zinc-700 dark:shadow-slate-300 md:dark:hover:shadow-orange-400 max-md:dark:active:shadow-orange-400 md:dark:hover:shadow-md max-md:dark:active:shadow-md md:hover:shadow-md max-md:active:shadow-md md:hover:shadow-orange-600 max-md:active:shadow-orange-600">
            <div className="w-3/12 hoz-card2 h-32 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={item.title} src={item.image} className="rounded-t h-full w-full object-cover dark:border-l-0 border-l border-b-gray-600" />
            </div>
            <div className="text-black dark:text-white overflow-hidden">
                <h4 className="text-lg whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.title}</h4>
                {section !== SectionEnum.CATEGORIES ?
                <>
                    <div className="flex flex-row gap-x-3 items-center">
                        {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                        <p className="font-bold">{(currency?.symbol||'loading...'||'')+' '+ (item.product && useCurrentCurrency(item.product) * (item.product.discount ? ((100-item.product.discount)/100): 1))?.toFixed(2) }</p>
                        {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                        {section === SectionEnum.FLASH_SALES ? <p className="text-sm line-through text-gray-800 dark:text-gray-300">Was: {(currency?.symbol||'loading...'||'')+' '+(item.product && useCurrentCurrency(item.product))?.toFixed(2)}</p> : null}
                    </div>

                    {section === SectionEnum.FLASH_SALES ? <p className="ml-1 text-orange-400">Deal</p> : null}

                    {status == 'authenticated' ?
                        !checkProductIsInCart(item.id) ? (item.product && item.product.stock > 0) ? <button className="max-sm:hidden" disabled={saving} onClick={()=>addToCart(item.product)} title="add to cart"><i className="fa-solid fa-plus fa-lg text-orange-400 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i></button> : null : <i title="in cart" className="fa-solid fa-check fa-lg text-orange-400 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i>
                    : null}
                </>
                : null}
            </div>
        </Link>
        }) : items.map((item,index)=>{
            return  <Link href={`${navigateTo}${section === SectionEnum.CATEGORIES ? '?category='+encodeURIComponent(item.title): '?id='+encodeURIComponent(item.id)}`} key={index} className="sm:hidden mx-1 flex flex-row mb-4 gap-x-4 rounded-md shadow-sm shadow-zinc-700 bg-white dark:bg-zinc-700 dark:shadow-slate-300 md:dark:hover:shadow-orange-400 max-md:dark:active:shadow-orange-400 md:dark:hover:shadow-md max-md:dark:active:shadow-md md:hover:shadow-md max-md:active:shadow-md md:hover:shadow-orange-600 max-md:active:shadow-orange-600">
            <div className="w-3/12 hoz-card2 h-32 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={item.title} src={item.image} className="rounded-t h-full w-full object-cover dark:border-l-0 border-l border-b-gray-600" />
            </div>
            <div className="text-black dark:text-white overflow-hidden">
                <h4 className="text-lg whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.title}</h4>
                {section !== SectionEnum.CATEGORIES ?
                <>
                    <div className="flex flex-row gap-x-3 items-center">
                        {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                        <p className="font-bold">{(currency?.symbol||'loading...'||'')+' '+(item.product && useCurrentCurrency(item.product) * (item.product.discount ? ((100-item.product.discount)/100) : 1))?.toFixed(2)}</p>
                        {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                        {section === SectionEnum.FLASH_SALES ? <p className="text-sm line-through text-gray-800 dark:text-gray-300">Was: {(currency?.symbol||'loading...'||'')+' '+(item.product && useCurrentCurrency(item.product))?.toFixed(2)}</p> : null}
                    </div>

                    {section === SectionEnum.FLASH_SALES ? <p className="ml-1 text-orange-400">Deal</p> : null}

                    {status == 'authenticated' ? 
                        !checkProductIsInCart(item.id) ? (item.product && item.product.stock > 0) ? <button className="max-sm:hidden" disabled={saving} onClick={()=>addToCart(item.product)} title="add to cart"><i className="fa-solid fa-plus fa-lg text-orange-400 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i></button>: null : <i title="in cart" className="fa-solid fa-check fa-lg text-orange-400 md:dark:hover:text-gray-200 max-md:dark:active:text-gray-200 md:hover:text-gray-500 max-md:active:text-gray-500"></i>
                    : null}
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