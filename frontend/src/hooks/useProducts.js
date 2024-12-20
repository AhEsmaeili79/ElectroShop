import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { fetchReviews } from "../api/reviewApi";
import { fetchCategories } from '../../../Home/new-arrivals/api/categoryapi';

const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 6;
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState([]);
    const [selectedColor, setSelectedColor] = useState([]);
    const [sortBy, setSortBy] = useState('popularity');
    const [reviewsData, setReviewsData] = useState({});
    const [categoryName, setCategoryName] = useState('');
    const [priceRange, setPriceRange] = useState([0, 100000]); // Add price range state

    const [searchParams] = useSearchParams();
    const query = searchParams.get("q");
    const categoryId = searchParams.get("category");

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                const params = {};
                if (categoryId) params.category = categoryId;
                if (selectedCategory.length > 0) params.category = selectedCategory.join(',');
                if (selectedBrand.length > 0) params.brand = selectedBrand.join(',');
                if (selectedColor.length > 0) params.color = selectedColor.join(',');
                if (query) params.q = query;

                const response = await axios.get('http://127.0.0.1:8000/api/customer-products/', { params });
                let filteredProducts = response.data;

                if (categoryId) {
                    filteredProducts = filteredProducts.filter(product =>
                        product.category.id === parseInt(categoryId)
                    );

                    const categories = await fetchCategories();
                    const category = categories.find(cat => cat.id === parseInt(categoryId));
                    if (category) setCategoryName(category.name);
                }

                if (selectedCategory.length > 0) {
                    filteredProducts = filteredProducts.filter(product =>
                        selectedCategory.includes(`category-${product.category.id}`)
                    );
                }

                if (query) {
                    filteredProducts = filteredProducts.filter(product =>
                        product.name.toLowerCase().includes(query.toLowerCase())
                    );
                }

                // Deduplicate products by ID
                const uniqueProductsMap = new Map();
                filteredProducts.forEach(product => {
                    uniqueProductsMap.set(product.id, product);
                });
                filteredProducts = Array.from(uniqueProductsMap.values());

                const productReviews = await Promise.all(filteredProducts.map(product =>
                    fetchReviews(product.id).then(reviews => ({
                        productId: product.id,
                        reviews
                    }))
                ));

                const reviewsMap = productReviews.reduce((acc, { productId, reviews }) => {
                    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
                    acc[productId] = {
                        averageRating: avgRating,
                        reviewsCount: reviews.length
                    };
                    return acc;
                }, {});

                setReviewsData(reviewsMap);
                setProducts(filteredProducts);
            } catch (err) {
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [query, selectedCategory, selectedBrand, selectedColor, categoryId, priceRange]); // Add priceRange as a dependency

    useEffect(() => {
        if (sortBy === 'rating') {
            setProducts(prevProducts => {
                return [...prevProducts].sort((a, b) => {
                    const ratingA = reviewsData[a.id]?.averageRating || 0;
                    const ratingB = reviewsData[b.id]?.averageRating || 0;
                    return ratingB - ratingA;
                });
            });
        } else if (sortBy === 'date') {
            setProducts(prevProducts => {
                return [...prevProducts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            });
        }
    }, [sortBy, reviewsData]);

    return {
        products,
        loading,
        error,
        currentPage,
        productsPerPage,
        setCurrentPage,
        selectedCategory,
        setSelectedCategory,
        selectedBrand,
        setSelectedBrand,
        selectedColor,
        setSelectedColor,
        sortBy,
        setSortBy,
        reviewsData,
        categoryName,
        setCategoryName,
        priceRange,
        setPriceRange // Return setPriceRange for the parent component to use
    };
};

export default useProducts;
