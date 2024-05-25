import { Collapse } from "./collapse";
import React from "react";

export const Footer: React.FC = () => {
    return (
    <div id="footers" className="mt-auto py-2">
        <section id="newsletter" className="mb-8 w-full">
            <div className="w-full bg-orange-800 p-4 flex flex-row items-center gap-x-2">
                <i className="fa-regular fa-newspaper text-white fa-xl"></i>
                <p className="text-white text-base">Click <a href="" className="text-slate-200 md:hover:text-slate-100 max-md:active:text-slate-100 underline text-base">here</a> to sign up for our news letter and receive great monthly offers & discounts!</p>
            </div>
        </section>
        <div className="max-lg:hidden grid grid-flow-row md:grid-cols-5 p-4 gap-x-4">
            <div className="text-black dark:text-white flex flex-col col-span-2 gap-y-2 p-2">
                <div className=" flex flex-row items-center">
                    <i className="fa-solid fa-headset fa-2xl text-orange-400"></i>
                    <p className="ml-2 text-sm text-zinc-800 dark:text-gray-200">Something to ask? Get in touch</p>
                </div>
                <div className="flex flex-row text-sm font-bold dark:text-white text-black">
                    {process.env.NEXT_PUBLIC_STORE_PHONE_CONTACT}
                </div>
                <div className="mt-4 break-words">
                    <h3 className="text-base text-zinc-800 dark:text-gray-200 font-bold">Store Location</h3>
                    <p className="text-sm text-zinc-800 dark:text-gray-200">{process.env.NEXT_PUBLIC_STORE_LOCATION}</p>
                </div>
                <div className="mt-8 flex flex-row gap-x-3 items-center pb-8">
                    <i className="fa-brands fa-youtube fa-xl"></i>
                    <i className="fa-brands fa-tiktok fa-xl"></i>
                    <i className="fa-brands fa-twitter fa-xl"></i>
                    <i className="fa-brands fa-facebook fa-xl"></i>
                </div>
            </div>
            <div className="">
                <h3 className="text-base text-zinc-800 dark:text-gray-200 font-bold">Company</h3>
                <ul className="flex flex-col gap-y-2 mt-4">
                    <li className="text-sm text-zinc-800 dark:text-gray-200">About us</li>
                    <li className="text-sm text-zinc-800 dark:text-gray-200">Contact us</li>
                </ul>
            </div>
            <div className="">
                <h3 className="text-base text-zinc-800 dark:text-gray-200 font-bold">Affordable</h3>
                <ul className="flex flex-col gap-y-2 mt-4">
                    <li className="text-sm text-zinc-800 dark:text-gray-200">Storage</li>
                    <li className="text-sm text-zinc-800 dark:text-gray-200">Audio</li>
                    <li className="text-sm text-zinc-800 dark:text-gray-200">Phones</li>
                    <li className="text-sm text-zinc-800 dark:text-gray-200">Powerbanks</li>
                </ul>
            </div>
            <div className="">
                <h3 className="text-base text-zinc-800 dark:text-gray-200 font-bold">Quality</h3>
                <ul className="flex flex-col gap-y-2 mt-4">
                    <li className="text-sm text-zinc-800 dark:text-gray-200">Cameras</li>
                    <li className="text-sm text-zinc-800 dark:text-gray-200">Consoles</li>
                    <li className="text-sm text-zinc-800 dark:text-gray-200">PCs</li>
                    <li className="text-sm text-zinc-800 dark:text-gray-200">Laptops</li>
                </ul>
            </div>
        </div>
        <div className="lg:hidden px-4">
            <Collapse title="Reach us">
                <p className="text-sm text-zinc-800 dark:text-gray-200">{process.env.NEXT_PUBLIC_STORE_LOCATION}</p>
                <p className="text-sm text-zinc-800 dark:text-gray-200">{process.env.NEXT_PUBLIC_VALHALLA_EMAIL}</p>
                <div className="flex flex-row text-sm font-bold dark:text-white text-black">
                    {process.env.NEXT_PUBLIC_STORE_PHONE_CONTACT}
                </div>
            </Collapse>
            <Collapse title="Affordable">
                <ul className="flex flex-col gap-y-2">
                    <li className="text-sm text-zinc-800 dark:text-gray-200">Storage</li>
                    <li className="text-sm text-zinc-800 dark:text-gray-200">Audio</li>
                    <li className="text-sm text-zinc-800 dark:text-gray-200">Phones</li>
                    <li className="text-sm text-zinc-800 dark:text-gray-200">Powerbanks</li>
                </ul>
            </Collapse>
            <div className="mt-8 flex flex-row gap-x-4 items-center justify-center pb-10 text-black dark:text-white ">
                    <i className="fa-brands fa-youtube fa-xl"></i>
                    <i className="fa-brands fa-tiktok fa-xl"></i>
                    <i className="fa-brands fa-twitter fa-xl"></i>
                    <i className="fa-brands fa-facebook fa-xl"></i>
            </div>
        </div>
        <div className="flex flex-row items-center justify-center dark:bg-zinc-700 bg-zinc-200 p-4">
            <p className="text-black dark:text-white text-sm">Copyright © {new Date(Date.now()).getFullYear()} · All Rights Reserved · Valhalla Web designed by · <a rel="no-referrer" target="_blank" className="font-bold underline md:hover:text-orange-500 max-md:active:text-orange-500 md:dark:hover:text-orange-400 max-md:dark:active:text-orange-400" href="https://github.com/DKTOMZ">Dennis Tomno</a></p>
        </div>
    </div>
    );
};