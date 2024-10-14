'use client'

import { useSharedState } from "@/app/contexts/context";
import Layout from "@/components/Layout";
import { Collapse } from "@/components/collapse";
import Loading from "@/components/loading";
import { FrontendServices } from "@/lib/inversify.config";
import { Cart as CartType } from "@/models/cart";
import { PromocodeType } from "@/models/promocode";
import { HttpService } from "@/services/httpService";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { countryPhoneNumbers } from "@/utils/phoneNumbers";
import { ValidationService } from "@/services/validationService";
import Stripe from "stripe";
import { ShippingRate } from "@/models/shippingRate";
import { CurrenciesType } from "@/models/currencies";
import { UtilService } from "@/services/utilService";

const Checkout: React.FC = () => {

    const http = FrontendServices.get<HttpService>('HttpService');
    const utilService = FrontendServices.get<UtilService>('UtilService');

    const { data: session , status } = useSession();

    const { cart, setCart, useCurrentCurrency, cartTotal, setCartTotal, shippingFee, currency, currentCheckoutTab, setCurrentCheckoutTab, appliedPromocode, setAppliedPromocode,
        setShippingRates, setCurrentShipping, currentShipping, setShippingFee
    } = useSharedState();
    
    const [loading,setLoading] = useState<boolean>(true);
    const [loadingPromocode,setLoadingPromocode] = useState<boolean>(false);
    const [promocode, setPromocode] = useState('');
    const [discount, setDiscount] = useState(0);

    const [tabs, setTabs] = useState([
        <Shipping key={'shipping'}/>,
        <Payment key={'payment'}/>
    ]);
    
    const [cartComplete,setCartComplete] = useState(false);
    const [shippingComplete,setShippingComplete] = useState(false);

    const promocodeError = useRef<HTMLElement>() as MutableRefObject<HTMLDivElement>;
    const shippingCompleteError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;
    
    useEffect(()=>{
        const fetchShippingRates = async() => {
            return await http.get<ShippingRate[]>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/shippingRates/fetch`);
        };

        fetchShippingRates().then((response)=>{
            setCurrentShipping(response.data[0]);
            setShippingRates(response.data)
        });
    },[])

    useEffect(()=>{
        const fetchCart = async() => {
            return await http.post<CartType>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/cart/fetch`,JSON.stringify({
                email: session?.user?.email
            }));
        };

        session && fetchCart().then((response)=>{
            if(response.status >= 200 && response.status < 300){
                setCart(response.data);
                let total = 0;
                response.data.cartItems.forEach((item)=>total=total+parseFloat((useCurrentCurrency(item)-(item.discount*useCurrentCurrency(item)/100)).toFixed(2)));
                setCartTotal(total);
                setTabs([<Cart key={'cart'} userEmail={session.user?.email}/>, <Shipping key={'shipping'}/>, <Payment key={'payment'}/>]);
            } else {
                setTabs([<Cart key={'cart'}/>, <Shipping key={'shipping'}/>, <Payment key={'payment'}/>]);
            }
            
            setLoading(false);
        });

        !session && status == 'unauthenticated' && setLoading(false);

        session && setTabs([<Cart key={'cart'} userEmail={session.user?.email}/>, <Shipping key={'shipping'}/>, <Payment key={'payment'}/>]);

        appliedPromocode && setDiscount((appliedPromocode.discountPercent*(cartTotal))/100);

        currentCheckoutTab > 0 && setCartComplete(true);

        currentCheckoutTab > 1 && setShippingComplete(true);
    },[session]);

    useEffect(()=>{
        if(cart){
            let total = 0;
            cart.cartItems.forEach((item)=>total=parseFloat((total+(useCurrentCurrency(item)-(item.discount*useCurrentCurrency(item)/100))).toFixed(2))); 
            setCartTotal(total);
        }
    },[currency,cart])

    useEffect(()=>{
        if(appliedPromocode){
            const discount = parseFloat(((appliedPromocode.discountPercent*(cartTotal))/100).toFixed(2));
            setDiscount(discount);
            currentShipping && setShippingFee(parseFloat((((currentShipping.rate)/100)*(cartTotal-discount)).toFixed(2)));
        } else {
            currentShipping && setShippingFee(parseFloat((((currentShipping.rate)/100)*(cartTotal)).toFixed(2)));
        }
    },[appliedPromocode,cartTotal])

    const applyPromocode = async()=>{
        if(!promocode){
            return;
        }
        setLoadingPromocode(true);
        const response = await http.get<PromocodeType>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/promocodes/fetch?code=${promocode.toUpperCase()}`);
        if(response.status >= 200 && response.status < 300 && response.data){
            setDiscount(parseFloat(((response.data.discountPercent*(cartTotal))/100).toFixed(2)));
            setAppliedPromocode(response.data);
        } else {
            utilService.handleErrorInputField(promocodeError,response.data.error || response.statusText);
        }
        setLoadingPromocode(false);
    };

    if (loading || status === "loading"){
        return <Loading />
    }

    if(!session){
        redirect('/pages/auth/login');
    }

    return (
        <Layout>
            { !cart ||  cart.cartItems.length == 0 ? 
                <>
                    <title>Valhalla - Checkout</title>
                    <h3 className="text-black dark:text-white text-lg">
                        <i className="fa-regular fa-face-frown fa-xl text-orange-500 mr-3"></i>
                        Cart is empty. Add some items to see them here
                    </h3>
                </>
            :<>
            <title>Valhalla - Checkout</title>
            <div className="">
                <div className="mb-4">
                    <div className="h-1 w-24 bg-orange-500"></div>
                    <h2 className="text-xl text-black dark:text-white"><span><i className="fa-solid fa-layer-group text-orange-500"></i></span> CHECKOUT</h2>
                </div>
                <div className="flex flex-row gap-x-4 max-lg:flex-col">
                        <div className="flex flex-col w-2/3 max-lg:w-full max-lg:mb-4">
                            <div className="flex flex-row w-full max-lg:hidden !gap-x-0 border mb-8 border-black">
                                <button onClick={()=>{
                                    setCartComplete(false);
                                    setShippingComplete(false);
                                    setCurrentCheckoutTab(0);
                                    }} className="flex flex-row w-1/3">
                                    <div style={{width:'100%'}} className={` ${currentCheckoutTab === 0 ? 'bg-orange-500' : 'bg-white dark:bg-zinc-700' } border-r border-r-black dark:border-r-white relative h-12 flex flex-row items-center justify-center`}>
                                        <div className=" flex flex-row gap-x-2">
                                            <div style={{borderRadius: '50%'}} className={`w-5 h-5 ${cartComplete ? 'bg-orange-500 border-1' : 'bg-transparent border-2'} flex flex-row items-center justify-center ${currentCheckoutTab === 0 ? 'border-white' : 'border-gray-500 dark:border-white'} `}>
                                                {cartComplete ? <i className="fa-solid fa-check fa-2xs text-white"></i> : null}
                                            </div>
                                            <p className={`${currentCheckoutTab === 0 ? 'text-white font-bold' : 'text-gray-500 dark:text-white'}`}>CART</p>
                                        </div>
                                    </div>
                                </button>
                                <div className="flex flex-row w-1/3">
                                    <button disabled={!cartComplete} onClick={()=>{
                                        setShippingComplete(false);
                                        setCurrentCheckoutTab(1);
                                        }} style={{width:'100%'}} className={`${currentCheckoutTab === 1 ? 'bg-orange-500' : 'bg-white dark:bg-zinc-700 '} border-r border-l border-r-black border-l-black dark:border-r-white dark:border-l-white relative w-full h-12 gap-x-2 flex flex-row items-center justify-center`}>
                                        <div className=" flex flex-row gap-x-2">
                                            <div style={{borderRadius: '50%'}} className={`w-5 h-5 ${shippingComplete ? 'bg-orange-500 border-1' : 'bg-transparent border-2'} flex flex-row items-center justify-center ${currentCheckoutTab === 1 ? 'border-white' : 'border-gray-500 dark:border-white'}`}>
                                                {shippingComplete ? <i className="fa-solid fa-check fa-2xs text-white"></i> : null}
                                            </div>
                                            <p className={`${currentCheckoutTab === 1 ? 'text-white font-bold' : 'text-gray-500 dark:text-white'}`}>SHIPPING</p>
                                        </div>
                                    </button>
                                </div>
                                <div className="flex flex-row w-1/3">
                                    <button disabled={!shippingComplete} onClick={()=>setCurrentCheckoutTab(2)}  className={`${currentCheckoutTab === 2 ? 'bg-orange-500' : 'bg-white dark:bg-zinc-700'} border-l border-l-black dark:border-l-white relative w-full h-12 gap-x-2 flex flex-row items-center justify-center`}>
                                        <div className=" flex flex-row gap-x-2">
                                            <div style={{borderRadius: '50%'}} className={`w-5 h-5 border-2 ${currentCheckoutTab === 2 ? 'border-white' : 'border-gray-500 dark:border-white'}`}></div>
                                            <p className={`${currentCheckoutTab === 2 ? 'text-white font-bold' : 'text-gray-500 dark:text-white'}`}>PAYMENT</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-row gap-x-2 lg:hidden checkout-navigation">
                                <div className="flex flex-row mr-3 gap-x-2">
                                    <button onClick={()=>{
                                        setCartComplete(false);
                                        setShippingComplete(false);
                                        setCurrentCheckoutTab(0);
                                    }} className={`bg-transparent mb-4 text-base font-bold ${currentCheckoutTab === 0 ? '!text-orange-500 underline text-lg' : 'text-gray-500 dark:text-white'} ${cartComplete ? '!text-orange-500' : 'text-gray-500 dark:text-white'}`}>
                                        CART
                                    </button>
                                    <p className={`${currentCheckoutTab===0 ? 'text-orange-500' : 'text-gray-500 dark:text-gray-200'}`}>{'>'}</p>
                                </div>
                                
                                <div className="flex flex-row mr-3 gap-x-2">
                                    <button disabled={!cartComplete} onClick={()=>{
                                        setShippingComplete(false);
                                        setCurrentCheckoutTab(1);
                                    }} className={`bg-transparent mb-4 text-base font-bold ${currentCheckoutTab === 1 ? '!text-orange-500 underline text-lg' : 'text-gray-500 dark:text-white'} ${shippingComplete ? '!text-orange-500' : 'text-gray-500 dark:text-white'}`}>
                                        SHIPPING
                                    </button>
                                    <p className={`${currentCheckoutTab===1 ? 'text-orange-500' : 'text-gray-500 dark:text-gray-200'}`}>{'>'}</p>
                                </div>

                                <div className="flex flex-row mr-3 gap-x-2">
                                    <button disabled={!shippingComplete} onClick={()=>{
                                        setCurrentCheckoutTab(2);
                                        }} className={`bg-transparent mb-4 font-bold text-base ${currentCheckoutTab === 2 ? 'text-orange-500 underline text-lg' : 'text-gray-500 dark:text-white'}`}>
                                        PAYMENT
                                    </button>
                                    <p className={`${currentCheckoutTab===2 ? 'text-orange-500' : 'text-gray-500 dark:text-gray-200'}`}>{'>'}</p>
                                </div>
                            </div>

                            {tabs.at(currentCheckoutTab)}

                        </div>
                    <div className="w-1/3 max-lg:w-full max-lg:order-2">
                        <Collapse title="PROMO CODE" className="bg-white dark:bg-transparent">
                            <form onSubmit={(e)=>e.preventDefault()} className="w-full">
                                <input readOnly={appliedPromocode!=undefined} onBlur={(e)=>promocodeError.current.innerHTML=''} required type="text" onChange={(e)=>setPromocode(e.target.value)} value={promocode} id="promo-code" name="promo-code" placeholder="Enter Promo Code" className="px-2 outline-0 w-full shadow-md shadow-zinc-600 dark:shadow-none rounded-md h-10 ring-1 dark:bg-neutral-700 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2" />
                                <div ref={promocodeError} className='text-red-500 text-center mt-2'></div>
                                { appliedPromocode && <div className=" text-white w-full p-2 flex flex-row gap-x-3 items-start justify-start">
                                        <button onClick={(e)=>{
                                            setAppliedPromocode(undefined);
                                            setDiscount(0);
                                            }} title="Click to remove" className="bg-red-600 p-2 text-white rounded-md">
                                            <i className="fa-solid fa-xmark fa-lg text-white"></i>
                                        </button>
                                        <div className=" flex flex-row gap-x-2 bg-green-600 p-2 text-white items-start justify-start rounded-md">
                                            <i className="fa-solid fa-check fa-lg pt-3"></i>
                                            <div>Promo {appliedPromocode?.code} has been applied! - {appliedPromocode?.discountPercent}% off</div>
                                        </div>
                                </div>}
                                <button disabled={loadingPromocode||appliedPromocode!=undefined} onClick={e=>applyPromocode()} type="submit" className="text-white w-full p-2 mt-4 bg-orange-600 md:hover:bg-orange-500 max-md:active:bg-orange-500 disabled:bg-gray-500 disabled:hover:bg-gray-500">Apply Code</button>
                            </form>
                        </Collapse>
                        <div className="bg-white dark:bg-transparent shadow-sm rounded-md shadow-zinc-700 dark:shadow-gray-200 p-4">
                            <h4 className="text-base text-black font-bold dark:text-white mb-4">ORDER SUMMARY</h4>
                            <div className="flex flex-row justify-between items-center mb-2">
                                <p className="text-zinc-700 dark:text-gray-300 text-sm">Subtotal:</p>
                                <p className="text-base text-black dark:text-white font-bold">{`${currency?.symbol||'loading...'} ${cartTotal.toFixed(2)}`}</p>
                            </div>
                            <div className="flex flex-row justify-between items-center mb-2">
                                <p className="text-zinc-700 dark:text-gray-300 text-sm">Discount:</p>
                                <p className="text-base text-black dark:text-white font-bold">- {`${currency?.symbol||'loading...'} ${discount.toFixed(2)}`}</p>
                            </div>
                            <div className="flex flex-row justify-between items-center mb-2">
                                <p className="text-zinc-700 dark:text-gray-300 text-sm">Shipping:</p>
                                <p className="text-base text-black dark:text-white font-bold">{currentCheckoutTab >= 1 ? (shippingFee > 0 ? (currency?.symbol||'loading...'||'') + ' ' + shippingFee : 'FREE') : 'Calculating...'}</p>
                            </div>
                            <hr className="border-b border-b-gray-400"/>
                            <div className="flex flex-row justify-between items-center my-4">
                                <p className="text-lg font-bold text-black dark:text-white">Estimated Total</p>
                                <p className="text-lg font-bold text-black dark:text-white">{currentCheckoutTab == 0 ? `${currency?.symbol||'loading...'} ${parseFloat((cartTotal-discount).toFixed(2))}` : `${currency?.symbol||'loading...'} ${parseFloat((cartTotal+shippingFee-discount).toFixed(2))}`}</p>
                            </div>
                            <hr className="border-b border-b-gray-400 mb-4"/>
                            <div ref={shippingCompleteError} className='text-red-500'></div>

                            {currentCheckoutTab != 2 
                            ?   <button onClick={()=>{
                                if(currentCheckoutTab === 0) {
                                    setCurrentCheckoutTab(1);
                                    setCartComplete(true);
                                    window.scrollTo(0,0);
                                } else if (currentCheckoutTab === 1) {
                                    setCurrentCheckoutTab(2);
                                    setShippingComplete(true);
                                    window.scrollTo(0,0);
                                }
                            }} onBlur={(e)=>{
                                shippingCompleteError.current.innerHTML = '';
                            }} className="text-white w-full p-2 mt-4 bg-orange-600 md:hover:bg-orange-500 max-md:active:bg-orange-500">
                                {currentCheckoutTab === 0 ? 'Checkout' : 'Make Payment' }
                            </button>
                            : null}
                        </div>
                    </div>
                </div>
            </div>
            </>
            }
        </Layout>
    );
};

interface CartProps {
    final?: boolean,
    userEmail?: string | undefined | null
}

const Cart: React.FC<CartProps> = ({final=false, userEmail}) => {
    const http = FrontendServices.get<HttpService>('HttpService');
    
    const [loadingRemove,setLoadingRemove] = useState<boolean>(false);
    const [loadingQuantity, setLoadingQuantity] = useState(false);
    const { cart, setCart, setCartSize: updateCartSize, currency, useCurrentCurrency} = useSharedState();

    const handleRemoveCartItem = async(e: React.FormEvent<HTMLButtonElement>, cartItemId: string ) => {
        e.preventDefault();
        setLoadingRemove(true);
        const response = await http.post<CartType>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/cart/delete`,JSON.stringify({
            userEmail: userEmail,
            itemId: cartItemId
        }));
        if(response.status >= 200 && response.status <300 && response.data){
            setCart(response.data);
            updateCartSize(response.data.cartItems.length);
            setLoadingRemove(false); 
        }
        else if(response.status >= 200 && response.status <300 && !response.data) {
            setCart(null);
            updateCartSize(0);
            setLoadingRemove(false); 
        }
        else {
            //
        }
    };

    if(loadingRemove){
        return <Loading />;
    }

    return (
    <>
    {
        <div className="flex flex-col">
            <div className="bg-white dark:bg-transparent shadow-sm rounded-md shadow-zinc-700 dark:shadow-gray-200 p-4">
                <h3 className="text-base text-black dark:text-white mb-4">{`CART(${cart && cart.cartItems.length ? cart.cartItems.length : 0})`}</h3>
                <hr className="border-b border-b-gray-400 mb-4"/>
                {cart && cart.cartItems.length > 0 && cart.cartItems.map((item)=> {
                    return !loadingRemove || !loadingQuantity ? <div key={item._id}  className="flex flex-col pb-2 mb-3 border-b border-b-zinc-800 dark:border-b-gray-200">
                        <div className="flex flex-row gap-x-4">
                            <div className="max-lg:!w-20 max-lg:!h-20" style={{width:'130px', height:'130px'}}><img className={`w-full h-full object-cover`} src={`${item.images[0].link}`}  alt={`${item.name}`}/></div>
                            <div>
                                <h3 className="text-base text-black dark:text-white">{item.name}</h3>
                                {!final ? item.stock > 0 ? <p className="text-md text-green-600">IN STOCK</p> : <p className="text-md text-red-500">OUT OF STOCK</p> : null }
                                <p className="text-lg text-gray-700 dark:text-gray-300 font-bold">{`${currency?.symbol||'loading...'} ${(useCurrentCurrency(item)-(useCurrentCurrency(item)*item.discount/100)).toFixed(2)}`}</p>
                                {final ? <p className="text-gray-700 dark:text-gray-300 text-base">Qty: {item.quantityInCart}</p> : null}
                            </div>
                        </div>
                        {!final && item.stock > 0 ? <div className="flex flex-row justify-between items-center mt-2 cart-controls">
                        <button onClick={(e)=>handleRemoveCartItem(e, item._id)} className="text-white text-sm bg-orange-600 p-2 rounded-md md:hover:bg-orange-500 max-md:active:bg-orange-500"><i className="fa-regular fa-trash-can"></i> REMOVE
                        </button>
                        <div className="flex flex-row items-center">
                            <button onClick={async(e)=>{
                                if(item.quantityInCart != undefined && item.quantityInCart > 1){
                                    const cartItems = cart.cartItems.map((i)=>({...i}));
                                    const existingItem = cartItems.find((i)=>i._id==item._id);
                                    if(existingItem && existingItem.quantityInCart){
                                        const oldUnitPrice = parseInt((existingItem.price/existingItem.quantityInCart).toFixed(2));
                                        existingItem.price = oldUnitPrice * (existingItem.quantityInCart-1);
                                        existingItem.quantityInCart -= 1;
                                        setLoadingQuantity(true);
                                        const response = await http.post<CartType>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/cart/edit`,JSON.stringify({
                                            userEmail: userEmail,
                                            cartItems: cartItems
                                        }));
                                        if(response.status == 200 && response.data){
                                            setCart(response.data);
                                            setLoadingQuantity(false);
                                        }
                                    }
                                }
                            
                            }} className="bg-orange-600 text-white text-2xl px-2 shadow-sm shadow-zinc-700 rounded-md md:hover:bg-orange-500 max-md:active:bg-orange-500"> -</button>
                            <div className="w-10 text-center text-black dark:text-white">{item.quantityInCart}</div>
                            <button onClick={async(e)=>{
                                if(item.quantityInCart != undefined && item.quantityInCart < item.stock){
                                    const cartItems = cart.cartItems.map((i)=>({...i}));
                                    const existingItem = cartItems.find((i)=>i._id==item._id);
                                    if(existingItem && existingItem.quantityInCart){
                                        const oldUnitPrice = parseInt((existingItem.price/existingItem.quantityInCart).toFixed(2));
                                        existingItem.price = oldUnitPrice * (existingItem.quantityInCart+1);
                                        existingItem.quantityInCart += 1;
                                        setLoadingQuantity(true);
                                        const response = await http.post<CartType>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/cart/edit`,JSON.stringify({
                                            userEmail: userEmail,
                                            cartItems: cartItems
                                        }));
                                        if(response.status == 200 && response.data){
                                            setCart(response.data);
                                            setLoadingQuantity(false);
                                        }
                                    }
                                }
                            }} className="bg-orange-600 text-white text-2xl px-2 shadow-sm shadow-zinc-700 rounded-md md:hover:bg-orange-500 max-md:active:bg-orange-500"> +</button>
                        </div>
                        </div> : null}
                    </div> : <Loading /> }
                )}
            </div>
        </div>
    }
    </>
    );
};

interface shippingOption {
    text: string,
    price: number,
    minDays: number,
    maxDays: number
}

const Shipping: React.FC = () => {

    const { useCurrentCurrency, currency, cart, shippingFee, setShippingFee, cartTotal, shippingRates, setCurrentShipping, currentShipping, appliedPromocode
    } = useSharedState();

    useEffect(()=>{
        if(appliedPromocode){
            const discount = parseFloat(((appliedPromocode.discountPercent*(cartTotal))/100).toFixed(2));
            setShippingOptions(shippingRates.map((rate)=>{
                return {text: rate.name, price: parseFloat((((rate.rate)/100)*(cartTotal-discount)).toFixed(2)), minDays: rate.minimumDeliveryDays, maxDays: rate.maximumDeliveryDays||0}
            }));
            const found = shippingRates.find((s)=>s.name==currentShipping?.name);
            if(found){
                setShippingFee(parseFloat((((found.rate)/100)*(cartTotal-discount)).toFixed(2)));
            }
        } else {
            setShippingOptions(shippingOptionsCopy);
            const found = shippingRates.find((s)=>s.name==currentShipping?.name);
            if(found){
                setShippingFee(parseFloat((((found.rate)/100)*(cartTotal)).toFixed(2)));
            }
        }

    },[appliedPromocode,cartTotal])

    const [shippingOptions, setShippingOptions] = useState<shippingOption[]>(
        shippingRates.map((rate)=>{
            return {text: rate.name, price: parseFloat((((rate.rate)/100)*(cartTotal)).toFixed(2)), minDays: rate.minimumDeliveryDays, maxDays: rate.maximumDeliveryDays||0}
    }));

    const [shippingOptionsCopy, setShippingOptionsCopy] = useState<shippingOption[]>(
        shippingRates.map((rate)=>{
            return {text: rate.name, price: parseFloat((((rate.rate)/100)*(cartTotal)).toFixed(2)), minDays: rate.minimumDeliveryDays, maxDays: rate.maximumDeliveryDays||0}
    }));

    return (
        <>
        <div className="flex flex-col bg-white dark:bg-transparent shadow-sm rounded-md shadow-zinc-700 dark:shadow-gray-200 p-4">
            <h3 className="text-base text-black dark:text-white mb-4">SHIPPING SOON</h3>
            <hr className="border-b border-b-gray-400 mb-4"/>
            {cart?.cartItems.map((item,index)=>{
                return  <div key={index} className="flex flex-row gap-x-4 mb-2">
                <div className="max-lg:!w-20 max-lg:!h-20" style={{width:'120px', height:'120px'}}><img className="w-full h-full" src={`${item.images[0].link}`}  alt={''}/></div>
                <div>
                    <h3 className="text-xl text-black dark:text-white">{item.name}</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-lg">Qty: {item.quantityInCart}</p>
                </div>
            </div>
            })}
            <div className="flex flex-col mt-4" >
                    {shippingOptions.map((option,index)=>{
                    return <label key={index} className="flex flex-col mb-4">
                        <div className="flex flex-row items-center">
                            <input type="radio" value={option.price} checked={option.text == currentShipping?.name} onChange={(e)=>{
                                const found = shippingRates.find((s)=>s.name==option.text);
                                found && setCurrentShipping(found);
                                setShippingFee(parseFloat(e.target.value));
                            }} className="w-5 h-5" />
                            <p className="text-black dark:text-white inline ml-2 text-base">{option.text}<span className="font-bold ml-2 text-lg text-black dark:text-white">{option.price == 0 ? 'FREE' : (currency?.symbol||'loading...'||'')+' '+option.price }</span></p>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 inline ml-2 text-sm">{option.maxDays ? `Between ${option.minDays} and ${option.maxDays} business days` : `Takes ${option.minDays} business days`}</p>
                    </label> 
                })}
            </div>
            <div className="text-zinc-700 dark:text-gray-300 italic text-base mt-4">
                *Orders will not be shipping on Saturdays, Sundays or During Holidays. Some shipments may take longer to reach
                you depending on the location. Kindly contact us through our communication channels for any shipping enquiries
                or questions.
            </div>
        </div>
        </>
    );
};

interface paymentOption {
    text: string,
    value: string
}

const Payment: React.FC = () => {

    const validationService = FrontendServices.get<ValidationService>('ValidationService');
    const http = FrontendServices.get<HttpService>('HttpService');
    const utilService = FrontendServices.get<UtilService>('UtilService');

    const { useCurrentCurrency, currency, cart, shippingFee, setShippingFee, cartTotal,
        countryName, setCountryName, firstName, setFirstName, lastName, setLastName,
        phoneNumber, setPhoneNumber, phoneCode, setPhoneCode, address, setAddress, 
        city, setCity, postalCode, setPostalCode, useStripe, currencyRates, currentShipping,
        appliedPromocode
     } = useSharedState();

    const [paymentOptions, setPaymentOptions] = useState<paymentOption[]>([
        {text: 'Pay with Stripe', value: 'STRIPE'},
        {text: 'Pay with M-PESA', value: 'M-PESA'}
    ]);

    const [paymentOptionsCopy, setPaymentOptionsCopy] = useState<paymentOption[]>([
        {text: 'Pay with Stripe', value: 'STRIPE'},
        {text: 'Pay with M-PESA', value: 'M-PESA'}
    ]);

    const [paymentOption, setPaymentOption] = useState<string>('STRIPE');
    const [loadingStripe, setLoadingStripe] = useState<boolean>(false);

    const phoneNumberError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;
    
    const stripeError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;

    useEffect(()=>{
        if(currency && currency.shortName != 'KES'){
            setPaymentOption('STRIPE');
            setPaymentOptions(paymentOptionsCopy.filter((option)=>option.value!='M-PESA'));
        } else {
            setPaymentOption('M-PESA');
            setPaymentOptions([...paymentOptionsCopy]);
            // paymentOptions.filter((option)=>option.value=='M-PESA').length == 0
            // && setPaymentOptions([...paymentOptions, {text: 'Pay with M-PESA', value: 'M-PESA'}])
        }
    },[currency])

    useEffect(()=>{
        const countrycurr = countryPhoneNumbers.filter((country)=>country.countryName.toLowerCase()==countryName.toLowerCase());
        paymentOption == 'M-PESA ' && validationService.validatePhoneNumbers(countrycurr[0].regexPattern,phoneCode+phoneNumber,phoneNumberError);
    },
    [phoneCode])

    const handleStripeCheckout = async() => {
        const stripe = await useStripe();
        if(!stripe){
            utilService.handleErrorInputField(stripeError,'Failed to connect to stripe');
            return;
        } else {

            if(!cart){
                return utilService.handleErrorInputField(stripeError,'Cart seems to be empty');
            }

            setLoadingStripe(true);

            let data : {
                cart: CartType | null,
                shippingId: string | undefined,
                shippingFee: number,
                currency: CurrenciesType | null,
                cartTotal: number,
                promocode?: PromocodeType
            } = {
                cart: {...cart, cartItems: cart.cartItems.map((i)=>({...i, price: useCurrentCurrency(i)}))},
                shippingId: currentShipping?._id,
                shippingFee: shippingFee,
                currency: currency,
                cartTotal: cartTotal,
            }
            if(appliedPromocode){
                data.promocode = appliedPromocode;
                let total = cartTotal - appliedPromocode.discountPercent*cartTotal/100;
                data.cartTotal = total;
            }
            
            const response = await http.post<{stripeSession: Stripe.Response<Stripe.Checkout.Session>, error?: string}>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/payment/stripe/session`,
            JSON.stringify(data));

            if(response.status == 200){
                const {error} = await stripe.redirectToCheckout({sessionId: response.data.stripeSession.id});
                if(error){
                    utilService.handleErrorInputField(stripeError,error.message||'Failed to redirect to stripe. Try again later.');
                }
            } else {
                utilService.handleErrorInputField(stripeError,response.data.error || response.statusText);
                setLoadingStripe(false); 
            }
        }
    };

    const handleMPESACheckout = () => {

    };

    return (
        <>
                    <div className="flex flex-col bg-white dark:bg-transparent shadow-sm rounded-md shadow-zinc-700 dark:shadow-gray-200 p-4">
                        <h3 className="text-base text-black dark:text-white mb-4">PAYMENT DETAILS</h3>
                        <hr className="border-b border-b-gray-400 mb-4"/>
                        <div>
                            {paymentOptions.map((option,index)=>{
                                    return <label key={index} className="flex flex-row items-center mb-4">
                                    <input type="radio" value={option.value} checked={paymentOption == option.value} onChange={(e)=>{
                                        setPaymentOption(e.target.value);
                                    }} className="w-5 h-5" />
                                    <p className="text-black dark:text-white inline ml-2 text-base">{option.text}</p>
                                </label> 
                            })}
                        </div>
                        {paymentOption == 'M-PESA' ? 
                        <div className="-mt-4">
                            <h3 className="text-base text-black dark:text-white mt-8 mb-4 font-bold">Shipping Information</h3>
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                <div className="w-full">
                                    <label htmlFor="country" className="block text-black dark:text-white">Country*</label>
                                    <select value={countryName} onChange={(e)=>{
                                        setCountryName(e.target.value);
                                        let curr = countryPhoneNumbers.find((c)=>c.countryName==e.target.value);
                                        if(curr){
                                            setPhoneCode(curr.phoneCode);
                                        }
                                        }} name="country" className="p-2 outline-0 w-full rounded-md h-10 ring-1 text-black dark:text-white bg-gray-100 dark:bg-neutral-600 ring-orange-400 outline-orange-400 focus:ring-2">
                                        {countryPhoneNumbers.map((country,index)=>{
                                            return <option key={index} value={country.countryName}>{country.countryName}</option>
                                        }) }
                                    </select>
                                </div>
                                <div className="w-full">
                                    <label htmlFor="address" className="block text-black dark:text-white">Address*</label>
                                    <input type="text" value={address} onChange={(e)=>setAddress(e.target.value)} id="address" name="address" placeholder="Address..." className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-700 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2" />
                                </div>
                                <div className="w-full">
                                    <label htmlFor="city" className="block text-black dark:text-white">City*</label>
                                    <input type="text" value={city} onChange={(e)=>setCity(e.target.value)} id="city" name="city" placeholder="City..." className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-700 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2" />
                                </div>
                                <div className="w-full">
                                    <label htmlFor="postalCode" className="block text-black dark:text-white">Postal Code*</label>
                                    <input type="text" value={postalCode} onChange={(e)=>setPostalCode(e.target.value)} id="postalCode" name="postalCode" placeholder="Postal Code..." className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-700 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2" />
                                </div>
                            </div>

                            <h3 className="text-base text-black dark:text-white mt-8 mb-4 font-bold">Contact Information</h3>
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                <div className="w-full">
                                        <label htmlFor="phone" className="block text-black dark:text-white">Phone Number*</label>
                                        <div className="flex flex-row ring-1 ring-orange-400 outline-0 focus-within:ring-2 rounded-md">
                                            <div id="phoneCode" className="p-2 w-fit outline-0 rounded-tl-md rounded-bl-md h-10 text-black dark:text-white bg-gray-100 dark:bg-neutral-600">
                                                {phoneCode}
                                            </div>
                                            <input onBlur={()=>{
                                                    const countrycurr = countryPhoneNumbers.filter((country)=>country.countryName.toLowerCase()==countryName.toLowerCase());
                                                    phoneNumber.length > 0 ?
                                                    validationService.validatePhoneNumbers(countrycurr[0].regexPattern,phoneCode+phoneNumber,phoneNumberError)
                                                    : phoneNumberError.current.innerHTML = ''
                                            }} type="tel" onChange={(e)=>{
                                                const countrycurr = countryPhoneNumbers.filter((country)=>country.countryName.toLowerCase()==countryName.toLowerCase());
                                                if(new RegExp(/^\d+$/).test(e.target.value) && e.target.value.length <= countrycurr[0].maxLength ){
                                                    setPhoneNumber(e.target.value);
                                                } else {
                                                    if(e.target.value.length == 0){
                                                        setPhoneNumber('');
                                                    }
                                                }
                                            }} value={phoneNumber} id="phone" name="phone" placeholder={`${countryPhoneNumbers.find((country)=>country.countryName.toLowerCase()==countryName.toLowerCase())?.samplePhoneNumber}`} className="px-2 flex-grow outline-0 rounded-tr-md rounded-br-md h-10 dark:bg-neutral-700 dark:text-white" 
                                            pattern={`${countryPhoneNumbers.find((country)=>country.countryName.toLowerCase()==countryName.toLowerCase())?.regexPattern}`} />
                                        </div>
                                        <div ref={phoneNumberError} className='text-red-500'></div>
                                </div>
                                <div className="w-full">
                                    <label htmlFor="firstName" className="block text-black dark:text-white">First Name*</label>
                                    <input type="text" value={firstName} onChange={(e)=>setFirstName(e.target.value)} id="firstName" name="firstName" placeholder="First Name..." className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-700 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2" />
                                </div>
                                <div className="w-full">
                                    <label htmlFor="lastName" className="block text-black dark:text-white">Last Name*</label>
                                    <input type="text" value={lastName} onChange={(e)=>setLastName(e.target.value)} id="lastName" name="lastName" placeholder="Last Name..." className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-700 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2" />
                                </div>
                            </div>
                        </div>
                        : 
                        <div>
                            <div onBlur={(e)=>stripeError.current.innerHTML = ''} ref={stripeError} className='text-red-500'></div>
                            <button disabled={loadingStripe} onClick={(e)=>handleStripeCheckout()} className="text-white w-full p-2 mt-4 text-lg bg-orange-600 md:hover:bg-orange-500 max-md:active:bg-orange-500 disabled:bg-gray-500 disabled:hover:bg-gray-500">
                                <i className="fa-brands fa-cc-stripe fa-lg"></i> CHECKOUT
                            </button>
                        </div>}
                    </div>
        </>
    );
};

export default Checkout;