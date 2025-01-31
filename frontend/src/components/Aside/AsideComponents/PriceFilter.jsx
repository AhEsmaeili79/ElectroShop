const PriceFilter = ({ priceRange, handlePriceChange }) => {
  return (
    <div className="widget widget-collapsible">
      <h3 className="widget-title">
        <a
          data-toggle="collapse"
          href="#widget-5"
          role="button"
          aria-expanded="false"
          aria-controls="widget-5"
        >
          قیمت
        </a>
      </h3>
      <div className="collapse" id="widget-5">
        <div className="widget-body">
          <div className="filter-price">
            <div className="filter-price-text">
              محدوده قیمت: <span id="filter-price-range">تومان{priceRange[0]} - تومان{priceRange[1]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              value={priceRange[1]}
              onChange={handlePriceChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceFilter;
