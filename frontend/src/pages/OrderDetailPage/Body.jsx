import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchOrderDetails } from '../../api/orderApi';
import BreadCrumb from '../../components/Breadcrumb/BreadCrumb';
import OrderProducts from './OrderProducts';
import { FaSpinner } from 'react-icons/fa'; // Import spinner icon from react-icons

const OrderDetailPage = () => {
  const { orderCode } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const data = await fetchOrderDetails(orderCode);
        if (data.length > 0) {
          setOrder(data[0]);
        } else {
          setError('سفارش یافت نشد');
        }
      } catch (err) {
        setError('خطا در دریافت جزئیات سفارش');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderCode]);

  if (loading)
    return (
      <div className="order-detail-loading d-flex justify-content-center align-items-center vh-100">
        {/* Replace spinner-border with FaSpinner */}
        <FaSpinner className="spinner-icon text-primary" size={50} spin />
      </div>
    );

  if (error)
    return (
      <div className="order-detail-error alert alert-danger text-center mt-5" role="alert">
        {error}
      </div>
    );

  if (!order)
    return (
      <div className="order-detail-not-found alert alert-warning text-center mt-5" role="alert">
        هیچ سفارشی با کد سفارش وارد شده پیدا نشد.
      </div>
    );

  return (
    <main className="main">
      <BreadCrumb />
      <div className="page-content">
        <div className="container">
          <div className="row">
            <OrderProducts order={order} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderDetailPage;
