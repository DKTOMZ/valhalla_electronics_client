'use client'

import Layout from "@/components/Layout";
import React from "react";

const Favorites: React.FC = () => {
    return (
        <Layout>
            <div className="mb-4">
                <div className="h-1 w-24 bg-orange-400"></div>
                <h2 className="text-xl text-black dark:text-white"><span><i className="fa-solid fa-heart text-orange-400"></i></span> FAVORITES</h2>
            </div>
            <h2 className="text-black dark:text-white text-lg">Your Favorites appear here</h2>
        </Layout>
    );
}

export default Favorites;