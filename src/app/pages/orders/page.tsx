'use client'

import Layout from "@/components/Layout";
import Loading from "@/components/loading";
import { FrontendServices } from "@/lib/inversify.config";
import { OrderType } from "@/models/order";
import { HttpService } from "@/services/httpService";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

const Orders: React.FC = () => {

    const http = FrontendServices.get<HttpService>('HttpService');
    const {data: session , status} = useSession();
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [, setTempOrders] = useState<OrderType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchText, setSearchText] = useState('');

    useEffect(()=>{
        const fetchUserOrders = async() => {
            return http.get<OrderType[]>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/orders/fetch/email/userEmail=${encodeURIComponent(session?.user?.email||'')}`);
        };

        session && fetchUserOrders().then((response)=>{
            if(response.status == 200){
                setOrders(response.data);
                setTempOrders(response.data);
            } else {
                //
            }
            setLoading(false);
        });
    },[http, session])

    const searchOrders = () => {
        setTempOrders(orders.filter((order)=>order.orderId.toLowerCase().includes(searchText.toLowerCase())));
    };

    useEffect(()=>{
        searchText === '' ? setTempOrders(orders) : null;
    },[orders, searchText])

    if(loading || status == 'loading'){
        return <Loading />;
    }

    return (
        <Layout>
            <title>Valhalla - Orders</title>
            <div className="mb-4">
                <div className="h-1 w-24 bg-orange-500"></div>
                <h2 className="text-xl text-black dark:text-white"><span><i className="fa-solid fa-bars-progress text-orange-500"></i></span> ORDERS</h2>
            </div>
            {!loading && orders.length == 0
            ?
            <h2 className="text-black dark:text-white text-lg">Your Orders will appear here</h2>
            :
            <div>
                <div className={`flex max-sm:w-full flex-row mb-2 w-96 items-center h-11 shadow-md shadow-zinc-600 dark:shadow-none focus-within:dark:shadow-sm rounded-md`}>
                    <input type="search" placeholder="Search..." value={searchText} onChange={(e)=>setSearchText(e.target.value)} className={`search-bar h-full w-full rounded-s-md p-2 dark:text-white dark:bg-zinc-700 text-black outline-none`} />
                    <button className="h-full w-16 px-3 bg-orange-600 md:hover:bg-orange-600 max-md:active:bg-orange-600 text-white rounded-e-md" title="search" onClick={()=>searchOrders()}>
                        <i className="fa-solid fa-magnifying-glass fa-xl"></i>
                    </button>
                </div>
                <div className="">
                        <div className="max-lg:hidden items-center grid grid-cols-auto-fit-100 text-base px-3 py-3 my-2 font-bold text-center">
                            <div className="text-black dark:text-white font-bold">DATE
                                <button onClick={()=>setOrders(orders.toSorted((a,b)=>{
                                    if(b.created && a.created){
                                        return new Date(b.created).getTime() - new Date(a.created).getTime()
                                    } else {
                                        return b.total - a.total;
                                    }
                                }))} className="ml-1 p-1 rounded-sm dark:md:hover:bg-orange-500 md:hover:bg-zinc-300 max-md:active:bg-zinc-300 dark:max-md:active:bg-orange-500" title="sort desc"><i className="fa-solid fa-arrow-down-wide-short"></i></button>
                                <button onClick={()=>setOrders(orders.toSorted((a,b)=>{
                                    if(b.created && a.created){
                                        return new Date(a.created).getTime() - new Date(b.created).getTime()
                                    } else {
                                        return a.total - b.total;
                                    }
                                }))} className="ml-1 p-1 rounded-sm dark:md:hover:bg-orange-500 md:hover:bg-zinc-300 max-md:active:bg-zinc-300 dark:max-md:active:bg-orange-500" title="sort asc"><i className="fa-solid fa-arrow-up-wide-short"></i></button>
                            </div>
                            <div className="text-black dark:text-white font-bold">STATUS</div>
                            <div className="text-black dark:text-white font-bold">ORDERID</div>
                            <div className="text-black dark:text-white font-bold">PAYMENT METHOD</div>
                            <div className="text-black dark:text-white font-bold">TOTAL
                                <button onClick={()=>setOrders(orders.toSorted((a,b)=>{
                                        return b.total - a.total;
                                }))} className="ml-1 p-1 rounded-sm md:hover:bg-zinc-300 max-md:active:bg-zinc-300 dark:md:hover:bg-orange-500  dark:max-md:active:bg-orange-500" title="sort desc"><i className="fa-solid fa-arrow-down-wide-short"></i></button>
                                <button onClick={()=>setOrders(orders.toSorted((a,b)=>{
                                        return a.total - b.total;
                                }))} className="ml-1 p-1 rounded-sm md:hover:bg-zinc-300 max-md:active:bg-zinc-300 dark:md:hover:bg-orange-500 dark:max-md:active:bg-orange-500" title="sort asc"><i className="fa-solid fa-arrow-up-wide-short"></i></button>
                            
                            </div>
                            <div className="text-black dark:text-white font-bold">VIEW ORDER</div>  
                        </div>
                        {orders.map((order,index)=>{
                            return <div className="dark:bg-zinc-700 shadow-md shadow-zinc-600 dark:shadow-none bg-gray-100 rounded-md p-2 mb-4 text-sm break-words max-lg:hidden grid grid-cols-auto-fit-100 items-center" key={index}>
                                <div id="date" className="text-black dark:text-white text-center">{order.created?.toString()}</div>
                                <div id="deliveryStatus" className="text-black dark:text-white text-center">{order.deliveryStatus}</div>
                                <div id="orderId" className="text-black dark:text-white text-center">{order.orderId}</div>
                                <div id="paymentMethod" className="text-black dark:text-white text-center">{order.paymentMethod.toUpperCase()}</div>
                                <div id="total" className="text-black dark:text-white text-center">{order.currency} {order.total}</div>
                                <button className="underline text-base text-orange-500">Details</button>
                            </div>
                        })}
                        {orders.map((order,index)=>{
                            return <div className="lg:hidden order-card dark:bg-zinc-700 shadow-md shadow-zinc-600 p-4 flex flex-col gap-2 dark:shadow-none bg-gray-100 my-3 rounded-md cursor-default" key={index}>
                            <div id="date" className="flex flex-row justify-between items-center">
                                <div className="text-black dark:text-white font-bold">DATE: </div>
                                <div className="dark:text-white text-zinc-800 text-sm">{order.created?.toString()}</div>
                            </div>
                            <div id="deliveryStatus" className="flex flex-row justify-between items-center">
                                <div className="text-black dark:text-white font-bold">DELIVERY STATUS: </div>
                                <div className="dark:text-white text-zinc-800 text-sm">{order.deliveryStatus}</div>
                            </div>
                            <div id="orderId" className="flex flex-row justify-between items-center">
                                <div className="text-black dark:text-white font-bold">ORDER ID: </div>
                                <div className="dark:text-white text-zinc-800 text-sm">{order.orderId}</div>
                            </div>
                            <div id="paymentId" className="flex flex-row justify-between items-center">
                                <div className="text-black dark:text-white font-bold">PAYMENT METHOD: </div>
                                <div className="dark:text-white text-zinc-800 text-sm">{order.paymentMethod.toUpperCase()}</div>
                            </div>
                            <div id="total" className="flex flex-row justify-between items-center">
                                <div className="text-black dark:text-white font-bold">TOTAL: </div>
                                <div className="dark:text-white text-zinc-800 text-sm">{order.currency} {order.total}</div>
                            </div>
                            <div id="action" className="flex flex-row justify-between items-center">
                                <div className="text-black dark:text-white font-bold">VIEW ORDER: </div>
                                <button className="underline text-base text-orange-500">Details</button>
                            </div>
                        </div>
                        })}
                </div>
            </div>  
            }
        </Layout>
    );
}

export default Orders;