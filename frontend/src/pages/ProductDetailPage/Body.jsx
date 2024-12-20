import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BreadCrumb from "../Header/Breadcrumb/BreadCrumb";
import ProductTopPage from "./ProductDetailTop/ProductTopPage";
import ProductTabs from "./ProductDetailBottom/ProductTabs";

const Body = () => {
    const { productId } = useParams();  // Get the productId from the URL

    useEffect(() => {
        // Scroll to the top of the page when productId changes
        window.scrollTo(0, 0);
    }, [productId]);

    return (
        <>
            <main className="main">
                <BreadCrumb />
                <div className="page-content">
                    <div className="container">
                        <ProductTopPage productId={productId} />
                        <ProductTabs productId={productId} />
                    </div>
                </div>
            </main>
        </>
    );
};

export default Body;
