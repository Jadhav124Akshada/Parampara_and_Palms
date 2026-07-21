import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const adminUser = localStorage.getItem("adminUser");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Active state hooks for interactive graph chart hover metrics
    const [hoveredWeekNode, setHoveredWeekNode] = useState(null);
    const [hoveredUserNode, setHoveredUserNode] = useState(null);
    
    // Core base metrics state matching your exact properties
    const [metrics, setMetrics] = useState({
        totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalCategories: 0, totalFoodItems: 0,
        newOrders: 0, confirmedOrders: 0, preparedOrders: 0, deliveredOrders: 0, cancelledOrders: 0,
        today_Revenue: 0, week_Revenue: 0, month_Revenue: 0, year_Revenue: 0,
        today_Orders: 0, week_Orders: 0, month_Orders: 0, reviews: 0, wishlists: 0,
    });

    // Chart datasets structured cleanly for your backend API payloads
    const [chartData, setChartData] = useState({
        monthlySales: [],
        topProducts: [],
        weeklyUsers: []
    });

    useEffect(() => {
        if (!adminUser) {
            navigate('/admin-login');
            return;
        }
        
        let isMounted = true; 

        fetch('https://parampara-and-palms.onrender.com/dashboard-metrics/')
            .then(res => {
                if (!res.ok) throw new Error("Server response error");
                return res.json();
            })
            .then(data => {
                if (isMounted) {
                    // Adapt safely if endpoint aggregates parameters or encapsulates standard data objects
                    if (data.metrics) {
                        setMetrics(data.metrics);
                    } else {
                        setMetrics(data);
                    }
                    if (data.charts) setChartData(data.charts);
                    setLoading(false);
                }
            })
            .catch(err => {
                if (isMounted) {
                    console.error("Metrics load error:", err);
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [adminUser, navigate]);

    // Group 1: Core Catalog (Warm Ivory & Muted Taupe Theme)
    const catalogCards = [
        { title: 'Total Users', value: metrics.totalUsers, icon: 'fas fa-users', color: '#FDFBF7', textColor: '#2E2520', borderColor: '#E6DFD5' },
        { title: 'Food Categories', value: metrics.totalCategories, icon: 'fas fa-list-alt', color: '#FDFBF7', textColor: '#2E2520', borderColor: '#E6DFD5' }, 
        { title: 'Food Items', value: metrics.totalFoodItems, icon: 'fas fa-utensils', color: '#FDFBF7', textColor: '#2E2520', borderColor: '#E6DFD5' }, 
    ];

    // Group 2: Order Status Lifecycle (Velvet Magenta & Deep Charcoal Theme)
    const orderCards = [
        { title: 'Total Orders', value: metrics.totalOrders, icon: 'fas fa-shopping-bag', color: '#1E1B18', textColor: '#FDFBF7' },
        { title: 'New Orders Pending', value: metrics.newOrders, icon: 'fas fa-clock', color: '#882D61', textColor: '#FDFBF7' },
        { title: 'Confirmed Orders', value: metrics.confirmedOrders, icon: 'fas fa-thumbs-up', color: '#5C5346', textColor: '#FDFBF7' },
        { title: 'Prepared Orders', value: metrics.preparedOrders, icon: 'fas fa-fire', color: '#AA3977', textColor: '#FDFBF7' },
        { title: 'Delivered Orders', value: metrics.deliveredOrders, icon: 'fas fa-check-circle', color: '#4A524A', textColor: '#FDFBF7' },
        { title: 'Cancelled Orders', value: metrics.cancelledOrders, icon: 'fas fa-times-circle', color: '#706561', textColor: '#FDFBF7' },
    ];

    // Group 3: Sales Performance & Revenue (Rich Warm Espresso & Cream Theme)
    const revenueCards = [
        { title: 'Total Revenue', value: `₹${Number(metrics.totalRevenue).toFixed(2)}`, icon: 'fas fa-coins', color: '#2E2520', textColor: '#FDFBF7' },
        { title: "Today's Revenue", value: `₹${Number(metrics.today_Revenue).toFixed(2)}`, icon: 'fas fa-wallet', color: '#40352F', textColor: '#FDFBF7' }, 
        { title: 'Weekly Revenue', value: `₹${Number(metrics.week_Revenue).toFixed(2)}`, icon: 'fas fa-chart-line', color: '#54463F', textColor: '#FDFBF7' }, 
        { title: 'Monthly Revenue', value: `₹${Number(metrics.month_Revenue).toFixed(2)}`, icon: 'fas fa-chart-area', color: '#6E5D55', textColor: '#FDFBF7' }, 
        { title: 'Yearly Revenue', value: `₹${Number(metrics.year_Revenue).toFixed(2)}`, icon: 'fas fa-dollar-sign', color: '#8C776D', textColor: '#FDFBF7' },
    ];

    // Group 4: Time-based Order Trends (Warm Greige Theme)
    const trendCards = [
        { title: "Today's Orders", value: metrics.today_Orders, icon: 'fas fa-calendar-day', color: '#FDFBF7', textColor: '#2E2520', borderColor: '#E6DFD5' },
        { title: 'This Week Orders', value: metrics.week_Orders, icon: 'fas fa-calendar-week', color: '#F5EFEB', textColor: '#2E2520', borderColor: '#DECFC7' },
        { title: 'This Month Orders', value: metrics.month_Orders, icon: 'fas fa-calendar-alt', color: '#EBE1DA', textColor: '#2E2520', borderColor: '#D4C0B5' }, 
    ];

    // Group 5: Interaction & Engagement (Plum & Editorial Tan Theme)
    const socialCards = [
        { title: 'Total Reviews', value: metrics.reviews, icon: 'fas fa-star', color: '#52213E', textColor: '#FDFBF7' },
        { title: 'Wishlist Adds', value: metrics.wishlists, icon: 'fas fa-heart', color: '#BD8B77', textColor: '#FDFBF7' },
    ];

    // Reusable Custom UI Renderer for Cards
    const renderCardGrid = (cards) => (
        <div className='row g-3 mb-4'>
            {cards.map((card, index) => (
                <div key={index} className='col-xl-3 col-md-6'>
                    <div 
                        className='card border-0 h-100 shadow-sm' 
                        style={{ 
                            backgroundColor: card.color, 
                            borderRadius: '12px',
                            color: card.textColor,
                            border: card.borderColor ? `1px solid ${card.borderColor}` : 'none',
                        }}
                    >
                        <div className='card-body d-flex align-items-center justify-content-between p-4'>
                            <div>
                                <h6 
                                    className='text-uppercase small mb-2 fw-bold tracking-wider' 
                                    style={{ 
                                        color: card.textColor === '#FDFBF7' ? 'rgba(253, 251, 247, 0.6)' : 'rgba(46, 37, 32, 0.5)',
                                        fontSize: '0.72rem',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    {card.title}
                                </h6>
                                <h3 className='mb-0' style={{ fontSize: '1.6rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
                                    {card.value}
                                </h3>
                            </div>
                            <div style={{ color: card.textColor === '#FDFBF7' ? 'rgba(253, 251, 247, 0.25)' : 'rgba(46, 37, 32, 0.15)' }}>
                                <i className={`${card.icon} fa-2xl`}></i>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // Hardcoded absolute calendar month layout bounds to preserve 12-column grid tracks safely
    const calendarMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Normalize and blend state array results down to standard 12-month calendar arrays
    const normalizedMonthlySales = calendarMonths.map(month => {
        const matchingEntry = chartData.monthlySales?.find(item => 
            (item.month || item.label || '').substring(0, 3).toLowerCase() === month.toLowerCase()
        );
        return { month, sales: matchingEntry ? matchingEntry.sales : 0 };
    });

    const maxMonthlySales = Math.max(...normalizedMonthlySales.map(i => i.sales), 1);
    const maxWeeklySales = chartData.weeklyUsers?.length > 0 ? Math.max(...chartData.weeklyUsers.map(item => item.sales || 1)) : 1;
    const maxWeeklyUsers = chartData.weeklyUsers?.length > 0 ? Math.max(...chartData.weeklyUsers.map(item => item.newUsers || 1)) : 1;

    const totalEngagementMix = (metrics.reviews || 0) + (metrics.wishlists || 0) || 1;
    const reviewPercentage = Math.round(((metrics.reviews || 0) / totalEngagementMix) * 100);

    // Vector line spatial calculations
    const svgWidth = 600;
    const svgHeight = 240;
    const padLeft = 30; 
    const padRight = 30;
    const padTop = 40;
    const padBottom = 45;

    let pointsString = "";
    let nodesCoordinates = [];
    const dataset = chartData.weeklyUsers || [];
    const chartW = svgWidth - (padLeft + padRight);
    const chartH = svgHeight - (padTop + padBottom);

    if (dataset.length > 0) {
        nodesCoordinates = dataset.map((item, index) => {
            const x = padLeft + (index / Math.max(dataset.length - 1, 1)) * chartW;
            const salesValue = item.sales || 0;
            const y = padTop + chartH - ((salesValue / maxWeeklySales) * chartH);
            return { x, y, label: item.week || item.day, value: salesValue };
        });
        pointsString = nodesCoordinates.map(p => `${p.x},${p.y}`).join(" ");
    }

    return (
        <AdminLayout>
            <div className='container-fluid px-3 py-4' style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#FAF8F5', minHeight: '100vh' }}>
                
                {/* Header Section */}
                <div className="d-flex align-items-center mb-5 pb-3 border-bottom" style={{ borderColor: '#EAE5DF' }}>
                    <div className="p-3 bg-white rounded-3 shadow-sm me-3 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px', border: '1px solid #EAE5DF' }}>
                        <i className='fas fa-chart-pie fa-lg' style={{ color: '#6E5D55' }}></i>
                    </div>
                    <div>
                        <h2 className='mb-0' style={{ fontWeight: '700', color: '#1E1B18', letterSpacing: '-0.8px' }}>Dashboard Overview</h2>
                        <p className="text-muted small mb-0">System performance, real-time analytics, and operational metrics</p>
                    </div>
                </div>

                {/* Grid Blocks Displays */}
                <div className="section-block mb-5">
                    <h6 className='mb-3 fw-bold tracking-wider' style={{ color: '#706561', fontSize: '0.8rem' }}>
                        <i className='fas fa-layer-group me-2'></i>CORE STORE CATALOG
                    </h6>
                    {renderCardGrid(catalogCards)}
                </div>

                <div className="section-block mb-5">
                    <h6 className='mb-3 fw-bold tracking-wider' style={{ color: '#706561', fontSize: '0.8rem' }}>
                        <i className='fas fa-sync-alt me-2'></i>ORDER LIFECYCLE TRACKING
                    </h6>
                    {renderCardGrid(orderCards)}
                </div>

                <div className="section-block mb-5">
                    <h6 className='mb-3 fw-bold tracking-wider' style={{ color: '#706561', fontSize: '0.8rem' }}>
                        <i className='fas fa-wallet me-2'></i>REVENUE GENERATION BREAKDOWNS
                    </h6>
                    {renderCardGrid(revenueCards)}
                </div>

                <div className="section-block mb-5">
                    <h6 className='mb-3 fw-bold tracking-wider' style={{ color: '#706561', fontSize: '0.8rem' }}>
                        <i className='fas fa-clock me-2'></i>PERIODIC TIME TRENDS
                    </h6>
                    {renderCardGrid(trendCards)}
                </div>

                <div className="section-block mb-5">
                    <h6 className='mb-3 fw-bold tracking-wider' style={{ color: '#706561', fontSize: '0.8rem' }}>
                        <i className='fas fa-heart me-2'></i>USER ENGAGEMENT
                    </h6>
                    {renderCardGrid(socialCards)}
                </div>

                {/* --- ADVANCED VISUALIZATION PERFORMANCE DASHBOARD PANELS --- */}
                <div className="row g-4 mb-4">
                    
                    {/* Panel 1: Clustered 12-Month Grouped Pillar Column Chart */}
                    <div className="col-xl-6 col-md-12">
                        <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '12px' }}>
                            <h5 className="fw-bold mb-3" style={{ color: '#2E2520' }}><i className="fas fa-chart-bar me-2" style={{ color: '#8C776D' }}></i>Monthly Sales Breakdowns</h5>
                            <div className="position-relative w-100 pt-4 px-1" style={{ minHeight: '230px' }}>
                                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                                    <div key={i} className="position-absolute w-100 border-top" style={{ bottom: `${ratio * 140 + 40}px`, left: 0, borderColor: '#f1f3f5', zIndex: 1 }} />
                                ))}
                                <div className="d-flex align-items-end justify-content-between position-relative" style={{ height: '140px', zIndex: 2 }}>
                                    {normalizedMonthlySales.map((item, index) => {
                                        const grossValue = item.sales;
                                        const simulatedNet = grossValue * 0.82;
                                        const simulatedVol = grossValue * 0.64;
                                        return (
                                            <div key={index} className="d-flex flex-column align-items-center flex-grow-1 mx-0.5">
                                                <div className="d-flex align-items-end gap-0.5 w-100 justify-content-center">
                                                    <div style={{ height: `${(grossValue / maxMonthlySales) * 115}px`, width: '5px', backgroundColor: '#6E5D55' }} title={`Gross: ₹${grossValue}`} />
                                                    <div style={{ height: `${(simulatedNet / maxMonthlySales) * 115}px`, width: '5px', backgroundColor: '#BD8B77' }} title={`Net: ₹${Math.round(simulatedNet)}`} />
                                                    <div style={{ height: `${(simulatedVol / maxMonthlySales) * 115}px`, width: '5px', backgroundColor: '#DECFC7' }} title={`Volume: ${Math.round(simulatedVol)}`} />
                                                </div>
                                                <span className="fw-bold text-muted mt-2" style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{item.month}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="d-flex justify-content-center gap-4 mt-3 pt-2 border-top border-light small font-monospace" style={{ fontSize: '0.72rem' }}>
                                <div className="d-flex align-items-center"><div className="rounded-circle me-1" style={{ width: '8px', height: '8px', backgroundColor: '#6E5D55' }} /> Gross</div>
                                <div className="d-flex align-items-center"><div className="rounded-circle me-1" style={{ width: '8px', height: '8px', backgroundColor: '#BD8B77' }} /> Net</div>
                                <div className="d-flex align-items-center"><div className="rounded-circle me-1" style={{ width: '8px', height: '8px', backgroundColor: '#DECFC7' }} /> Volume</div>
                            </div>
                        </div>
                    </div>

                    {/* Panel 2: Unlabelled Y-Axis Line Chart with Point Hover Notification Popups */}
                    <div className="col-xl-6 col-md-12">
                        <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '12px' }}>
                            <h5 className="fw-bold mb-4" style={{ color: '#2E2520' }}><i className="fas fa-wave-square me-2" style={{ color: '#AA3977' }}></i>Weekly Sales Volume Stream</h5>
                            <div className="d-flex justify-content-center align-items-center w-100 position-relative" style={{ minHeight: '230px' }}>
                                {dataset.length > 0 ? (
                                    <div className="w-100 text-center position-relative">
                                        {hoveredWeekNode && (
                                            <div 
                                                className="position-absolute bg-dark text-white px-2 py-1 rounded shadow-lg small fw-bold font-monospace"
                                                style={{
                                                    left: `${hoveredWeekNode.x - 45}px`,
                                                    top: `${hoveredWeekNode.y - 45}px`,
                                                    zIndex: 100,
                                                    fontSize: '0.75rem',
                                                    pointerEvents: 'none',
                                                    border: '1px solid rgba(255,255,255,0.15)',
                                                    backgroundColor: '#1E1B18'
                                                }}
                                            >
                                                ₹{Number(hoveredWeekNode.value).toFixed(2)}
                                            </div>
                                        )}
                                        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
                                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                                                <line key={i} x1={padLeft} y1={padTop + (chartH * (1 - ratio))} x2={svgWidth - padRight} y2={padTop + (chartH * (1 - ratio))} stroke="#f4efe9" strokeWidth="1.5" />
                                            ))}
                                            <polyline fill="none" stroke="#AA3977" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" points={pointsString} />
                                            {nodesCoordinates.map((node, i) => (
                                                <g key={i}>
                                                    <circle 
                                                        cx={node.x} 
                                                        cy={node.y} 
                                                        r={hoveredWeekNode?.label === node.label ? "7" : "5"} 
                                                        fill={hoveredWeekNode?.label === node.label ? "#AA3977" : "#fff"} 
                                                        stroke="#AA3977" 
                                                        strokeWidth="3" 
                                                        style={{ cursor: 'pointer', transition: 'all 0.1s ease' }}
                                                        onMouseEnter={() => setHoveredWeekNode(node)}
                                                        onMouseLeave={() => setHoveredWeekNode(null)}
                                                    />
                                                    <text x={node.x} y={svgHeight - padBottom + 22} textAnchor="middle" fill="#706561" fontWeight="700" style={{ fontSize: '11px' }}>
                                                        {node.label}
                                                    </text>
                                                </g>
                                            ))}
                                        </svg>
                                    </div>
                                ) : (
                                    <p className="text-muted small text-center w-100">No weekly transaction summaries compiled.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Panel 3: Vertical Registration Histogram with Dynamic Hover Counter Flags */}
                    <div className="col-xl-6 col-md-12">
                        <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '12px' }}>
                            <h5 className="fw-bold mb-4" style={{ color: '#2E2520' }}><i className="fas fa-chart-bar me-2" style={{ color: '#52213E' }}></i>Weekly Account Registrations Histogram</h5>
                            <div className="position-relative w-100 pt-4 px-2" style={{ minHeight: '230px' }}>
                                {hoveredUserNode && (
                                    <div 
                                        className="position-absolute badge shadow p-2 text-white"
                                        style={{
                                            left: `${hoveredUserNode.index * 60 + 50}px`,
                                            bottom: `${hoveredUserNode.heightPercent + 30}%`,
                                            zIndex: 50,
                                            fontSize: '0.75rem',
                                            backgroundColor: '#52213E'
                                        }}
                                    >
                                        {hoveredUserNode.value} Users Registered
                                    </div>
                                )}
                                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                                    <div key={i} className="position-absolute w-100 border-top" style={{ bottom: `${ratio * 130 + 40}px`, left: 0, borderColor: '#f1f3f5', zIndex: 1 }} />
                                ))}
                                <div className="d-flex align-items-end justify-content-around position-relative" style={{ height: '130px', zIndex: 2 }}>
                                    {chartData.weeklyUsers?.length > 0 ? (
                                        chartData.weeklyUsers.map((item, index) => {
                                            const registrationCount = item.newUsers || item.count || 0;
                                            return (
                                                <div key={index} className="d-flex flex-column align-items-center flex-grow-1 mx-3">
                                                    <div 
                                                        className="w-100"
                                                        style={{ 
                                                            height: `${Math.max((registrationCount / maxWeeklyUsers) * 115, 6)}px`, 
                                                            backgroundColor: hoveredUserNode?.index === index ? '#3b162c' : '#52213E', 
                                                            borderRadius: '4px 4px 0 0',
                                                            cursor: 'pointer',
                                                            transition: 'background-color 0.15s, height 0.3s'
                                                        }}
                                                        onMouseEnter={() => setHoveredUserNode({ index, value: registrationCount, heightPercent: (registrationCount / maxWeeklyUsers) * 85 })}
                                                        onMouseLeave={() => setHoveredUserNode(null)}
                                                    />
                                                    <span className="small fw-bold text-muted mt-2 font-monospace" style={{ fontSize: '0.75rem' }}>{item.week || item.day}</span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-muted small text-center w-100 pb-4">No registration histories indexed.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel 4: Concentric Donut Component (Feedback Breakdown Mix) */}
                    <div className="col-xl-6 col-md-12">
                        <div className="card border-0 shadow-sm p-4 bg-white h-100" style={{ borderRadius: '12px' }}>
                            <h5 className="fw-bold mb-4" style={{ color: '#2E2520' }}><i className="fas fa-adjust me-2" style={{ color: '#BD8B77' }}></i>Platform Engagement Mix</h5>
                            <div className="row align-items-center h-100">
                                <div className="col-sm-6 d-flex justify-content-center mb-3 mb-sm-0">
                                    <div 
                                        className="shadow-sm d-flex align-items-center justify-content-center position-relative rounded-circle"
                                        style={{
                                            width: '160px',
                                            height: '160px',
                                            background: `conic-gradient(#52213E 0% ${reviewPercentage}%, #BD8B77 ${reviewPercentage}% 100%)`
                                        }}
                                    >
                                        <div 
                                            className="rounded-circle bg-white d-flex flex-column align-items-center justify-content-center shadow-inner"
                                            style={{ width: '100px', height: '100px' }}
                                        >
                                            <span className="fw-bold text-dark mb-0" style={{ fontSize: '1.25rem' }}>{metrics.reviews + metrics.wishlists}</span>
                                            <span className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase', trackingSpacing: '0.5px' }}>Total Mix</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="d-flex flex-column gap-2 ps-2">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded me-2" style={{ width: '16px', height: '16px', backgroundColor: '#52213E' }}></div>
                                            <span className="small text-dark fw-bold">User Reviews: <span className="text-muted font-monospace">{metrics.reviews} ({reviewPercentage}%)</span></span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <div className="rounded me-2" style={{ width: '16px', height: '16px', backgroundColor: '#BD8B77' }}></div>
                                            <span className="small text-dark fw-bold">Total Wishlists: <span className="text-muted font-monospace">{metrics.wishlists} ({100 - reviewPercentage}%)</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top 5 Selling Products Leaderboard */}
                    <div className="col-md-12">
                        <div className="card border-0 shadow-sm p-0 bg-white" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                            <div className="card-header bg-secondary text-white fw-bold py-3 px-4" style={{ backgroundColor: '#5C5346' }}>
                                <i className="fas fa-star me-2"></i>Top 5 Selling Foods
                            </div>
                            <div className="table-responsive">
                                <table className="table table-striped table-hover mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4" style={{ width: '10%' }}>#</th>
                                            <th>Food Item</th>
                                            <th className="text-end pe-4" style={{ width: '30%' }}>Total Sold</th>
                                        </tr>
                                    </thead> 
                                    <tbody>
                                        {chartData.topProducts?.length > 0 ? (
                                            chartData.topProducts.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="ps-4 fw-bold text-muted">{index + 1}</td>
                                                    <td className="fw-bold text-dark">{item.food__item_name || item.name}</td>
                                                    <td className="text-end pe-4 text-success fw-bold" style={{ color: '#AA3977 !important' }}>{item.total_sold || item.value} units</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="text-center py-4 text-muted small">No product volume logs recorded.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;