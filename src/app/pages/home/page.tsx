'use client'

import Layout from "@/components/Layout";
import { CardGrid } from "@/components/cardGrid";
import { CardList } from "@/components/cardList";
import CarouselSlider from "@/components/carousel";
import Loading from "@/components/loading";
import { FrontendServices } from "@/lib/inversify.config";
import { Card } from "@/models/card";
import { Category } from "@/models/categories";
import { Product } from "@/models/products";
import { SectionEnum } from "@/models/sectionEnum";
import { HttpService } from "@/services/httpService";
import { StorageService } from "@/services/storageService";
import React, { useEffect, useState } from "react";

const AppHome: React.FC = ()=>{

    //Services
    const http = FrontendServices.get<HttpService>('HttpService');
    const storage = FrontendServices.get<StorageService>('StorageService');

    const[products, setProducts] = useState<Product[]>();
    const[categories, setCategories] = useState<Category[]>();
    const[loading, setLoading] = useState(true);
    
    useEffect(()=>{
        const fetchCategories = async() => {
            return await http.get<Category[]>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/categories/fetch`);
        }

        const fetchProducts = async() => {
            return await http.get<Product[]>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/products/fetch`);
        }

        fetchCategories().then(response => {
            if (response.status >= 200 && response.status<=299 && response.data) {
                setCategories(response.data.filter((category)=>category.name!='Electronics').sort((a,b)=>new Date(b.updated).getTime() - new Date(a.updated).getTime()));
                fetchProducts().then(response => {
                    if (response.status >= 200 && response.status<=299 && response.data) {
                        setProducts(response.data.sort((a,b)=>new Date(b.updated).getTime() - new Date(a.updated).getTime()));
                        setLoading(false);
                    } else {
                        //
                    }
                });
            } else {
                //
            }
        });
    },[http])

    if(loading) {
        return <Loading />;
    }

    //Most recently 5 added products
    const featuredProducts: Card[] = products ? products.filter((product)=>product.discount == 0).map((product)=>{
        return {
            image: product.images[0].link,
            description: '',
            title: product.name,
            price: product.price,
            id: product._id
        }
    }) : [{image:'',description:'',title:'',id:''}];

    //Most recently 10 added products with no discount
    const recentUndiscountedProducts: Card[] = products ? products.filter((product,index)=>index < 10&&!product.discount).map((product)=>{
        return {
            image: product.images[1].link,
            description: '',
            title: product.name,
            price: product.price,
            id: product._id
        }
    }) : [{image:'',description:'',title:'',id:''}];

    //Card list products flash sales (with discount)
    const flashSaleItems: Card[] = 
    products ? 
    products.filter((product,index)=>index < 5&&product.discount).map((product)=>{
        let listItem: Card =  {
            image: product.images[0].link,
            description: '',
            title: product.name,
            id: product._id
        }
        listItem.price = Math.round(((100-product.discount)/100) * product.price);
        listItem.oldPrice = product.price;
        return listItem
          
    })
    : [{image:'',description:'',title:'',id:''}] ;
    

    //Card grid categories
    const gridCategories: Card[] = 
    categories ? 
    categories.map((category)=>{
        return {
            image: category.images[0].link,
            title: category.name,
            id: category._id
        }
    })
    : [{image:'', title:'',id:''}];

    //Card list best-selling items
    const bestSellingItems: Card[] = 
    products ? 
    products.filter((product,index)=>index < 5&&product.discount).map((product)=>{
        let listItem: Card =  {
            image: product.images[0].link,
            description: '',
            title: product.name,
            id: product._id
        }
        listItem.price = Math.round(((100-product.discount)/100) * product.price);
        listItem.oldPrice = product.price;
        return listItem
              
    })
    : [{image:'',description:'',title:'',id:''}] ;

    
    return <Layout>
        {
        <>
            <title>Valhalla - Electronics</title>

            <section id="featured">
                <div className="mb-4">
                    <div className="h-1 w-24 bg-orange-400"></div>
                    <h2 className="text-xl text-black dark:text-white"><span><i className="fa-solid fa-bolt text-orange-400"></i></span> FEATURED</h2>
                </div>
                <CardGrid naviagteTo="/pages/product/" items={featuredProducts} section={SectionEnum.FEATURED}/>
            </section>

            {flashSaleItems.length > 0 ?
            <section id="flash-sales">
                <div className="mb-4">
                    <div className="h-1 w-24 bg-orange-400"></div>
                    <h2 className="text-xl text-black dark:text-white"><span><i className="fa-solid fa-wand-sparkles text-orange-400"></i></span> FLASH SALES
                        {/* <a href="/pages/products" className="text-orange-500 dark:text-orange-400 md:dark:hover:text-orange-300 max-md:dark:active:text-orange-300 md:hover:text-orange-400 max-md:active:text-orange-400 ml-2 underline text-sm">See more</a> */}
                    </h2>
                </div>
                <CardGrid naviagteTo="/pages/product/" items={flashSaleItems} section={SectionEnum.FLASH_SALES}/>
            </section>
            : null}

            {/* <section id="new-arrivals" className="mt-8">
                <div className="mb-4">
                    <div className="h-1 w-24 bg-orange-400"></div>
                    <h2 className="text-xl text-black dark:text-white"><span><i className="fa-regular fa-circle-check text-orange-400"></i></span> NEW ARRIVALS
                        <a href="" className="text-orange-500 dark:text-orange-400 md:dark:hover:text-orange-300 max-md:dark:active:text-orange-300 max-md:active:text-orange-400 md:hover:text-orange-400 ml-2 underline text-sm">See more</a>
                    </h2>
                </div>
                <CardList items={recentUndiscountedProducts} section={SectionEnum.NEW_ARRIVALS}/>
            </section> */}

            <section id="categories">
                <div className="mb-4">
                    <div className="h-1 w-24 bg-orange-400"></div>
                    <h2 className="text-xl text-black dark:text-white"><span><i className="fa-solid fa-layer-group text-orange-400"></i></span> CATEGORIES
                    </h2>
                </div>
                <CardGrid naviagteTo="/pages/products/" items={gridCategories} section={SectionEnum.CATEGORIES} />
            </section>

            {/* { bestSellingItems.length > 0 ?
            <section id="best-selling">
                <div className="mb-4">
                    <div className="h-1 w-24 bg-orange-400"></div>
                    <h2 className="text-xl text-black dark:text-white"><span><i className="fa-solid fa-fire-flame-curved text-orange-400"></i></span> BEST SELLING
                        <a href="/pages/product/" className="text-orange-500 dark:text-orange-400 md:dark:hover:text-orange-300 max-md:dark:active:text-orange-300 md:hover:text-orange-400 max-md:active:text-orange-400 ml-2 underline text-sm">See more</a>
                    </h2>
                </div>
                <CardList items={bestSellingItems} section={SectionEnum.BEST_SELLING}/>
            </section>
            : null} */}
        </>
        }

    </Layout>
};

export default AppHome;