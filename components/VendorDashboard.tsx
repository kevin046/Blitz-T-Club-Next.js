'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import './ee-auto.css'; // Reusing the CSS for now, can be renamed to vendor-dashboard.css later

interface DealOption {
    type: string;
    label: { [key: string]: string };
    desc: { [key: string]: string };
    price: number;
}

interface VendorDashboardProps {
    vendorId: string;
    vendorName: string;
    vendorSubtitle?: string;
    dealOptions: DealOption[];
    brandLogo?: React.ReactNode;
}

function VendorDashboardContent({ vendorId, vendorName, vendorSubtitle, dealOptions, brandLogo }: VendorDashboardProps) {
    const searchParams = useSearchParams();

    const [lang, setLang] = useState<'zh' | 'en'>('zh');
    const [currentMemberId, setCurrentMemberId] = useState<string>('');
    const [memberInfo, setMemberInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('log');
    const [dealForm, setDealForm] = useState({
        selectedDeals: [] as any[],
        customItems: [] as any[],
        total: 0
    });
    const [allDeals, setAllDeals] = useState<any[]>([]);
    const [previousSales, setPreviousSales] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [manualMemberId, setManualMemberId] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dealTypeFilter, setDealTypeFilter] = useState('');

    const t = (key: string) => {
        const translations: any = {
            zh: {
                title: `${vendorName} 交易追踪`,
                member_info: '会员信息',
                name: '姓名',
                member_id: '会员ID',
                phone: '电话',
                email: '邮箱',
                status: '状态',
                verified: '已验证',
                not_verified: '未验证',
                log_deal: '记录交易',
                view_deals: '查看所有交易',
                price_list: `${vendorName} 价格表`,
                total_amount: '总金额',
                submit_sale: '提交销售',
                previous_sales: '历史销售',
                no_prev_sales: '该会员暂无历史销售。',
                sale_logged: `交易已记录！感谢 ${vendorName}。`,
                add_custom_item: '添加自定义项目',
                description: '描述',
                price: '价格',
                custom_items: '自定义项目',
                enter_member: '输入会员信息',
                enter_member_desc: '输入会员ID以记录交易，或扫描会员二维码。',
                load_member: '加载会员',
                enter_member_id: '输入会员ID',
                filter_export: '筛选与导出',
                search: '搜索',
                search_placeholder: '按会员姓名或ID搜索...',
                start_date: '开始日期',
                end_date: '结束日期',
                deal_type: '交易类型',
                all_deal_types: '所有交易类型',
                export_csv: '导出CSV',
                all_deals: '所有交易',
                no_deals: '没有符合条件的交易。',
                date: '日期',
                member_name: '会员姓名',
                deal_details: '交易详情',
                total: '总计',
                window_tint: '车窗贴膜',
            },
            en: {
                title: `${vendorName} Deal Tracking`,
                member_info: 'Member Information',
                name: 'Name',
                member_id: 'Member ID',
                phone: 'Phone',
                email: 'Email',
                status: 'Status',
                verified: 'Verified',
                not_verified: 'Not Verified',
                log_deal: 'Log a Deal',
                view_deals: 'View All Deals',
                price_list: `${vendorName} Price List`,
                total_amount: 'Total Amount',
                submit_sale: 'Submit Sale',
                previous_sales: 'Previous Sales',
                no_prev_sales: 'No previous sales for this member.',
                sale_logged: `Sale logged! Thank you, ${vendorName}.`,
                add_custom_item: 'Add Custom Item',
                description: 'Description',
                price: 'Price',
                custom_items: 'Custom Items',
                enter_member: 'Enter Member Information',
                enter_member_desc: "Enter a member ID to log a deal, or scan a member's QR code.",
                load_member: 'Load Member',
                enter_member_id: 'Enter Member ID',
                filter_export: 'Filter & Export',
                search: 'Search',
                search_placeholder: 'Search by member name or ID...',
                start_date: 'Start Date',
                end_date: 'End Date',
                deal_type: 'Deal Type',
                all_deal_types: 'All Deal Types',
                export_csv: 'Export CSV',
                all_deals: 'All Deals',
                no_deals: 'No deals found for the selected filters.',
                date: 'Date',
                member_name: 'Member Name',
                deal_details: 'Deal Details',
                total: 'Total',
                window_tint: 'Window Tint',
            }
        };
        return translations[lang][key] || key;
    };

    useEffect(() => {
        const savedLang = localStorage.getItem('vendor_lang');
        if (savedLang === 'zh' || savedLang === 'en') {
            setLang(savedLang);
        }

        const memberIdParam = searchParams.get('member_id');

        if (memberIdParam) {
            setCurrentMemberId(memberIdParam);
            fetchMemberInfo(memberIdParam);
            setActiveTab('log');
        } else {
            setActiveTab('view');
        }

        fetchAllDeals();
    }, [searchParams, vendorId]);

    const loadMemberById = async () => {
        if (!manualMemberId.trim()) {
            alert('Please enter a member ID');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, member_id, phone, email, membership_status')
                .eq('member_id', manualMemberId.trim())
                .single();

            if (error || !data) {
                alert('Member not found. Please check the member ID and try again.');
                setLoading(false);
                return;
            }

            setCurrentMemberId(data.id);
            setMemberInfo(data);
            await fetchPreviousSales(data.id);
            setLoading(false);
        } catch (err) {
            console.error('Error loading member:', err);
            alert('Error loading member');
            setLoading(false);
        }
    };

    const fetchMemberInfo = async (memberId: string) => {
        setLoading(true);
        try {
            let { data, error } = await supabase
                .from('profiles')
                .select('full_name, member_id, phone, email, membership_status')
                .eq('member_id', memberId)
                .single();

            if (error || !data) {
                const { data: dataById, error: errorById } = await supabase
                    .from('profiles')
                    .select('full_name, member_id, phone, email, membership_status')
                    .eq('id', memberId)
                    .single();

                if (!errorById && dataById) {
                    data = dataById;
                }
            }

            if (data) {
                setMemberInfo(data);
                await fetchPreviousSales(memberId);
            }
        } catch (err) {
            console.error('Error fetching member:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPreviousSales = async (memberId: string) => {
        try {
            const { data, error } = await supabase
                .from('vendor_deals')
                .select('*')
                .eq('member_id', memberId)
                .eq('vendor_id', vendorId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setPreviousSales(data);
            }
        } catch (err) {
            console.error('Error fetching previous sales:', err);
        }
    };

    const fetchAllDeals = async () => {
        try {
            const { data, error } = await supabase
                .from('vendor_deals')
                .select('*, profiles(full_name, member_id)')
                .eq('vendor_id', vendorId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setAllDeals(data);
            }
        } catch (err) {
            console.error('Error fetching all deals:', err);
        }
    };

    const handleDealSelection = (deal: any, checked: boolean) => {
        let selected = [...dealForm.selectedDeals];
        if (checked) {
            selected.push(deal);
        } else {
            selected = selected.filter(d => d.type !== deal.type);
        }

        updateTotal(selected, dealForm.customItems);
    };

    const addCustomItem = () => {
        const customItems = [
            ...dealForm.customItems,
            { desc: '', price: 0 }
        ];
        setDealForm(prev => ({ ...prev, customItems }));
    };

    const removeCustomItem = (index: number) => {
        const customItems = dealForm.customItems.filter((_, i) => i !== index);
        updateTotal(dealForm.selectedDeals, customItems);
    };

    const updateCustomItem = (index: number, field: string, value: any) => {
        const customItems = [...dealForm.customItems];
        customItems[index] = { ...customItems[index], [field]: value };
        updateTotal(dealForm.selectedDeals, customItems);
    };

    const updateTotal = (selected: any[], custom: any[]) => {
        let total = 0;
        selected.forEach(d => total += d.price);
        custom.forEach(c => {
            const price = parseFloat(c.price);
            if (!isNaN(price)) total += price;
        });

        setDealForm({ selectedDeals: selected, customItems: custom, total });
    };

    const handleSubmitDeal = async (e: React.FormEvent) => {
        e.preventDefault();

        if (dealForm.selectedDeals.length === 0 && dealForm.customItems.length === 0) {
            alert('Please select at least one deal or add a custom item.');
            return;
        }

        if (!currentMemberId) {
            alert('Please load a member first.');
            return;
        }

        const dealDetails = dealForm.selectedDeals.map(d => ({
            type: d.type,
            label: d.label[lang] || d.label,
            price: d.price
        }));

        const validCustomItems = dealForm.customItems.filter(c => c.desc && !isNaN(parseFloat(c.price)));

        const { error } = await supabase
            .from('vendor_deals')
            .insert({
                member_id: currentMemberId,
                vendor_id: vendorId,
                vendor_name: vendorName,
                deal_type: 'window_tint',
                deal_details: dealDetails,
                total_price: dealForm.total,
                custom_items: validCustomItems,
                created_at: new Date().toISOString(),
                created_by: vendorId
            });

        if (error) {
            alert('Failed to log deal: ' + error.message);
            return;
        }

        setModalMessage(t('sale_logged'));
        setShowModal(true);
        setDealForm({ selectedDeals: [], customItems: [], total: 0 });
        await fetchPreviousSales(currentMemberId);
        await fetchAllDeals();
    };

    const exportToCSV = () => {
        const filtered = getFilteredDeals();

        let csv = `${t('date')},${t('member_name')},${t('member_id')},${t('deal_details')},${t('custom_items')},${t('total')}\n`;

        filtered.forEach(deal => {
            const date = new Date(deal.created_at).toLocaleString();
            const name = deal.profiles?.full_name || '';
            const mid = deal.profiles?.member_id || '';
            const details = (deal.deal_details || []).map((d: any) => `${d.label}: $${d.price}`).join('; ');
            const customs = (deal.custom_items || []).map((c: any) => `${c.desc}: $${c.price}`).join('; ');
            const total = deal.total_price;
            csv += `"${date}","${name}","${mid}","${details}","${customs}","${total}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${vendorName.toLowerCase().replace(/\s+/g, '-')}-deals-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getFilteredDeals = () => {
        return allDeals.filter(deal => {
            let match = true;

            if (searchInput) {
                const search = searchInput.toLowerCase();
                const name = (deal.profiles?.full_name || '').toLowerCase();
                const mid = (deal.profiles?.member_id || '').toLowerCase();
                match = name.includes(search) || mid.includes(search);
            }

            if (match && startDate) {
                match = new Date(deal.created_at) >= new Date(startDate);
            }

            if (match && endDate) {
                match = new Date(deal.created_at) <= new Date(endDate + 'T23:59:59');
            }

            if (match && dealTypeFilter) {
                match = deal.deal_type === dealTypeFilter;
            }

            return match;
        });
    };

    const filteredDeals = getFilteredDeals();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className="ee-auto-container">
            {/* Header */}
            <div className="header">
                <div className="header-content">
                    <div className="logo-section">
                        <img src="https://i.ibb.co/fkrdXZK/Logo4-white.png" alt="Blitz T Club" className="blitz-logo" />
                        <div className="title-section">
                            <h1>{t('title')}</h1>
                            <p>Blitz T Club Vendor Management System</p>
                        </div>
                    </div>
                    <div className="ee-auto-brand">
                        {brandLogo ? brandLogo : (
                            <div className="ee-auto-logo">
                                {vendorName}
                            </div>
                        )}
                        {vendorSubtitle && <div className="ee-auto-subtitle">{vendorSubtitle}</div>}
                        <button className="lang-btn" onClick={() => {
                            const newLang = lang === 'zh' ? 'en' : 'zh';
                            setLang(newLang);
                            localStorage.setItem('vendor_lang', newLang);
                        }}>
                            {lang === 'zh' ? 'EN' : '中文'}
                        </button>
                    </div>
                </div>

                <div className="nav-tabs">
                    <button
                        className={`nav-tab ${activeTab === 'log' ? 'active' : ''}`}
                        onClick={() => setActiveTab('log')}
                    >
                        <i className="fas fa-plus-circle"></i>
                        {t('log_deal')}
                    </button>
                    <button
                        className={`nav-tab ${activeTab === 'view' ? 'active' : ''}`}
                        onClick={() => setActiveTab('view')}
                    >
                        <i className="fas fa-table"></i>
                        {t('view_deals')}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-container">
                {activeTab === 'log' && (
                    <div>
                        {/* Member Info or Input */}
                        {!memberInfo ? (
                            <div className="card">
                                <div className="card-header">
                                    <div className="icon">
                                        <i className="fas fa-user-plus"></i>
                                    </div>
                                    <h3>{t('enter_member')}</h3>
                                </div>
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{t('enter_member_desc')}</p>
                                    <div style={{ display: 'flex', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
                                        <input
                                            type="text"
                                            value={manualMemberId}
                                            onChange={(e) => setManualMemberId(e.target.value)}
                                            placeholder={t('enter_member_id')}
                                            style={{
                                                flex: 1,
                                                padding: '12px 16px',
                                                border: '2px solid var(--border-color)',
                                                borderRadius: '10px',
                                                background: 'var(--secondary-bg)',
                                                color: 'var(--text-primary)',
                                                fontSize: '14px'
                                            }}
                                            onKeyPress={(e) => e.key === 'Enter' && loadMemberById()}
                                        />
                                        <button className="btn btn-primary" onClick={loadMemberById} style={{ padding: '12px 20px' }}>
                                            <i className="fas fa-search"></i>
                                            {t('load_member')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card">
                                <div className="card-header">
                                    <div className="icon">
                                        <i className="fas fa-user"></i>
                                    </div>
                                    <h3>{t('member_info')}</h3>
                                </div>
                                <div className="member-info">
                                    <div className="info-item">
                                        <div className="info-label">{t('name')}</div>
                                        <div className="info-value">{memberInfo.full_name || '-'}</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">{t('member_id')}</div>
                                        <div className="info-value">{memberInfo.member_id || '-'}</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">{t('phone')}</div>
                                        <div className="info-value">{memberInfo.phone || '-'}</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">{t('email')}</div>
                                        <div className="info-value">{memberInfo.email || '-'}</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">{t('status')}</div>
                                        <span className={`status-badge ${memberInfo.membership_status === 'active' ? 'status-verified' : 'status-not-verified'}`}>
                                            <i className={`fas fa-${memberInfo.membership_status === 'active' ? 'check-circle' : 'exclamation-triangle'}`}></i>
                                            {memberInfo.membership_status === 'active' ? t('verified') : t('not_verified')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Deal Form - Only show if member loaded */}
                        {memberInfo && (
                            <form onSubmit={handleSubmitDeal}>
                                <div className="card">
                                    <div className="card-header">
                                        <div className="icon">
                                            <i className="fas fa-tags"></i>
                                        </div>
                                        <h3>{t('price_list')}</h3>
                                    </div>
                                    <div className="deal-options">
                                        {dealOptions.map((opt, idx) => (
                                            <div key={idx} className="deal-option">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => handleDealSelection(opt, e.target.checked)}
                                                    checked={dealForm.selectedDeals.some(d => d.type === opt.type)}
                                                />
                                                <div className="deal-option-content">
                                                    <div className="deal-option-title">{opt.label[lang]}</div>
                                                    <div className="deal-option-desc">{opt.desc[lang]}</div>
                                                </div>
                                                <div className="deal-option-price">${opt.price}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <div className="icon">
                                            <i className="fas fa-plus"></i>
                                        </div>
                                        <h3>{t('custom_items')}</h3>
                                    </div>
                                    <div className="custom-items">
                                        {dealForm.customItems.map((item, idx) => (
                                            <div key={idx} className="custom-item-row">
                                                <input
                                                    type="text"
                                                    placeholder={t('description')}
                                                    value={item.desc}
                                                    onChange={(e) => updateCustomItem(idx, 'desc', e.target.value)}
                                                    className="custom-desc"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder={t('price')}
                                                    value={item.price}
                                                    onChange={(e) => updateCustomItem(idx, 'price', e.target.value)}
                                                    className="custom-price"
                                                    min="0"
                                                    step="0.01"
                                                />
                                                <button type="button" className="remove-btn" onClick={() => removeCustomItem(idx)}>
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" className="add-custom-btn" onClick={addCustomItem}>
                                        <i className="fas fa-plus"></i>
                                        {t('add_custom_item')}
                                    </button>
                                </div>

                                <div className="deal-summary">
                                    <div className="deal-summary-label">{t('total_amount')}</div>
                                    <div className="deal-summary-total">${dealForm.total}</div>
                                </div>

                                <button type="submit" className="btn btn-success">
                                    <i className="fas fa-check"></i>
                                    {t('submit_sale')}
                                </button>
                            </form>
                        )}

                        {/* Previous Sales */}
                        {previousSales.length > 0 && (
                            <div className="card">
                                <div className="card-header">
                                    <div className="icon">
                                        <i className="fas fa-history"></i>
                                    </div>
                                    <h3>{t('previous_sales')}</h3>
                                </div>
                                <div className="previous-sales">
                                    {previousSales.map((sale, idx) => (
                                        <div key={idx} className="sale-item">
                                            <div className="sale-date">
                                                <i className="fas fa-calendar"></i>
                                                {new Date(sale.created_at).toLocaleString()}
                                            </div>
                                            <div className="sale-total">{t('total')}: ${sale.total_price}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'view' && (
                    <div>
                        <div className="card">
                            <div className="card-header">
                                <div className="icon">
                                    <i className="fas fa-filter"></i>
                                </div>
                                <h3>{t('filter_export')}</h3>
                            </div>

                            <div className="filters">
                                <div className="filter-group">
                                    <label htmlFor="searchInput">{t('search')}</label>
                                    <input
                                        type="text"
                                        id="searchInput"
                                        placeholder={t('search_placeholder')}
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                    />
                                </div>
                                <div className="filter-group">
                                    <label htmlFor="startDate">{t('start_date')}</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="filter-group">
                                    <label htmlFor="endDate">{t('end_date')}</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                                <div className="filter-group">
                                    <label htmlFor="dealTypeFilter">{t('deal_type')}</label>
                                    <select
                                        id="dealTypeFilter"
                                        value={dealTypeFilter}
                                        onChange={(e) => setDealTypeFilter(e.target.value)}
                                    >
                                        <option value="">{t('all_deal_types')}</option>
                                        <option value="window_tint">{t('window_tint')}</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>&nbsp;</label>
                                    <button className="btn btn-primary" onClick={exportToCSV}>
                                        <i className="fas fa-file-export"></i>
                                        {t('export_csv')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <div className="icon">
                                    <i className="fas fa-table"></i>
                                </div>
                                <h3>{t('all_deals')}</h3>
                            </div>
                            {filteredDeals.length === 0 ? (
                                <div className="no-results">{t('no_deals')}</div>
                            ) : (
                                <div className="table-container">
                                    <table className="deals-table">
                                        <thead>
                                            <tr>
                                                <th>{t('date')}</th>
                                                <th>{t('member_name')}</th>
                                                <th>{t('member_id')}</th>
                                                <th>{t('deal_details')}</th>
                                                <th>{t('custom_items')}</th>
                                                <th>{t('total')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredDeals.map((deal, idx) => (
                                                <tr key={idx}>
                                                    <td data-label={t('date')}>{new Date(deal.created_at).toLocaleString()}</td>
                                                    <td data-label={t('member_name')}>{deal.profiles?.full_name || '-'}</td>
                                                    <td data-label={t('member_id')}>{deal.profiles?.member_id || '-'}</td>
                                                    <td data-label={t('deal_details')}>
                                                        <ul className="deal-details-list">
                                                            {(deal.deal_details || []).map((d: any, i: number) => (
                                                                <li key={i}>{d.label}: ${d.price}</li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                    <td data-label={t('custom_items')}>
                                                        <ul className="custom-items-list">
                                                            {(deal.custom_items || []).map((c: any, i: number) => (
                                                                <li key={i}>{c.desc}: ${c.price}</li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                    <td data-label={t('total')}><strong>${deal.total_price}</strong></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal active" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-icon">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="modal-message">{modalMessage}</div>
                        <button className="btn btn-success" onClick={() => setShowModal(false)}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function VendorDashboard(props: VendorDashboardProps) {
    return (
        <Suspense fallback={<div className="loading-container"><div className="spinner"></div><div>Loading...</div></div>}>
            <VendorDashboardContent {...props} />
        </Suspense>
    );
}
