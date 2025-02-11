import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  addProductToCart,
  updateCartItemQuantity,
  removeCartItem,
  fetchCartItem,
} from '../../api/cartApi';
import { fetchReviews } from '../../api/reviews';
import { useCart } from '../../contexts/CartContext'; 
import { useWishlist } from '../../contexts/WishlistContext'; 
import ColorOptions from '../../utils/ColorOptions';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; 
import './css/ProductCard.css';

const ProductCard = ({ product, index }) => {
  const [cartItem, setCartItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  const { cartItems, setCartItems } = useCart();
  const { wishlistItems, handleAddToWishlist, handleRemoveFromWishlist } = useWishlist();

  useEffect(() => {
    const loadCartItem = async () => {
      if (product?.id) {
        const existingCartItem = await fetchCartItem(product.id);
        if (existingCartItem) {
          setCartItem(existingCartItem);
          setQuantity(existingCartItem.quantity);
        }
      }
    };

    loadCartItem();
  }, [product?.id]);

  useEffect(() => {
    const loadReviews = async () => {
      if (product?.id) {
        const reviews = await fetchReviews(product.id);
        if (Array.isArray(reviews)) {
          setReviewsCount(reviews.length);
          const totalRating = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
          setAverageRating(reviews.length > 0 ? totalRating / reviews.length : 0);
        }
      }
    };

    loadReviews();
  }, [product?.id]);

  useEffect(() => {
    const isProductInWishlist = wishlistItems.some(item => item.product.id === product.id);
    setIsInWishlist(isProductInWishlist);
  }, [wishlistItems, product?.id]);

  const handleWishlistToggle = async () => {
    if (!localStorage.getItem("token")) {
      alert("لطفاً برای افزودن به لیست علاقه‌مندی‌ها وارد شوید.");
      return;
    }

    setIsWishlistLoading(true);

    try {
      if (isInWishlist) {
        await handleRemoveFromWishlist(product.id);
      } else {
        await handleAddToWishlist(product.id);
      }
    } catch (err) {
      console.error("خطا در به‌روزرسانی لیست علاقه‌مندی‌ها:", err);
      alert("خطا در به‌روزرسانی لیست علاقه‌مندی‌ها. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const ratingPercentage = (averageRating / 5) * 100;

  const handleAddToCart = async () => {
    if (!localStorage.getItem("token")) {
      alert("لطفاً برای افزودن به سبد خرید، وارد شوید.");
      return;
    }
    else if (!product || !product.id || product.quantity === 0) return;
    try {
      const addedItem = await addProductToCart(product.id, quantity, selectedColor);
      setCartItem(addedItem);
      setCartItems((prevItems) => [...prevItems, addedItem]);
    } catch (error) {
      console.error('خطا در افزودن محصول به سبد خرید:', error);
      alert(error.message);
    }
  };

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || product.quantity === 0) return;

    try {
      const updatedItem = await updateCartItemQuantity(cartItem.id, newQuantity);
      setQuantity(updatedItem.quantity);
      setCartItem(updatedItem);
      setCartItems((prevItems) =>
        prevItems.map((item) => (item.id === cartItem.id ? updatedItem : item))
      );
    } catch (error) {
      console.error('خطا در به‌روزرسانی تعداد آیتم سبد خرید:', error);
    }
  };


  const toPersianNumbers = (num) => {
    return String(num).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
  };

  function formatPrice(price) {
    const formattedPrice = price.toLocaleString();
    
    const persianNumerals = formattedPrice.replace(/[0-9]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) + 1728));
    return persianNumerals;
  }


  const handleRemoveFromCart = async () => {
    try {
      await removeCartItem(cartItem.id);
      setCartItem(null);
      setQuantity(1);
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartItem.id));
    } catch (error) {
      console.error('خطا در حذف آیتم از سبد خرید:', error);
    }
  };

  const handleColorChange = async (color) => {
    setSelectedColor(color);

    const existingCartItem = cartItems.find(
      (item) => item.product.id === product.id && item.color.id === color
    );

    if (existingCartItem) {
      setCartItem(existingCartItem);
      setQuantity(existingCartItem.quantity);
    } else {
      try {
        const fetchedCartItem = await fetchCartItem(product.id, color);
        if (fetchedCartItem) {
          setCartItem(fetchedCartItem);
          setQuantity(fetchedCartItem.quantity);

          setCartItems((prevItems) => {
            if (!prevItems.some((item) => item.id === fetchedCartItem.id)) {
              return [...prevItems, fetchedCartItem];
            }
            return prevItems;
          });
        } else {
          setCartItem(null);
          setQuantity(1);
        }
      } catch (error) {
        console.error('خطا در بارگذاری آیتم سبد خرید:', error);
      }
    }
  };

  if (!product || !product.id) {
    return <p>در حال بارگذاری...</p>;
  }

  const isOutOfStock = product.quantity === 0;

  const toPersianNumerals = (number) => {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(number).replace(/\d/g, (digit) => persianNumbers[digit]);
  };
  
  return (
    <div className="product product-2 border border-gray p-3 rounded" key={index}>
      <figure className="product-media">
        {product.label && (
          <span
            className={`product-label label-circle ${product.label.includes('Sale') ? 'label-sale' : 'label-top'}`}
          >
            {product.label}
          </span>
        )}
        <Link to={`/product/${product.id}`} key={product.id}>
          <img
            src={product.main_photo || '/default-image.jpg'}
            alt={product.name || 'تصویر محصول'}
            className="product-image"
          />
        </Link>
        <div className="product-action-vertical">
          <a
            onClick={handleWishlistToggle}
            className={`btn-product-icon btn-expandable ${isInWishlist ? 'active' : ''}`}
            title="افزودن به لیست علاقه‌مندی‌ها"
            disabled={isWishlistLoading}
          >{isInWishlist ? <FaHeart className="text-danger" /> : <FaRegHeart className="text-dark" />}
            {isWishlistLoading ? (
              <span>در حال بارگذاری...</span>
            ) : (
              <span>{isInWishlist ? 'حذف از لیست علاقه‌مندی‌ها' : 'افزودن به لیست علاقه‌مندی‌ها'}</span>
            )}
          </a>
        </div>
        <div className="product-action">
          {isOutOfStock ? (
            <a
              className="btn-product btn-cart"
              title="تمام شده"
              disabled
            ></a>
          ) : cartItem ? (
            <div className="qty-control">
              <button
                onClick={() => {
                  if (quantity === 1) {
                    handleRemoveFromCart();
                  } else {
                    handleQuantityChange(quantity - 1);
                  }
                }}
                className="btn-product btn-quantity"
                title="کاهش تعداد"
              >
                <span>-</span>
              </button>
              <span className="quantity">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="btn-product btn-quantity"
                title="افزایش تعداد"
              >
                <span>+</span>
              </button>
            </div>
          ) : selectedColor ? (  
            <a
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart();
              }}
              className="btn-product btn-cart"
              title="افزودن به سبد خرید"
            ></a>
          ) : (
            <span className="btn-product btn-cart" title="لطفا رنگ را انتخاب کنید" disabled></span> 
          )}
          <a className="btn-product btn-quickview" title="مشاهده سریع"></a>
        </div>
      </figure>

      <div className="product-body products-section">
        <div className="product-cat">
          <a>
            {typeof product.category === 'string' ? product.category : product.category?.name || 'دسته‌بندی ناشناخته'}
          </a>
        </div>
        <h3 className="product-title">
          <Link to={`/product/${product.id}`} key={product.id}>
            {product.name || 'محصول بی‌نام'}
          </Link>
        </h3>
        <div className="product-price text-muted" dir='rtl'>
          {product.oldPrice ? (
            <>
              <span className="new-price">
                {formatPrice(product.price) || 'نامشخص'}
              </span>
              <span className="old-price">
                {formatPrice(product.oldPrice)}
              </span>
            </>
          ) : (
            formatPrice(product.price) || 'نامشخص'
          )}
          تومان
        </div>

        <div className="details-row-color">
          <ColorOptions
            colors={product.colors}
            selectedColor={selectedColor}
            handleColorChange={handleColorChange}
          />
        </div>
        <div className="ratings-container" dir='rtl'>
          <div className="ratings">
            <div className="ratings-val" style={{ width: `${ratingPercentage}%` }}></div>
          </div>
          <span className="ratings-text">({toPersianNumbers(reviewsCount)} نقد و بررسی)</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
