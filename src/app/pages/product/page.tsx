'use client';
import { useSharedState } from "@/app/contexts/context";
import Layout from "@/components/Layout";
import ErrorPage from "@/components/error";
import Loading from "@/components/loading";
import { FrontendServices } from "@/lib/inversify.config";
import { Cart } from "@/models/cart";
import { Product as ProductType } from "@/models/products";
import { HttpService } from "@/services/httpService";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Product: React.FC = () => {

    const http = FrontendServices.get<HttpService>('HttpService');
    const router = useRouter();

    const productId = useSearchParams().get("id");
    const [product, setProduct] = useState<ProductType>();
    const [loading,setLoading] = useState(true);
    const [saving,setSaving] = useState(false);
    const [productExists,setProductExists] = useState(true);
    const [productInCart, setProductInCart] = useState<boolean>(false);
    const { data: session , status } = useSession();
    const { setCartSize: updateCartSize, useCurrentCurrency, currency, setCart } = useSharedState();

    useEffect(()=>{
        const fetchProduct = async() => {
            return await http.get<ProductType>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/products/fetch?id=${encodeURIComponent(productId || '')}`);
        }

        const fetchCart = async() => {
            return await http.post<Cart>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/cart/fetch`,JSON.stringify({
                email: session?.user?.email
            }));
        };

        productId && fetchProduct().then(response => {
            if (response.status >= 200 && response.status<=299 && response.data) {
                setProduct(response.data);
                session && fetchCart().then((response)=>{
                    if(response.status >= 200 && response.status < 300 && response.data && response.data.cartItems){
                        const productInCart = response.data.cartItems.filter((item)=>item._id==productId);
                        productInCart.length > 0 ? setProductInCart(true): setProductInCart(false);
                        setLoading(false);
                    } else {
                        //
                    }
                });
                if(!session){
                    setLoading(false);
                }
                
            } else {
                setProductExists(false);
                setLoading(false);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[productId, session])

    const addToCart = async(e: React.FormEvent<HTMLButtonElement>) => {
        if(!session){
            router.push('/pages/auth/login');
        } else {
            setSaving(true);
            e.preventDefault();

            const curr = product;

            if(curr){
                curr.quantityInCart = 1;
            }

            setProduct(curr);

            const response = await http.post<{size:number, cart: Cart}>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/cart/save`,
                JSON.stringify({
                    email: session?.user?.email,
                    cartItem: product
                })
            );
            if(response.status >= 200 && response.status < 300) {
                setProductInCart(true);
                updateCartSize(response.data.size);
                setCart(response.data.cart);
            } else {
                curr ? curr.quantityInCart = 0 : null;
                setProductInCart(false);
            }
            setSaving(false);
        }
    };
    
    if (loading || status === "loading") {
        return <Loading />
    }

    if(!productExists){
        return <ErrorPage title="Error: 404" error="Invalid Link. Product does not exist." />;
    }

    return <Layout>
        <title>Valhalla - Products</title>
        <div className="mt-8">
            <div className="mb-4">
                <div className="h-1 w-24 bg-orange-500"></div>
                <h2 className="text-xl text-black dark:text-white"><span><i className="fa-solid fa-layer-group text-orange-500"></i></span> {product?.name.toUpperCase()}</h2>
            </div>
            <div className="flex flex-row gap-x-2">
                <div className="flex flex-col w-full gap-y-4">
                    <div className="flex flex-row gap-x-6 max-md:flex-col items-start dark:bg-transparent bg-white shadow-zinc-700 dark:shadow-slate-300 shadow-sm rounded-md p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <div className="max-md:!h-auto product-image-1 max-md:!w-auto max-md:mb-4" style={{height:'350px', width:'600px'}}><img src={`${product?.images[0].link}`} className="h-full w-full object-cover" alt={`${product?.name}`}/></div>
                        <div className="w-full">
                            <h2 className="text-2xl text-black dark:text-white">{product?.name}</h2>
                            <p className="text-base text-black dark:text-white border-b-2 border-b-gray-300 w-full">Brand : {product?.brand}</p>
                            <div className="flex product-price flex-row items-center gap-x-2 mt-2">
                                {
                                    product && product.discount > 0 ? 
                                        <>
                                            {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                                            <div className="font-bold text-xl text-black dark:text-white">{<p className="font-bold text-xl text-black dark:text-white">{((currency?.symbol||'loading...'||'')+' '+((100-product.discount)/100 * useCurrentCurrency(product)).toFixed(2))}</p>}</div>
                                            {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                                            <p className="font-bold line-through text-base text-gray-500 dark:text-gray-300">{(currency?.symbol||'loading...'||'')+' '+useCurrentCurrency(product)}</p>
                                            <p className="border text-sm rounded-sm text-white bg-orange-600 p-1 w-fit border-orange-600">{`${product.discount}% off`}</p>
                                        </>
                                        // eslint-disable-next-line react-hooks/rules-of-hooks
                                    : <p className="font-bold text-xl text-black dark:text-white">{(currency?.symbol||'loading...'||'')+' '+(product && useCurrentCurrency(product))}</p>
                                }
                            </div>
                            {product && product.stock > 0 ? 
                            <>
                                <p className="text-green-500 mt-2 text-xl font-bold">IN STOCK</p>
                                {productInCart
                                ?
                                    <div className="rounded-md text-white p-2 w-fit flex flex-row gap-x-2 mt-2 bg-green-600 justify-center items-center">
                                        <i className="fa-solid fa-check fa-lg"></i>
                                        <p className="text-base font-bold inline">Product added to cart</p>
                                    </div> 
                                :
                                    <button disabled={saving}
                                        onClick={(e)=>addToCart(e)}
                                        className='flex items-center px-2 disabled:bg-gray-500 disabled:hover:bg-gray-500 justify-center border-2 bg-orange-600 border-orange-500 md:hover:bg-orange-500 max-md:active:bg-orange-100 rounded-md text-white h-10'>
                                        Add to cart
                                    </button>
                                }
                            </>
                            : <p className="text-red-500 mt-2">OUT OF STOCK</p>
                            }
                            <div>
                                <p className="text-gray-500 mb-2 dark:text-gray-200 border-t-2 border-b-gray-300 w-full mt-8">SERVICES</p>
                                <div className="flex flex-col gap-y-4">
                                    <p className="inline text-black dark:text-white"><i className="fa-solid fa-file-circle-check fa-xl text-orange-400"></i> 1 year warranty</p>
                                    <p className="inline text-black dark:text-white"><i className="fa-solid fa-truck-ramp-box fa-xl text-orange-400"></i> Free returns</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-x-4 items-start dark:bg-transparent bg-white shadow-zinc-700 dark:shadow-slate-300 shadow-sm rounded-md p-4">
                        <h3 className="text-xl text-black dark:text-white w-full border-b-2 mb-4 border-b-gray-300">Product Details</h3>
                        <p dangerouslySetInnerHTML={{__html: product?.description.replace(/(:|\.)/g, '$1<br/>') ?? ''}} className="text-gray-600 dark:text-gray-200 mb-4">
                        </p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <div style={{height:'500px'}} className="flex product-image-2 mb-14 flex-row max-md:!h-auto max-md:!w-auto items-center justify-center mx-auto"><img src={`${product?.images[1].link}`} className="h-full w-full" alt={`${product?.name}`}/></div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <div style={{height:'500px'}} className="flex product-image-2 mb-5 flex-row max-md:!h-auto max-md:!w-auto items-center justify-center mx-auto"><img src={`${product?.images[2].link}`} className="h-full w-full" alt={`${product?.name}`}/></div>
                        <h3 className="text-lg text-black mt-8 dark:text-white w-full border-b-2 mb-4 border-b-gray-300">Specifications</h3>
                        {product && Object.keys(product?.properties).map((key,index)=>{
                            return <div key={index} className="flex flex-row items-center justify-center">
                                <p className="font-bold text-black dark:text-white mr-2">{key}:</p>
                                <p className="text-black dark:text-white">{product.properties[key]}</p>
                            </div>
                        })}
                    </div>

                    <div className="flex flex-col gap-x-4 items-start dark:bg-transparent bg-white shadow-zinc-700 dark:shadow-slate-300 shadow-sm rounded-md p-4">
                        <h3 className="text-xl text-black dark:text-white w-full border-b-2 mb-4 border-b-gray-300">What`s in the box</h3>
                        <ul className="text-black dark:text-white list-disc ml-4">
                            {product && product.contents.split(',').map((item,index)=>{
                                return <li key={index}>{item}</li>
                            })}
                        </ul>
                    </div>
                    <div className="flex flex-col gap-x-4 items-start dark:bg-transparent bg-white shadow-zinc-700 dark:shadow-slate-300 shadow-sm rounded-md p-4">
                        <h3 className="text-xl text-black dark:text-white w-full border-b-2 mb-4 border-b-gray-300">Related</h3>
                    </div>
                </div>
            </div>
        </div>
    </Layout>
};

export default Product;
