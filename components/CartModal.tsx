'use client';

import { useState } from 'react';
import { FaTimes, FaTrash, FaShoppingBag, FaArrowRight } from 'react-icons/fa';
import styles from '../app/shop/shop.module.css';

interface CartItem {
    product_id: string;
    title: string;
    price: number;
    quantity: number;
}

interface CartModalProps {
    cart: CartItem[];
    onClose: () => void;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemove: (productId: string) => void;
    onCheckout: (orderDetails: any) => void;
}

export default function CartModal({ cart, onClose, onUpdateQuantity, onRemove, onCheckout }: CartModalProps) {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className={styles.cartModalOverlay} onClick={onClose}>
            <div className={styles.cartModal} onClick={e => e.stopPropagation()}>
                <div className={styles.cartHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaShoppingBag style={{ color: 'var(--color-primary)' }} />
                        <h3>Shopping Cart</h3>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><FaTimes /></button>
                </div>

                {cart.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: 'var(--color-text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <FaShoppingBag style={{ fontSize: '3rem', opacity: 0.2 }} />
                        <p style={{ fontSize: '1.1rem', margin: 0 }}>Your cart is empty</p>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--color-border)',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                color: 'var(--color-text-primary)',
                                cursor: 'pointer',
                                marginTop: '8px'
                            }}
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={styles.cartItems}>
                            {cart.map(item => (
                                <div key={item.product_id} className={styles.cartItem}>
                                    <div className={styles.cartItemInfo}>
                                        <div className={styles.cartItemTitle}>{item.title}</div>
                                        <div className={styles.cartItemPrice}>${item.price.toFixed(2)} each</div>
                                    </div>
                                    <div className={styles.cartItemControls}>
                                        <div className={styles.quantityControls}>
                                            <button className={styles.qtyBtn} onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}>-</button>
                                            <span className={styles.qtyValue}>{item.quantity}</span>
                                            <button className={styles.qtyBtn} onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}>+</button>
                                        </div>
                                        <div className={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</div>
                                        <button className={styles.removeBtn} onClick={() => onRemove(item.product_id)}><FaTrash /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.cartFooter}>
                            <div className={styles.cartTotal}>
                                <span className={styles.totalLabel}>Total</span>
                                <span className={styles.totalValue}>${total.toFixed(2)}</span>
                            </div>
                            <button className={styles.checkoutBtn} onClick={() => onCheckout({})}>
                                Proceed to Checkout <FaArrowRight style={{ marginLeft: '8px' }} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
