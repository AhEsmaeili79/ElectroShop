// src/Components/Seller_section/SellerProductList/SellerProductList.jsx
import React, { useEffect, useState } from 'react';
import { fetchSellerProducts } from '../api/product';
import './css/SellerProductList.css'; // Importing the CSS file

function SellerProductList() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchSellerProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch products:', err);
      }
    };
    getProducts();
  }, []);

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="product-list">
      <h1>Your Products</h1>
      <div className="product-grid">
        {products.map(product => (
          <div className="product-card" key={product.id}>
            <img src={product.main_photo} alt={product.name} className="product-image" />
            <h2 className="product-name">{product.name}</h2>
            <p className="product-price">Price: ${product.price}</p>
            <p className="product-count">Count: {product.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SellerProductList;
