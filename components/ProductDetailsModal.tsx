
'use client';

import { FaTimes, FaShoppingCart } from 'react-icons/fa';
import styles from '../app/shop/shop.module.css';

interface Product {
    id: string;
    title: string;
    price: number;
    member_price?: number;
    regular_price?: number;
    image_url?: string;
    inventory: number;
    category?: string;
    description?: string; // Assuming description exists or we add it
}

interface ProductDetailsModalProps {
    product: Product;
    onClose: () => void;
    onAddToCart: (product: Product) => void;
}

const PRODUCT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjM2QzZDNkIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UHJvZHVjdDwvdGV4dD4KPC9zdmc+';

export default function ProductDetailsModal({ product, onClose, onAddToCart }: ProductDetailsModalProps) {
    const displayPrice = product.member_price || product.price;
    const hasDiscount = product.regular_price && product.member_price && product.regular_price > product.member_price;
    const discountPercentage = hasDiscount ? Math.round(((product.regular_price! - product.member_price!) / product.regular_price!) * 100) : 0;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.productDetailModal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeModalBtn} onClick={onClose}>
                    <FaTimes />
                </button>

                <div className={styles.detailGrid}>
                    <div className={styles.detailImageContainer}>
                        <img
                            src={product.image_url || PRODUCT_PLACEHOLDER}
                            alt={product.title}
                            className={styles.detailImage}
                        />
                    </div>

                    <div className={styles.detailInfo}>
                        <h2>{product.title}</h2>

                        <div className={styles.detailPricing}>
                            <div className={styles.memberPrice}>${displayPrice.toFixed(2)}</div>
                            {hasDiscount && (
                                <>
                                    <div className={styles.regularPrice}>${product.regular_price?.toFixed(2)}</div>
                                    <div className={styles.discountBadge}>SAVE {discountPercentage}%</div>
                                </>
                            )}
                        </div>

                        <div className={styles.stockStatus}>
                            Status: <span className={product.inventory > 0 ? styles.inStock : styles.outOfStock}>
                                {product.inventory > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>

                        <p className={styles.description}>
                            {product.description || 'No description available for this product.'}
                        </p>

                        <button
                            className={styles.addToCartBtnLarge}
                            onClick={() => {
                                onAddToCart(product);
                                onClose();
                            }}
                            disabled={product.inventory <= 0}
                        >
                            <FaShoppingCart /> {product.inventory > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
