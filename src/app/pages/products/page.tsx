'use client';
import Layout from "@/components/Layout";
import { CardGrid } from "@/components/cardGrid";
import { FrontendServices } from "@/lib/inversify.config";
import { Card } from "@/models/card";
import { SectionEnum } from "@/models/sectionEnum";
import { HttpService } from "@/services/httpService";
import { useSearchParams } from "next/navigation";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import Loading from "@/components/loading";
import { Product } from "@/models/products";
import { CollapseFilters } from "@/components/collapseFilters";
import { Category, CategoryProperty } from "@/models/categories";

interface FilterOptions {
    text: string,
    value?: number | string,
    default?: boolean
}

interface FilterCheckboxes {
    text: string,
    default?: boolean
}

const Products: React.FC = () => {

    const http = FrontendServices.get<HttpService>('HttpService');
    const category = useSearchParams().get("category");
    const [products, setProducts] = useState<Product[]>();
    const [loading,setLoading] = useState(true);
    const [productsExist,setProductsExist] = useState(true);

    //State variables
    const[showOptions,setShowOptions] = useState(false);
    const menuBarRef = useRef<HTMLDivElement>(null) as MutableRefObject<HTMLDivElement>;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
    
          if (menuBarRef && showOptions && !menuBarRef.current.contains(event.target as Node)) {
            setShowOptions(false);
          }
        };
    
        document.addEventListener('click', handleClickOutside);
    
        return () => {
          document.removeEventListener('click', handleClickOutside);
        };
      }, [showOptions]);

      useEffect(()=>{

        const fetchCategories = async() => {
            return await http.get<Category>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/categories/fetch/category=${encodeURIComponent(category || '')}`);
        };

        const fetchProduct = async() => {
            return await http.get<Product[]>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/products/fetch/filter/category=${encodeURIComponent(category || '')}`);
        }

        category && fetchCategories().then((response1) => {
            setAttributeOptions([attributeOptions[0], ...response1.data.properties]);
            fetchProduct().then(response2 => {
                if (response2.status >= 200 && response2.status<=299 && response2.data) {
                    setProducts(response2.data);
                    let maxPrice = 0;
                    const allProductBrands = response2.data.map((product)=>{
                        maxPrice = (Math.max(product.price,maxPrice));
                        return product.brand.toLowerCase().trim()
                    });

                    let curr = 0, interval = Math.floor(maxPrice/4);

                    let currPrices: FilterOptions[] = [];

                    while(curr <= maxPrice){
                        if(curr == maxPrice){
                            currPrices.push({text:`Above ${curr}`,value:curr});
                            break;
                        } else {
                            currPrices.push({text:`${curr}-${curr+interval}`,value:curr});
                        }
                        curr += interval;
                    }

                    setPriceOptions([ priceOptions[0],...currPrices]);

                    let uniqueBrands: any = {};
                    allProductBrands.forEach((brand)=>uniqueBrands[brand]=brand);
                    const finalUnique = Object.keys(uniqueBrands).map((key)=>{return {text:key.toUpperCase()}})
                    setBrandCheckBoxes([brandCheckboxes[0],...finalUnique]);
                    
                } else {
                    setProductsExist(false);
                    //setLoading(false);
                }
                setLoading(false);
        })});
    },[category])

    const [priceOptions, setPriceOptions] = useState<FilterOptions[]>([{text:'< Any price', default: true}]);

    const [attributeOptions, setAttributeOptions] = useState<CategoryProperty[]>([{name:'< Any Attribute', value: 'default'}]);

    const [brandCheckboxes, setBrandCheckBoxes] = useState<FilterCheckboxes[]>([{text:'< Any Brand', default: true}]);

    const items: Card[] = products ?  products?.map((product)=>{
        let listItem: Card = {
            image: product.images[0].link,
            description: product.name,
            title: product.name,
            id: product._id,
            price: product.price
        }
        return listItem;
    }) : [{
        image: '',
        description: '',
        title: '',
        id: ''
    }];

    if (loading) {
        return <Loading />
    }

    if(!productsExist){
        return <Layout>
            <title>Valhalla - Products</title>
            <div className="mb-4">
                <div className="h-1 w-24 bg-orange-400"></div>
                <h2 className="text-xl text-black dark:text-white"><span><i className="fa-solid fa-layer-group text-orange-400"></i></span> {category?.toUpperCase()}</h2>
            </div>
            <div className="text-black dark:text-white font-bold text-lg">No products found for this category</div>
        </Layout>
    }
    
    return (
        <Layout>
            <title>Valhalla - Products</title>
            <div>
                <div id="products" className="flex flex-row pt-2 gap-x-4">
                    <div className="w-2/12 flex flex-col gap-y-4 max-lg:hidden">

                        <h3 className="text-base font-bold text-black dark:text-white">SORT</h3>
                        <div className="flex flex-col">
                            <select className="dark:bg-slate-800 bg-slate-200 text-black dark:text-white rounded-md py-2 max-md:hidden ">
                                    <option value={'Price'}>Price</option>
                            </select>
                            <label>
                                <input type="radio" value={'ASC'} />
                                <p className="text-black dark:text-white inline ml-2 text-sm">ASC</p>
                            </label>
                            <label>
                                <input type="radio" value={'DESC'} />
                                <p className="text-black dark:text-white inline ml-2 text-sm">DESC</p>
                            </label>
                        </div>

                        <h3 className="text-base font-bold text-black dark:text-white">FILTER</h3>
                        <h3 className="text-base font-bold text-black dark:text-white italic underline">Price</h3>
                        {priceOptions.map((option,index)=>{
                            return <div key={index}>
                                {option.default ? <button className="dark:text-white text-black w-fit text-sm md:hover:text-orange-500 max-md:active:text-orange-500 md:dark:hover:text-orange-400 max-md:dark:active:text-orange-400">{option.text}</button> :
                                    <label>
                                        <input type="radio" value={option.text} />
                                        <p className="text-black dark:text-white inline ml-2 text-sm">{option.text}</p>
                                    </label>
                                }
                            </div>
                        })}

                        <h3 className="text-base font-bold text-black dark:text-white italic underline">Attributes</h3>
                        {attributeOptions.map((option,index)=>{
                            return <div key={index}>
                                {option.value == 'default' ? <button className="dark:text-white text-black w-fit text-sm md:hover:text-orange-500 max-md:active:text-orange-500 md:dark:hover:text-orange-400 max-md:dark:active:text-orange-400">{option.name}</button> :
                                    <CollapseFilters title={option.name}>
                                        {option.value.split(',').map((value,index)=>{
                                        return <div key={index}>
                                            <input type="radio" value={value} />
                                            <p className="text-black dark:text-white inline ml-2 text-sm">{value}</p>
                                        </div>
                                        })}
                                    </CollapseFilters>
                                }
                            </div>
                        })}
                        
                        <h3 className="text-base font-bold text-black dark:text-white italic underline">Brand</h3>
                        {brandCheckboxes.map((option,index)=>{
                            return <div key={index}>
                                {option.default ? <button className="dark:text-white text-black w-fit text-sm md:hover:text-orange-500 max-md:active:text-orange-500 md:dark:hover:text-orange-400 max-md:dark:active:text-orange-400">{option.text}</button> :
                                    <label>
                                        <input type="checkbox" value={option.text} />
                                        <p className="text-black dark:text-white inline ml-2 text-sm">{option.text}</p>
                                    </label>
                                }
                            </div>
                        })}

                    </div>

                    <div className="lg:w-10/12 max-lg:w-full">
                        <div className="flex flex-row justify-between items-center gap-x-2">
                            <div className="mb-4">
                                <div className="h-1 w-24 bg-orange-400"></div>
                                <h2 className="text-xl text-black dark:text-white"><span><i className="fa-solid fa-layer-group text-orange-400"></i></span> {category?.toUpperCase()}</h2>
                            </div>
                            <div>
                                <div className="lg:hidden">
                                    <button title="Filter & Sort" className="text-black dark:text-white -z-30" onClick={()=>setShowOptions(!showOptions)}><i className="fa-solid fa-filter fa-xl"></i></button>
                                    <div className={`fixed z-30 pointer-events-auto inset-0 bg-neutral-800 opacity-20 dark:bg-gray-400 ${showOptions ? 'w-screen h-screen ease-in-out' : 'overflow-hidden w-0' } `}></div>
                                    <div ref={menuBarRef} className={`z-30 ${showOptions ? 'w-1/2 h-screen overflow-y-auto ease-in-out' : 'overflow-hidden w-0' } fixed transition-width duration-300 inset-0 rounded-md dark:bg-zinc-800 bg-gray-100 text-black dark:text-white`}>
                                        <h2 className="text-lg font-bold p-2"><i className="fa-solid fa-bars-staggered mr-2"></i>Sort & Filter</h2>
                                        <div className="flex flex-col p-2">
                                            <select className="dark:bg-slate-700 bg-slate-200 text-black dark:text-white rounded-md py-2 max-md:hidden ">
                                                    <option value={'Price'}>Price</option>
                                            </select>
                                            <label>
                                                <input type="radio" value={'ASC'} />
                                                <p className="text-black dark:text-white inline ml-2 text-sm">ASC</p>
                                            </label>
                                            <label>
                                                <input type="radio" value={'DESC'} />
                                                <p className="text-black dark:text-white inline ml-2 text-sm">DESC</p>
                                            </label>
                                        </div>
                                        
                                        <p className="text-base ml-2 font-bold text-black dark:text-white underline">Price</p>
                                        {priceOptions.map((option,index)=>{
                                            return <div key={index} title={''} className={`md:dark:hover:bg-slate-700 max-md:dark:active:bg-slate-700 md:hover:bg-white max-md:active:bg-white text-base border-b ${showOptions ? 'opacity-100' : 'opacity-0'} transition-all duration-300 border-b-gray-400 font-bold p-2 w-full text-left `}>
                                            {option.default ? <button className="text-black dark:text-white inline ml-2 text-sm">{option.text}</button> :
                                            <label>
                                                <input type="radio" value={option.text} />
                                                <p className="text-black dark:text-white inline ml-2 text-sm">{option.text}</p>
                                            </label> 
                                            }   
                                        </div>
                                        })}

                                        <p className="text-base ml-2 mt-6 font-bold text-black dark:text-white underline">Attributes</p>
                                        {attributeOptions.map((option,index)=>{
                                            return <div key={index} title={''} className={`md:dark:hover:bg-slate-700 max-md:dark:active:bg-slate-700 md:hover:bg-white max-md:active:bg-white text-base border-b ${showOptions ? 'opacity-100' : 'opacity-0'} transition-all duration-300 border-b-gray-400 font-bold p-2 w-full text-left `}>
                                            {option.value == 'default' ? <button className="text-black dark:text-white inline ml-2 text-sm">{option.name}</button> :
                                            <CollapseFilters title={option.name}>
                                                {option.value.split(',').map((value,index)=>{
                                                    return <div key={index}>
                                                    <input type="radio" value={value} />
                                                    <p className="text-black dark:text-white inline ml-2 text-sm">{value}</p>
                                                </div>
                                                })}
                                            </CollapseFilters>
                                            }   
                                        </div>
                                        })}

                                        <p className="text-base ml-2 mt-6 font-bold text-black dark:text-white underline">Brand</p>
                                        {brandCheckboxes.map((option,index)=>{
                                            return <div key={index} title={''} className={`md:dark:hover:bg-slate-700 max-md:dark:active:bg-slate-700 md:hover:bg-white max-md:active:bg-white text-base border-b ${showOptions ? 'opacity-100' : 'opacity-0'} transition-all duration-300 border-b-gray-400 font-bold p-2 w-full text-left `}>
                                            {option.default ? <button className="text-black dark:text-white inline ml-2 text-sm">{option.text}</button> :
                                            <label>
                                                <input type="checkbox" value={option.text} />
                                                <p className="text-black dark:text-white inline ml-2 text-sm">{option.text}</p>
                                            </label>  
                                            } 
                                        </div>
                                        })}

                                        <div className="mb-10"></div> 
                                    </div>
                                </div>
                            </div>
                        </div>
                        <CardGrid naviagteTo="/pages/product/" items={items} section={SectionEnum.PRODUCTS} paginate pageLength={12}/>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Products;