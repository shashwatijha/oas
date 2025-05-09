import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/products.css";
import "../styles/custRepDashboard.css";
import Layout from "./layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";

// Countdown helper
const calculateTimeLeft = (closingDate) => {
  const difference = +new Date(closingDate) - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};

function ProductList() {
  const [products, setProducts] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const [sortOption, setSortOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState([]);
  const [colorFilter, setColorFilter] = useState([]);
  const [storageFilter, setStorageFilter] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch(`http://localhost:8000/api/notifications?user_id=${userId}`)
        .then(res => res.json())
        .then(data => {
          setNotifications(data);
          setNotificationCount(data.length);
        });
    }
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        const initialTimes = {};
        data.forEach((product) => {
          initialTimes[product.id] = calculateTimeLeft(product.closing_date);
        });
        setTimeLeft(initialTimes);
      })
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const updated = {};
        products.forEach((product) => {
          updated[product.id] = calculateTimeLeft(product.closing_date);
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [products]);

  const handleView = (id) => navigate(`/product?id=${id}`);
  const handleSortChange = (e) => setSortOption(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value.toLowerCase());
  const handleClearFilters = () => {
    setBrandFilter([]);
    setColorFilter([]);
    setStorageFilter([]);
    setSearchTerm("");
  };

  const handleCheckboxChange = (e, category) => {
    const { value, checked } = e.target;
    const filterSetter = {
      brand: setBrandFilter,
      color: setColorFilter,
      storage: setStorageFilter,
    }[category];
    const filterValues = {
      brand: brandFilter,
      color: colorFilter,
      storage: storageFilter,
    }[category];

    filterSetter(
      checked ? [...filterValues, value] : filterValues.filter((item) => item !== value)
    );
  };

  const handleClearNotifications = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/notifications/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: localStorage.getItem("userId") }),
      });

      const data = await response.json();
      if (response.ok) {
        setNotifications([]);
        setNotificationCount(0);
      } else {
        console.error("Clear failed:", data.error);
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const getFilteredAndSortedProducts = () => {
    let filteredProducts = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.color.toLowerCase().includes(searchTerm) ||
        product.storage.toLowerCase().includes(searchTerm);

      const matchesBrand = brandFilter.length === 0 || brandFilter.includes(product.brand);
      const matchesColor = colorFilter.length === 0 || colorFilter.includes(product.color);
      const matchesStorage = storageFilter.length === 0 || storageFilter.includes(product.storage);

      return matchesSearch && matchesBrand && matchesColor && matchesStorage;
    });

    filteredProducts.sort((a, b) => {
      const now = new Date();
      const aEnded = new Date(a.closing_date) < now;
      const bEnded = new Date(b.closing_date) < now;

      if (aEnded && !bEnded) return 1;
      if (!aEnded && bEnded) return -1;

      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      if (sortOption === "brand-asc") return a.brand.localeCompare(b.brand);
      if (sortOption === "brand-desc") return b.brand.localeCompare(a.brand);
      if (sortOption === "time-left") return new Date(a.closing_date) - new Date(b.closing_date);
      if (sortOption === "time-left-desc") return new Date(b.closing_date) - new Date(a.closing_date);

      return 0;
    });

    return filteredProducts;
  };

  return (
    <Layout
      notificationCount={notificationCount}
      onAlertClick={() => setShowNotifications(true)}
    >
      <div className="product-container">
        <div className="search-sort-bar">
          <input
            type="text"
            placeholder="Search by name, brand, color, storage..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />

          <div className="filters-wrapper">
            <button onClick={() => setFiltersOpen(!filtersOpen)} className="filters-button">
              Filters {filtersOpen ? "▲" : "▼"}
            </button>

            {filtersOpen && (
              <div className="filters-dropdown">
                {["brand", "color", "storage"].map((category) => (
                  <div key={category} className="filter-category">
                    <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                    {Array.from(new Set(products.map((p) => p[category]))).map((val, idx) => (
                      <div key={idx} className="filter-option">
                        <input
                          type="checkbox"
                          id={`${category}-${idx}`}
                          value={val}
                          checked={
                            category === "brand"
                              ? brandFilter.includes(val)
                              : category === "color"
                                ? colorFilter.includes(val)
                                : storageFilter.includes(val)
                          }
                          onChange={(e) => handleCheckboxChange(e, category)}
                        />
                        <label htmlFor={`${category}-${idx}`}>{val}</label>
                      </div>
                    ))}
                  </div>
                ))}
                <button onClick={handleClearFilters} className="clear-filters-button">
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          <div className="sort-bar">
            <label htmlFor="sort" className="sort-label">Sort by:</label>
            <select
              id="sort"
              value={sortOption}
              onChange={handleSortChange}
              className="sort-select"
            >
              <option value="">-- Select --</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="brand-asc">Brand: A to Z</option>
              <option value="brand-desc">Brand: Z to A</option>
              <option value="time-left">Time: Least to Most</option>
              <option value="time-left-desc">Time: Most to Least</option>
            </select>
          </div>
        </div>

        {getFilteredAndSortedProducts().length > 0 ? (
          <div className="product-grid">
            {getFilteredAndSortedProducts().map((product) => {
              const isEnded = new Date(product.closing_date) < new Date();
              return (
                <div
                  key={product.id}
                  className={`product-card ${isEnded ? "disabled" : ""}`}
                  onClick={() => !isEnded && handleView(product.id)}
                  style={{ cursor: isEnded ? "default" : "pointer" }}
                >
                  <img src={product.image_url} alt={product.name} className="product-image" />
                  <h2 className="product-name">{product.name}</h2>
                  <p className="product-brand">{product.brand}</p>
                  <p className="product-price">${product.price}</p>
                  {timeLeft[product.id] ? (
                    <p className="product-timer">
                      Ends in: {timeLeft[product.id].days}d {timeLeft[product.id].hours}h{" "}
                      {timeLeft[product.id].minutes}m {timeLeft[product.id].seconds}s
                    </p>
                  ) : (
                    <p className="product-ended">Auction Ended</p>
                  )}
                  {isEnded && <p className="product-ended">Auction Closed</p>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-products-wrapper">
            <p className="no-products-message">No products found matching your search.</p>
          </div>
        )}
      </div>

      {showNotifications && (
        <div className="notification-popup">
          <div className="notification-popup-content">
            <h3>Notifications</h3>
            <button className="close-btn" onClick={() => setShowNotifications(false)}>×</button>
            <ul>
              {notifications.map((n) => (
                <li key={n.id}>
                  <p>{n.message}</p>
                  <small>{n.created_at}</small>
                </li>
              ))}
            </ul>
          </div>
          <button onClick={handleClearNotifications} className="clear-button">
            Clear All
          </button>
        </div>
      )}
    </Layout>
  );
}

export default ProductList;