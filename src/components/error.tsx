import LayoutAlt from "./LayoutAlt";
import React from "react";

interface ErrorProps {
    error: string,
    title?: string
}

/**
 * Error component
 * @param props
 * @param props.error
 * error message 
 * @param props.title
 * error message title 
 */
const ErrorPage: React.FC<ErrorProps> = ({ error, title='' }) => {
    return <LayoutAlt>
        <title>Valhalla - Error</title> 
        <div className="flex flex-col items-center h-full justify-center mx-4">
            <h2 className="mb-2 text-3xl dark:text-white">{title}</h2>
            <p className="text-red-500 text-xl">{error}</p>
        </div>
    </LayoutAlt>
};

export default ErrorPage;