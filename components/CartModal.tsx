
'use client';

import { useState } from 'react';
import { FaTimes, FaTrash } from 'react-icons/fa';
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
    const [step, setStep] = useState<'cart' | 'checkout'>('cart');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [note, setNote] = useState('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCheckoutSubmit = () => {
        if (!date || !time) {
            alert('Please select a pickup date and time.');
            return;
        }

        // Validate weekday
        const selectedDate = new Date(date);
        const day = selectedDate.getDay();
        if (day === 5 || day === 6) { // 5 is Friday (in some locales, actually 0=Sun, 6=Sat)
            // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
            // We want Mon-Fri. So 0 and 6 are invalid.
        }
        if (day === 0 || day === 6) {
            alert('Please select a weekday (Monday-Friday).');
            return;
        }

        onCheckout({
            preferred_datetime: `${date} ${time}`,
            pickup_note: note
        });
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className={styles.cartModalOverlay} onClick={onClose}>
            <div className={styles.cartModal} onClick={e => e.stopPropagation()}>
                <div className={styles.cartHeader}>
                    <h3>{step === 'cart' ? 'Shopping Cart' : 'Checkout'}</h3>
                    <button className={styles.closeBtn} onClick={onClose}><FaTimes /></button>
                </div>

                {step === 'cart' ? (
                    <>
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
                                Your cart is empty
                            </div>
                        ) : (
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
                        )}

                        {cart.length > 0 && (
                            <div className={styles.cartFooter}>
                                <div className={styles.cartTotal}>
                                    <span className={styles.totalLabel}>Total:</span>
                                    <span className={styles.totalValue}>${total.toFixed(2)}</span>
                                </div>
                                <button className={styles.checkoutBtn} onClick={() => setStep('checkout')}>Proceed to Checkout</button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.checkoutForm}>
                        <div className={styles.cashWarning}>
                            <h4>💵 CASH ONLY DEAL</h4>
                            <p>Payment accepted in cash only at pickup. Please bring exact change.</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Preferred Date (Mon-Fri)</label>
                            <input
                                type="date"
                                min={today}
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Preferred Time</label>
                            <select value={time} onChange={e => setTime(e.target.value)}>
                                <option value="">Select a time</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="11:30">11:30 AM</option>
                                <option value="12:00">12:00 PM</option>
                                <option value="12:30">12:30 PM</option>
                                <option value="13:00">1:00 PM</option>
                                <option value="13:30">1:30 PM</option>
                                <option value="14:00">2:00 PM</option>
                                <option value="14:30">2:30 PM</option>
                                <option value="15:00">3:00 PM</option>
                                <option value="15:30">3:30 PM</option>
                                <option value="16:00">4:00 PM</option>
                                <option value="16:30">4:30 PM</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Pickup Note (Optional)</label>
                            <textarea
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder="Any special instructions..."
                                rows={3}
                            />
                        </div>

                        <div className={styles.cartFooter}>
                            <div className={styles.cartTotal}>
                                <span className={styles.totalLabel}>Total to Pay:</span>
                                <span className={styles.totalValue}>${total.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className={styles.checkoutBtn} style={{ background: '#666' }} onClick={() => setStep('cart')}>Back</button>
                                <button className={styles.checkoutBtn} onClick={handleCheckoutSubmit}>Confirm Reservation</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
