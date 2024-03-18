import { Footer } from "./Footer";
import Nav from "./Nav";
import React from "react";

interface LayoutProps {
    children: React.ReactNode
}

const Layout: React.FC<LayoutProps>  = ({ children }) => {
    return (
        <>
            <div className="px-5 min-h-screen dark:px-5 max-sm:px-4 py-3 flex-col lg:px-6 dark:lg:px-6 items-center justify-center">
                <Nav />
                <div className="sm:mt-48 md:mt-48 lg:mt-48 xl:mt-32 mt-40 top-space"></div>
                {children}
            </div>
            <Footer />
        </>
    );
};

export default Layout;