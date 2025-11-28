
'use client';

import { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
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
    is_published: boolean;
}

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}

const PRODUCT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjM2QzZDNkIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UHJvZHVjdDwvdGV4dD4KPC9zdmc+';

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const [imageError, setImageError] = useState(false);

    const isPlaceholderUrl = (url?: string) => {
        return !url || url.includes('via.placeholder.com') || url.includes('placeholder.com') || url.includes('placeholder');
    };

    const productImage = !imageError && !isPlaceholderUrl(product.image_url) ? product.image_url : PRODUCT_PLACEHOLDER;
    const displayPrice = product.member_price || product.price;
    const hasDiscount = product.regular_price && product.member_price && product.regular_price > product.member_price;
    const discountPercentage = hasDiscount ? Math.round(((product.regular_price! - product.member_price!) / product.regular_price!) * 100) : 0;

    return (
        <div className={styles.productCard}>
            <div className={styles.productImageContainer}>
                <img
                    src={productImage}
                    alt={product.title}
                    className={styles.productImage}
                    onError={() => setImageError(true)}
                />
            </div>
            <div className={styles.productInfo}>
                <div className={styles.productTitle}>{product.title}</div>
                <div className={styles.productPricing}>
                    <div className={styles.memberPrice}>${displayPrice.toFixed(2)}</div>
                    {hasDiscount && (
                        <>
                            <div className={styles.regularPrice}>${product.regular_price?.toFixed(2)}</div>
                            <div className={styles.discountBadge}>-{discountPercentage}%</div>
                        </>
                    )}
                </div>
                <button
                    className={styles.addCartBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                    }}
                    disabled={product.inventory <= 0}
                >
                    {product.inventory > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    );
}
