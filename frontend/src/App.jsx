import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// User-related components
import Login from './Components/User_section/Login/Login';
import Signup from './Components/User_section/Signup/Signup';
import UserProfile from './Components/User_section/UserProfile/UserProfile';
import Logout from './Components/User_section/Logout/Logout';

// General components
import Home from './Components/Home/Home';
import Navbar from './Components/Home/Navbar';
import ProductDetail from './Components/Product/ProductDetail';

// Seller-related components
import AddProduct from './Components/seller/AddProduct/AddProduct';
import SellerProducts from './Components/seller/ProductList/SellerProductList';
import EditProduct from './Components/seller/EditProduct/EditProduct';

// Role request components
import UserRoleRequest from './Components/RoleRequest/UserRoleRequest';
import AdminRoleRequests from './Components/RoleRequest/AdminRoleRequests';

// API
import { fetchUserData } from './Components/api/user';

function App() {
  const [user, setUser] = useState(null); // State to store user data

  // Fetch user data when the component mounts
  useEffect(() => {
    const getUserData = async () => {
      try {
        const data = await fetchUserData();
        setUser(data); // Set the fetched user data
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    getUserData();
  }, []);

  // Function to render routes based on user role
  const renderRoleSpecificRoutes = () => {
    if (!user) return null;

    switch (user.role) {
      case 'customer':
        return <Route path="/request-role" element={<UserRoleRequest user={user} />} />;
      case 'admin':
        return <Route path="/manage-requests" element={<AdminRoleRequests />} />;
      case 'seller':
        return (
          <>
            <Route path="/seller/products" element={<SellerProducts />} />
            <Route path="/seller/add-product" element={<AddProduct />} />
            <Route path="/seller/edit-product/:productId" element={<EditProduct />} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/logout" element={<Logout />} />
        
        {/* Render role-specific routes */}
        {renderRoleSpecificRoutes()}
      </Routes>
    </Router>
  );
}

export default App;
