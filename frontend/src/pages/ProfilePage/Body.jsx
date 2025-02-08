import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BreadCrumb from '../../components/Breadcrumb/BreadCrumb';
import DashboardAside from './ProfilePageAside';
import UserDetailHeader from '../../components/Header/UserDetailHeader/UserDetailHeader';
import AccountForm from './TabContents/AccountForm';
import AddressComponent from './Addresses/AddressComponent';
import OrdersList from '../OrderListPage/OrdersList';
import { logoutUser } from '../../api/auth';

const handleLogout = async () => {
    try {
        await logoutUser(localStorage.getItem('refresh_token'), localStorage.getItem('token'));
    } catch (error) {
        console.error('Logout failed:', error);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/';
    }
};

const Body = () => {
    const location = useLocation(); 
    const [activeTab, setActiveTab] = useState("dashboard");

    useEffect(() => {
        const path = location.pathname;
        if (path === '/orders') setActiveTab("orders");
        else if (path === '/address') setActiveTab("address");
        else if (path === '/account') setActiveTab("account");
        else setActiveTab("dashboard");
    }, [location.pathname]); 

    const renderTabContent = () => {
        switch (activeTab) {
            case "account":
                return <AccountForm />;
            case "address":
                return <AddressComponent />;
            case "orders":
                return <OrdersList />;
            default:
                return <div>خوش آمدید به داشبورد</div>;
        }
    };

    return (
        <>
            <main className="main">
                <UserDetailHeader />
                <BreadCrumb />
                <div className="page-content">
                    <div className="container">
                        <div className="row">
                            <DashboardAside handleLogout={handleLogout} setActiveTab={setActiveTab} />
                            <div className="col-md-8 col-lg-9">
                                {renderTabContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Body;
