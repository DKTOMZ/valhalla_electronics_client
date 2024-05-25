'use client'
import React, { useEffect, useState } from "react";
import { runSnow } from "@/utils/confetti";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { FrontendServices } from "@/lib/inversify.config";
import { HttpService } from "@/services/httpService";
import Loading from "@/components/loading";
import Layout from "@/components/Layout";
import { OrderType } from "@/models/order";
import { useSession } from "next-auth/react";

const OrderComplete: React.FC = () => {
    const [orderExists, setOrderExists] = useState(true);
    const [loadingOrder, setLoadingOrder] = useState(true);
    const http = FrontendServices.get<HttpService>('HttpService');
    const router = useRouter();
    const orderId = useSearchParams().get("id");
    const {data: session , status} = useSession();

    useEffect(()=>{
        if(!loadingOrder && orderExists){
            runSnow();
        }
    },[orderExists,loadingOrder, session]);

    useEffect(()=>{
        const checkOrder = async() => {
            return http.get<OrderType>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/orders/fetch/id/id=${orderId}`);
        };
        checkOrder().then((response)=>{
            if(response.status != 200){
                setOrderExists(false);
            }
            setLoadingOrder(false);
        });
    },[http, orderId])

    if(!orderId || !orderExists){
        redirect('/pages/checkout');
    }

    if(loadingOrder || status === "loading"){
        return <Loading />;
    }

    return (
        <Layout>
            <div className="flex flex-col items-center p-5 justify-center rounded-md bg-gray-200 dark:bg-zinc-700">
                <div className="flex flex-col p-5">
                    <h4 className="text-green-500 text-center mb-4 text-2xl">
                        <i className="fa-regular fa-circle-check fa-lg"></i>
                        <strong> Order successful! - {orderId}</strong>
                    </h4>
                    <p className="text-black dark:text-white text-lg mb-2">Your order has been successfully placed. Please check your email for order details</p>
                    <p className="text-black dark:text-white text-lg mb-2">You can view all your orders in the orders page.</p>
                    <p className="text-black dark:text-white text-lg mb-2">If you have other questions, please email 
                    <a className="text-orange-500 text-lg mb-2" href={`mailto:${process.env.NEXT_PUBLIC_VALHALLA_EMAIL}`}> {process.env.NEXT_PUBLIC_VALHALLA_EMAIL}</a>
                    </p>
                    <p className="text-black dark:text-white text-lg mb-2">Thank you for your supporting us.</p>
                    <button onClick={()=>router.replace('/')}
                    className='flex items-center mt-3 px-2 disabled:bg-gray-500 disabled:hover:bg-gray-500 justify-center border-2 bg-orange-600 border-orange-500 md:hover:bg-orange-500 max-md:active:bg-orange-100 rounded-md text-white h-10'>
                        Continue Shopping
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default OrderComplete;