'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { FaShoppingCart, FaHome, FaSpinner, FaFilter, FaUser, FaTimes, FaArrowLeft, FaCheck, FaInfoCircle, FaSearch, FaSortAmountDown } from 'react-icons/fa';
import styles from './shop.module.css';
import CartModal from '@/components/CartModal';

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
    description?: string;
    created_at?: string;
}

interface CartItem {
    product_id: string;
    title: string;
    price: number;
    quantity: number;
}

interface Order {
    id: string;
    total_amount: number;
    status: string;
    order_date: string;
    items: CartItem[];
    preferred_datetime?: string;
    pickup_note?: string;
}

export default function Shop() {
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter & Sort State
    const [currentModel, setCurrentModel] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [detailQuantity, setDetailQuantity] = useState(1);

    // Order Modal State
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [pickupNote, setPickupNote] = useState('');
    const [preferredDate, setPreferredDate] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [orderProcessing, setOrderProcessing] = useState(false);

    // Success Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastOrder, setLastOrder] = useState<Order | null>(null);
    const [memberId, setMemberId] = useState<string>('N/A');

    // Notification State
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        // Load cart from local storage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Error parsing cart from local storage', e);
            }
        }

        const initShop = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login?redirect=/shop');
                return;
            }
            setUser(user);

            // Fetch member ID
            const { data: profile } = await supabase
                .from('profiles')
                .select('member_id')
                .eq('id', user.id)
                .single();

            if (profile) {
                setMemberId(profile.member_id || 'N/A');
            }

            const { data, error } = await supabase
                .from('shop_products')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading products:', error);
                showNotificationMsg('Error loading products', 'error');
            } else {
                setProducts(data || []);
            }
            setLoading(false);
        };

        initShop();
    }, [router]);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const showNotificationMsg = (message: string, type: 'success' | 'error' | 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredProducts = products.filter(p => {
        // 1. Filter by Model
        let modelMatch = true;
        if (currentModel !== 'all') {
            const modelCategoryMap: Record<string, string> = {
                'model3': 'new-model-3-highland',
                'modelY': 'model-y'
            };
            const targetCategory = modelCategoryMap[currentModel];
            modelMatch = !!(targetCategory && p.category && (p.category === targetCategory || p.category.includes(targetCategory)));
        }

        // 2. Filter by Search Query
        let searchMatch = true;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            searchMatch = p.title.toLowerCase().includes(query) ||
                (p.description && p.description.toLowerCase().includes(query)) ||
                false;
        }

        return modelMatch && searchMatch;
    }).sort((a, b) => {
        // 3. Sort
        switch (sortBy) {
            case 'price-asc':
                return (a.member_price || a.price) - (b.member_price || b.price);
            case 'price-desc':
                return (b.member_price || b.price) - (a.member_price || a.price);
            case 'name-asc':
                return a.title.localeCompare(b.title);
            case 'newest':
            default:
                return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        }
    });

    const addToCart = (product: Product, quantity: number = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id);
            const currentQty = existing ? existing.quantity : 0;

            if (currentQty + quantity > product.inventory) {
                showNotificationMsg(`Only ${product.inventory} items available`, 'error');
                return prev;
            }

            let newCart;
            if (existing) {
                newCart = prev.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                newCart = [...prev, {
                    product_id: product.id,
                    title: product.title,
                    price: product.member_price || product.price,
                    quantity
                }];
            }

            showNotificationMsg(`${product.title} added to cart`, 'success');
            return newCart;
        });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        const product = products.find(p => p.id === productId);
        if (product && quantity > product.inventory) {
            showNotificationMsg(`Only ${product.inventory} items available`, 'error');
            return;
        }
        setCart(prev => prev.map(item =>
            item.product_id === productId ? { ...item, quantity } : item
        ));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    const openProductDetail = (product: Product) => {
        setSelectedProduct(product);
        setDetailQuantity(1);
    };

    const closeProductDetail = () => {
        setSelectedProduct(null);
    };

    const handleDetailQuantityChange = (change: number) => {
        const newQty = detailQuantity + change;
        if (newQty >= 1 && (!selectedProduct || newQty <= selectedProduct.inventory)) {
            setDetailQuantity(newQty);
        }
    };

    const addToCartFromDetail = () => {
        if (selectedProduct) {
            addToCart(selectedProduct, detailQuantity);
            closeProductDetail();
        }
    };

    const handleCheckoutClick = () => {
        setShowCart(false);
        setShowOrderModal(true);
        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        setTimeout(() => {
            const dateInput = document.getElementById('preferred-date') as HTMLInputElement;
            if (dateInput) dateInput.min = today;
        }, 100);
    };

    const validateWeekday = (dateString: string) => {
        if (!dateString) return true;
        const date = new Date(dateString);
        const day = date.getDay(); // 0 = Sunday, 6 = Saturday
        if (day === 0 || day === 6) {
            showNotificationMsg('Please select a weekday (Monday-Friday). Office is closed on weekends.', 'error');
            return false;
        }
        return true;
    };

    const handlePlaceOrder = async () => {
        if (!preferredDate) {
            showNotificationMsg('Please select a pickup date', 'error');
            return;
        }
        if (!preferredTime) {
            showNotificationMsg('Please select a pickup time', 'error');
            return;
        }
        if (!validateWeekday(preferredDate)) {
            return;
        }

        setOrderProcessing(true);

        try {
            const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const preferredDateTime = `${preferredDate} ${preferredTime}`;

            const orderData = {
                user_id: user.id,
                items: cart,
                total_amount: totalAmount,
                pickup_note: pickupNote,
                preferred_datetime: preferredDateTime,
                status: 'pending',
                order_date: new Date().toISOString()
            };

            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('shop_orders')
                .insert([orderData])
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Update Inventory
            for (const item of cart) {
                const product = products.find(p => p.id === item.product_id);
                if (product) {
                    const newInventory = Math.max(0, product.inventory - item.quantity);
                    await supabase
                        .from('shop_products')
                        .update({ inventory: newInventory })
                        .eq('id', item.product_id);
                }
            }

            // 3. Send Email
            try {
                await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: user.email,
                        subject: 'Blitz Shop Reservation Confirmation',
                        html: `
                            <h1>Order Confirmation #${order.id}</h1>
                            <p>Thank you for your reservation!</p>
                            <p><strong>Total:</strong> $${totalAmount.toFixed(2)}</p>
                            <p><strong>Pickup Date:</strong> ${preferredDateTime}</p>
                            <p><strong>Items:</strong></p>
                            <ul>
                                ${cart.map(item => `<li>${item.title} x${item.quantity}</li>`).join('')}
                            </ul>
                            <p>Please bring cash for payment upon pickup.</p>
                        `
                    })
                });
            } catch (emailError) {
                console.error('Error sending email:', emailError);
            }

            // 4. Success
            setLastOrder(order);
            setCart([]);
            setShowOrderModal(false);
            setShowSuccessModal(true);

            // Refresh products to update inventory
            const { data: refreshedProducts } = await supabase
                .from('shop_products')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false });
            if (refreshedProducts) setProducts(refreshedProducts);

        } catch (error: any) {
            console.error('Error placing order:', error);
            showNotificationMsg(`Error placing order: ${error.message}`, 'error');
        } finally {
            setOrderProcessing(false);
        }
    };

    const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Helper to parse description
    const parseDescription = (desc: string) => {
        if (!desc) return ['Product details available upon request.'];
        if (desc.includes('\n')) return desc.split('\n').filter(s => s.trim());
        if (desc.includes('•')) return desc.split('•').filter(s => s.trim());
        return [desc];
    };

    return (
        <div className={styles['shop-page']}>
            {/* Notification Toast */}
            {notification && (
                <div className={styles['notification-container']}>
                    <div className={`${styles['notification']} ${styles[notification.type]}`}>
                        {notification.type === 'success' && <FaCheck />}
                        {notification.type === 'error' && <FaTimes />}
                        {notification.type === 'info' && <FaInfoCircle />}
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}

            <header className={styles['shop-header']}>
                <div className={styles['header-left']}>
                    <div className={styles['shop-logo']} onClick={() => router.push('/dashboard')}>
                        <img
                            src="https://qhkcrrphsjpytdfqfamq.supabase.co/storage/v1/object/public/avatars/logo.png"
                            alt="Blitz Tesla Club Logo"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://i.ibb.co/fkrdXZK/Logo4-white.png'; }}
                        />
                        <span className={styles['logo-text']}>BLITZ T CLUB</span>
                    </div>
                </div>

                <div className={`${styles['header-center']} ${styles['desktop-nav']}`}>
                </div>

                <div className={styles['header-right']}>
                    <button className={`${styles['back-to-dashboard-btn']} ${styles['hide-on-mobile']}`} onClick={() => router.push('/dashboard')}>
                        <FaArrowLeft /> Dashboard
                    </button>
                    <div className={`${styles['cart-icon']} ${styles['hide-on-mobile']}`} onClick={() => setShowCart(true)}>
                        <FaShoppingCart />
                        {cartTotalItems > 0 && <span className={styles['cart-count']}>{cartTotalItems}</span>}
                    </div>
                </div>

                {/* Mobile Header */}
                <div className={styles['mobile-nav']}>
                    <div className={styles['mobile-header']}>
                        <div className={styles['mobile-logo']}>
                            <img
                                src="https://qhkcrrphsjpytdfqfamq.supabase.co/storage/v1/object/public/avatars/logo.png"
                                alt="Blitz Tesla Club Logo"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://i.ibb.co/fkrdXZK/Logo4-white.png'; }}
                            />
                            <span className={styles['mobile-logo-text']}>BLITZ T CLUB</span>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {/* Filter & Sort Section */}
                <div className={styles['filter-sort-section']}>
                    <div className={styles['filter-sort-container']}>
                        <h3 className={styles['section-title']}>Filter & Sort</h3>

                        {/* Search Bar */}
                        <div className={styles['search-container']}>
                            <FaSearch className={styles['search-icon']} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className={styles['search-input']}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <div className={styles['sort-container']}>
                            <label className={styles['sort-label']}>Sort By</label>
                            <select
                                className={styles['sort-select']}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Newest Arrivals</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="name-asc">Name: A-Z</option>
                            </select>
                        </div>

                        {/* Model Selection */}
                        <div className={styles['model-filter-container']}>
                            <label className={styles['model-label']}>Model</label>
                            <div className={styles['model-pills']}>
                                {['all', 'model3', 'modelY'].map(model => (
                                    <button
                                        key={model}
                                        className={`${styles['model-pill']} ${currentModel === model ? styles['active'] : ''}`}
                                        onClick={() => setCurrentModel(model)}
                                    >
                                        {model === 'all' ? 'All Models' : model === 'model3' ? 'Model 3' : 'Model Y'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles['products-grid']}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>
                            <FaSpinner className="fa-spin" style={{ fontSize: '2rem', marginBottom: '15px', color: 'var(--color-primary)' }} />
                            <p style={{ fontSize: '1.1rem', margin: 0 }}>Loading products...</p>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        filteredProducts.map(product => {
                            const displayPrice = product.member_price || product.price;
                            const hasDiscount = product.regular_price && product.member_price && product.regular_price > product.member_price;

                            return (
                                <div key={product.id} className={styles['product-card']} onClick={() => openProductDetail(product)}>
                                    <div className={styles['product-image-container']}>
                                        <img
                                            src={product.image_url || 'https://via.placeholder.com/300'}
                                            alt={product.title}
                                            className={styles['product-image']}
                                        />
                                    </div>
                                    <div className={styles['product-info']}>
                                        <div className={styles['product-title']}>{product.title}</div>
                                        <div className={styles['product-category']}>{product.category?.replace(/-/g, ' ')}</div>
                                        <div className={styles['product-pricing']}>
                                            <div className={styles['member-price']}>${displayPrice.toFixed(2)}</div>
                                            {hasDiscount && (
                                                <>
                                                    <div className={styles['regular-price']}>${product.regular_price?.toFixed(2)}</div>
                                                    <div className={styles['discount-badge']}>SAVE</div>
                                                </>
                                            )}
                                        </div>
                                        <button
                                            className={styles['add-cart-btn']}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(product);
                                            }}
                                        >
                                            <FaShoppingCart /> Add to Cart
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>
                            <h3>No Products Found</h3>
                            <p>Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <div className={styles['mobile-bottom-nav']}>
                <div className={`${styles['bottom-nav-item']} ${!mobileMenuOpen ? styles['active'] : ''}`} onClick={() => setMobileMenuOpen(false)}>
                    <FaHome />
                    <span>Shop</span>
                </div>
                <div className={`${styles['bottom-nav-item']} ${mobileMenuOpen ? styles['active'] : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <FaFilter />
                    <span>Filter</span>
                </div>
                <div className={styles['bottom-nav-item']} onClick={() => setShowCart(true)}>
                    <div style={{ position: 'relative' }}>
                        <FaShoppingCart />
                        {cartTotalItems > 0 && (
                            <span className={styles['cart-count']} style={{ top: '-8px', right: '-8px' }}>{cartTotalItems}</span>
                        )}
                    </div>
                    <span>Cart</span>
                </div>
                <div className={styles['bottom-nav-item']} onClick={() => router.push('/profile')}>
                    <FaUser />
                    <span>Profile</span>
                </div>
            </div>

            {/* Mobile Filter Menu */}
            <div className={`${styles['mobile-menu']} ${mobileMenuOpen ? styles['active'] : ''}`}>
                <div className={styles['mobile-model-selection']}>
                    <h3>Filter & Sort</h3>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Search</label>
                        <input
                            type="text"
                            placeholder="Search products..."
                            className={styles['search-input']}
                            style={{ width: '100%', border: '1px solid #ddd', padding: '12px', borderRadius: '8px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Sort By</label>
                        <select
                            className={styles['sort-select']}
                            style={{ width: '100%', border: '1px solid #ddd', padding: '12px', borderRadius: '8px' }}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest Arrivals</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name-asc">Name: A-Z</option>
                        </select>
                    </div>

                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Model</label>
                    <div className={styles['mobile-model-pills']}>
                        {['all', 'model3', 'modelY'].map(model => (
                            <button
                                key={model}
                                className={`${styles['mobile-model-pill']} ${currentModel === model ? styles['active'] : ''}`}
                                onClick={() => {
                                    setCurrentModel(model);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                {model === 'all' ? 'All Models' : model === 'model3' ? 'Model 3' : 'Model Y'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className={styles['product-detail-modal']}>
                    <div className={styles['product-detail-content']}>
                        <button className={styles['close-btn']} onClick={closeProductDetail}>
                            <FaTimes />
                        </button>

                        <div className={styles['product-detail-image-section']}>
                            <img
                                src={selectedProduct.image_url || 'https://via.placeholder.com/300'}
                                alt={selectedProduct.title}
                                className={styles['detail-product-image']}
                            />
                        </div>

                        <div className={styles['product-detail-info-section']}>
                            <div>
                                <h2 className={styles['detail-product-title']}>{selectedProduct.title}</h2>
                                <div className={styles['product-category']}>{selectedProduct.category?.replace(/-/g, ' ')}</div>
                            </div>

                            <div className={styles['detail-pricing']}>
                                <div className={styles['detail-member-price']}>
                                    ${(selectedProduct.member_price || selectedProduct.price).toFixed(2)}
                                </div>
                                {selectedProduct.regular_price && (selectedProduct.member_price || selectedProduct.price) < selectedProduct.regular_price && (
                                    <>
                                        <div className={styles['detail-regular-price']}>${selectedProduct.regular_price.toFixed(2)}</div>
                                        <div className={styles['savings-badge']}>SAVE</div>
                                    </>
                                )}
                            </div>

                            <div className={styles['detail-description']}>
                                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                    {parseDescription(selectedProduct.description || '').map((item, idx) => (
                                        <li key={idx} style={{ marginBottom: '8px' }}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className={styles['product-actions']}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <span style={{ fontWeight: 600 }}>Quantity</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <button
                                            onClick={() => handleDetailQuantityChange(-1)}
                                            style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-background-card)', color: 'var(--color-text-primary)' }}
                                        >-</button>
                                        <span style={{ fontWeight: 600 }}>{detailQuantity}</span>
                                        <button
                                            onClick={() => handleDetailQuantityChange(1)}
                                            style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-background-card)', color: 'var(--color-text-primary)' }}
                                        >+</button>
                                    </div>
                                </div>
                                <button className={styles['add-to-cart-btn-large']} onClick={addToCartFromDetail}>
                                    <FaShoppingCart /> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Modal */}
            {showCart && (
                <CartModal
                    cart={cart}
                    onClose={() => setShowCart(false)}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                    onCheckout={handleCheckoutClick}
                />
            )}

            {/* Order Modal */}
            {showOrderModal && (
                <div className={styles['modal-overlay']}>
                    <div className={styles['modal-content']}>
                        <button className={styles['modal-close-btn']} onClick={() => setShowOrderModal(false)}>
                            <FaTimes />
                        </button>

                        <div className={styles['modal-header']}>
                            <h2 className={styles['modal-title']}>Reservation Checkout</h2>
                            <p className={styles['modal-subtitle']}>Items will be reserved for pickup</p>
                            <div className={styles['cash-only-banner']}>
                                <p className={styles['cash-only-text']}>💵 CASH ONLY DEAL</p>
                                <p className={styles['cash-only-subtext']}>Payment accepted in cash only at pickup</p>
                            </div>
                        </div>

                        <div className={styles['order-summary']}>
                            <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '15px' }}>Order Summary</h3>
                            {cart.map(item => (
                                <div key={item.product_id} className={styles['summary-item']}>
                                    <span>{item.title} x{item.quantity}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <hr className={styles['summary-divider']} />
                            <div className={styles['summary-total']}>
                                <span>Total:</span>
                                <span>${cartTotalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className={styles['info-section']} style={{ marginBottom: '20px' }}>
                            <h4 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>📍 Pickup Information</h4>
                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                <p><strong>Address:</strong><br />1050 McNicoll Ave, Unit 5<br />Scarborough, ON M1W 2L8</p>
                                <p><strong>Hours:</strong><br />Monday to Friday<br />11:00 AM - 4:30 PM</p>
                                <p style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>By appointment only</p>
                            </div>
                        </div>

                        <div className={styles['info-section']} style={{ marginBottom: '20px' }}>
                            <h4 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>👤 Contact Person</h4>
                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                <p style={{ marginBottom: '5px' }}>For private message or arrangement, please add our WeChat:</p>
                                <p><strong>WeChat ID:</strong> <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Blitzcanada</span></p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Preferred Date (Monday-Friday only):</label>
                            <input
                                type="date"
                                id="preferred-date"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background-gray)', color: 'var(--color-text-primary)' }}
                                value={preferredDate}
                                onChange={(e) => {
                                    if (validateWeekday(e.target.value)) {
                                        setPreferredDate(e.target.value);
                                    } else {
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Preferred Time:</label>
                            <select
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background-gray)', color: 'var(--color-text-primary)' }}
                                value={preferredTime}
                                onChange={(e) => setPreferredTime(e.target.value)}
                            >
                                <option value="">Select a time slot</option>
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

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Pickup Note (Optional):</label>
                            <textarea
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background-gray)', color: 'var(--color-text-primary)', minHeight: '80px' }}
                                placeholder="Any special instructions for pickup..."
                                value={pickupNote}
                                onChange={(e) => setPickupNote(e.target.value)}
                            ></textarea>
                        </div>

                        <button
                            className={styles['add-to-cart-btn-large']}
                            onClick={handlePlaceOrder}
                            disabled={orderProcessing}
                            style={{ width: '100%' }}
                        >
                            {orderProcessing ? <FaSpinner className="fa-spin" /> : 'Confirm Reservation'}
                        </button>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && lastOrder && (
                <div className={styles['modal-overlay']}>
                    <div className={styles['modal-content']} style={{ textAlign: 'center' }}>
                        <button className={styles['modal-close-btn']} onClick={() => setShowSuccessModal(false)}>
                            <FaTimes />
                        </button>

                        <div style={{ fontSize: '3rem', color: 'var(--color-success)', marginBottom: '16px' }}>
                            <FaCheck />
                        </div>

                        <h2 style={{ color: 'var(--color-success)', margin: '0 0 8px 0', fontSize: '24px' }}>Reservation Confirmed!</h2>
                        <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 24px 0' }}>Your items have been reserved for pickup</p>

                        <div style={{ background: 'var(--color-background-gray)', padding: '20px', borderRadius: '12px', marginBottom: '24px', textAlign: 'left' }}>
                            <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                                <strong>Reservation ID:</strong> {lastOrder.id}<br />
                                <strong>Member ID:</strong> {memberId}<br />
                                <strong>Total:</strong> ${lastOrder.total_amount.toFixed(2)}<br />
                                <strong>Status:</strong> Reserved for pickup<br />
                                <strong>Date:</strong> {new Date(lastOrder.order_date).toLocaleDateString()}<br />
                                {lastOrder.preferred_datetime && <><strong>Preferred Date/Time:</strong> {lastOrder.preferred_datetime}</>}
                            </p>
                        </div>

                        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                            <h4 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>📍 Pickup Information</h4>
                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                <p><strong>Address:</strong><br />1050 McNicoll Ave, Unit 5<br />Scarborough, ON M1W 2L8</p>
                                <p><strong>Hours:</strong><br />Monday to Friday<br />11:00 AM - 4:30 PM</p>
                                <p style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>By appointment only</p>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,193,7,0.1)', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(255,193,7,0.3)' }}>
                            <h4 style={{ color: '#ffc107', margin: '0 0 12px 0', fontSize: '16px' }}>💵 Payment Information</h4>
                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                                <p style={{ margin: 0, color: '#ffc107', fontWeight: '600' }}>CASH ONLY DEAL</p>
                                <p style={{ margin: '8px 0 0 0' }}>Payment accepted in cash only at pickup. Please bring exact change.</p>
                            </div>
                        </div>

                        <div style={{ background: 'var(--color-background-gray)', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
                            <h4 style={{ color: 'var(--color-text-primary)', margin: '0 0 12px 0', fontSize: '16px' }}>📱 Contact Blitz Owner</h4>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '150px', height: '150px', margin: '0 auto 12px', background: 'white', padding: '10px', borderRadius: '8px' }}>
                                    <img
                                        src="https://qhkcrrphsjpytdfqfamq.supabase.co/storage/v1/object/public/shop-images/product-images/blitz%20wechat.JPG"
                                        alt="Contact WeChat QR Code"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                </div>
                                <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '14px', fontWeight: '500' }}>Scan to contact via WeChat</p>
                            </div>
                        </div>

                        <button
                            className={styles['add-to-cart-btn-large']}
                            onClick={() => setShowSuccessModal(false)}
                            style={{ width: '100%' }}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
