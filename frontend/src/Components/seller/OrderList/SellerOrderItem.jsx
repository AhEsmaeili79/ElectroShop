import React from 'react';
import { Link } from 'react-router-dom';
const SellerOrderItem = ({ item }) => {
  return (
    <Link to={`/product/${item.product}`} className="product-link">
    <li className="order-item">
      <img
        src={item.product_image}
        alt={item.product_name}
        className="product-image"
      />
      <p>Product: {item.product_name}</p>
      <p>Quantity: {item.quantity}</p>
      <p>Price per Unit: ${item.product_price}</p>
    </li>
    </Link>
  );
};

export default SellerOrderItem;
