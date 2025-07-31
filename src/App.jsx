import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { Zap, Users, ShoppingCart, DollarSign, BrainCircuit, Bot, Loader2, Info, CalendarDays, FlaskConical, Mail, CheckCircle, XCircle, Wand2, Award, Settings, Tag, AlertTriangle } from 'lucide-react';

// ==========================================================
// QUAN TRỌNG: THAY THẾ BẰNG URL RENDER CỦA BẠN
// ==========================================================
const BACKEND_URL = 'https://marketing-ai-backend-4jbw.onrender.com'; // <-- THAY THẾ URL NÀY

// --- Helper Functions ---
const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

// --- Components ---
const Card = ({ children, className = '' }) => (
    <div className={`bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-4 sm:p-6 ${className}`}>
        {children}
    </div>
);
const TabButton = ({ children, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 font-medium rounded-md transition-colors flex items-center ${isActive ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
    >
        {children}
    </button>
);

// --- Main Dashboard Component ---
export default function ProDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiResults, setAiResults] = useState({ insights: '', experiments: [], campaigns: [], emails: [] });
    
    // --- STATE ĐỂ LƯU DỮ LIỆU THẬT TỪ BACKEND ---
    const [coupons, setCoupons] = useState([]);
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- KẾT NỐI VỚI BACKEND ĐỂ LẤY TOÀN BỘ DỮ LIỆU ---
    useEffect(() => {
        async function fetchData() {
            if (BACKEND_URL === 'https://your-project-name.onrender.com') {
                setError('Vui lòng cập nhật BACKEND_URL trong code frontend bằng URL Render của bạn.');
                setIsLoading(false);
                return;
            }
            try {
                // Sử dụng Promise.all để tải đồng thời 3 loại dữ liệu
                const [couponsRes, ordersRes, customersRes] = await Promise.all([
                    fetch(`${BACKEND_URL}/api/coupons`),
                    fetch(`${BACKEND_URL}/api/orders`),
                    fetch(`${BACKEND_URL}/api/customers`),
                ]);

                if (!couponsRes.ok || !ordersRes.ok || !customersRes.ok) {
                    throw new Error('Một hoặc nhiều API đã trả về lỗi.');
                }

                const couponsData = await couponsRes.json();
                const ordersData = await ordersRes.json();
                const customersData = await customersRes.json();

                setCoupons(couponsData);
                setOrders(ordersData);
                setCustomers(customersData);
                
            } catch (err) {
                console.error("Lỗi khi kết nối đến backend:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    // --- XỬ LÝ VÀ PHÂN TÍCH DỮ LIỆU THẬT ---
    const analysisData = useMemo(() => {
        if (isLoading || error) return { totalRevenue: 0, totalDiscount: 0, chartData: [], pieData: [], usageDetails: [], topCustomers: [], totalOrdersWithDiscount: 0 };

        const usageCount = {};
        const revenueByCoupon = {};
        let totalDiscount = 0;
        let totalRevenue = 0;
        const customerUsage = {};

        const ordersWithDiscount = orders.filter(o => o.discount_codes && o.discount_codes.length > 0 && o.financial_status === 'paid');
        
        ordersWithDiscount.forEach(order => {
            totalRevenue += order.total_price;
            totalDiscount += order.total_discounts;

            if (order.customer?.id) {
                customerUsage[order.customer.id] = (customerUsage[order.customer.id] || 0) + 1;
            }

            order.discount_codes.forEach(dc => {
                if (dc && dc.code) { // Kiểm tra dc và dc.code tồn tại
                    usageCount[dc.code] = (usageCount[dc.code] || 0) + 1;
                    revenueByCoupon[dc.code] = (revenueByCoupon[dc.code] || 0) + order.total_price;
                }
            });
        });

        const chartData = coupons.map(c => ({ name: c.code, 'Số lượt sử dụng': usageCount[c.code] || 0 }));
        const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];
        const pieData = Object.keys(revenueByCoupon).map((code, i) => ({ 
            name: code, 
            value: revenueByCoupon[code] || 0, 
            color: COLORS[i % COLORS.length] 
        })).filter(item => item.value > 0);
        
        const usageDetails = ordersWithDiscount.map(order => ({
            id: order.id,
            date: new Date(order.created_at_haravan).toLocaleDateString('vi-VN'),
            customerName: `${order.customer?.first_name || ''} ${order.customer?.last_name || 'Khách vãng lai'}`,
            couponCode: order.discount_codes[0]?.code || 'N/A',
            orderValue: order.total_price,
        })).sort((a, b) => new Date(b.date) - new Date(a.date));

        const topCustomers = Object.entries(customerUsage)
            .map(([customerId, count]) => {
                const customerInfo = customers.find(c => c.id == customerId);
                return {
                    id: customerId,
                    name: customerInfo ? `${customerInfo.first_name || ''} ${customerInfo.last_name || ''}`.trim() : 'Khách vãng lai',
                    usageCount: count
                }
            })
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 5);

        return { totalRevenue, totalDiscount, chartData, pieData, usageDetails, topCustomers, totalOrdersWithDiscount: ordersWithDiscount.length };
    }, [isLoading, error, coupons, orders, customers]);

    const handleAiAnalysis = () => { /* ... (Logic AI mô phỏng giữ nguyên) ... */ };

    // --- Các Component con ---
    const StatCard = ({ title, value, icon, color }) => (
        <Card>
            <div className="flex items-center">
                <div className={`p-3 rounded-full mr-4 ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                </div>
            </div>
        </Card>
    );

    const ActivePieChart = (props) => {
        const { data } = props;
        const [activeIndex, setActiveIndex] = useState(0);

        const onPieEnter = (_, index) => {
            setActiveIndex(index);
        };

        const renderActiveShape = (props) => {
            const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
            return (
                <g>
                    <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#fff" className="font-bold text-lg">{payload.name}</text>
                    <text x={cx} y={cy} dy={12} textAnchor="middle" fill={fill} className="text-sm">{`${formatCurrency(value)}`}</text>
                    <text x={cx} y={cy} dy={30} textAnchor="middle" fill="#9ca3af" className="text-xs">{`(Chiếm ${(percent * 100).toFixed(2)}%)`}</text>
                    <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
                    <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} fill={fill} />
                </g>
            );
        };

        return (
            <PieChart width={400} height={300}>
                <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                >
                    {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
            </PieChart>
        );
    };

    // --- Tab Components ---
    const OverviewTab = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="Tổng Doanh thu (có mã)" value={formatCurrency(analysisData.totalRevenue)} icon={<DollarSign size={24} />} color="bg-green-500/20 text-green-400" />
                 <StatCard title="Tổng Đơn có mã" value={analysisData.totalOrdersWithDiscount} icon={<ShoppingCart size={24} />} color="bg-blue-500/20 text-blue-400" />
                 <StatCard title="Tổng tiền đã giảm" value={formatCurrency(analysisData.totalDiscount)} icon={<Zap size={24} />} color="bg-red-500/20 text-red-400" />
                 <StatCard title="Tổng khách hàng" value={customers.length} icon={<Users size={24} />} color="bg-yellow-500/20 text-yellow-400" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                    <h3 className="font-bold text-lg mb-4 text-white">Số lượt sử dụng mã</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analysisData.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                            <XAxis dataKey="name" stroke="#a0aec0" />
                            <YAxis stroke="#a0aec0" />
                            <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }} />
                            <Legend />
                            <Bar dataKey="Số lượt sử dụng" fill="#06b6d4" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="lg:col-span-2">
                     <h3 className="font-bold text-lg mb-4 text-white">Tỷ trọng Doanh thu theo Mã</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <ActivePieChart data={analysisData.pieData} />
                     </ResponsiveContainer>
                </Card>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2">
                    <h3 className="font-bold text-lg mb-4 text-white">Chi tiết sử dụng</h3>
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-700/50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Ngày</th>
                                    <th scope="col" className="px-6 py-3">Khách hàng</th>
                                    <th scope="col" className="px-6 py-3">Mã</th>
                                    <th scope="col" className="px-6 py-3">Giá trị đơn</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analysisData.usageDetails.map(item => (
                                    <tr key={item.id} className="bg-gray-800/80 border-b border-gray-700 hover:bg-gray-700/80">
                                        <td className="px-6 py-4">{item.date}</td>
                                        <td className="px-6 py-4 font-medium text-white">{item.customerName}</td>
                                        <td className="px-6 py-4"><span className="font-mono bg-gray-700 px-2 py-1 rounded">{item.couponCode}</span></td>
                                        <td className="px-6 py-4">{formatCurrency(item.orderValue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
                <Card>
                    <h3 className="font-bold text-lg text-white flex items-center mb-4"><Award className="mr-2 text-yellow-400"/>Khách hàng thân thiết</h3>
                    <div className="space-y-4">
                        {analysisData.topCustomers.map((customer, index) => (
                            <div key={customer.id} className="flex items-center">
                                <span className={`text-xl font-bold mr-4 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : 'text-yellow-600'}`}>#{index + 1}</span>
                                <div>
                                    <p className="font-semibold text-white">{customer.name}</p>
                                    <p className="text-sm text-gray-400">{customer.usageCount} lượt dùng mã</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
    
    const CouponManagementTab = () => (
        <Card>
            <h3 className="font-bold text-lg text-white flex items-center mb-4"><Tag className="mr-2 text-green-400"/>Quản lý Mã giảm giá</h3>
            <div className="space-y-4">
                {coupons.map(coupon => (
                    <div key={coupon.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div className="mb-2 sm:mb-0">
                            <div className="flex items-center mb-1">
                                <span className="font-mono text-lg bg-gray-900/50 text-cyan-400 px-3 py-1 rounded">{coupon.code}</span>
                                <span className={`ml-3 text-xs font-bold px-2 py-0.5 rounded-full ${!coupon.ends_at || new Date(coupon.ends_at) > new Date() ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-300'}`}>
                                    {!coupon.ends_at || new Date(coupon.ends_at) > new Date() ? 'Đang hoạt động' : 'Hết hạn'}
                                </span>
                            </div>
                            <p className="text-gray-300 text-sm">
                                {`Giảm ${formatCurrency(coupon.value)} (${coupon.discount_type === 'fixed_amount' ? 'tiền mặt' : 'phần trăm'})`}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button className="text-sm bg-blue-600/80 hover:bg-blue-500 text-white font-semibold py-1 px-3 rounded-md">Sửa</button>
                            <button className="text-sm bg-red-600/80 hover:bg-red-500 text-white font-semibold py-1 px-3 rounded-md">Tắt</button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );

    const AiAutomationTab = () => (
        <div className="space-y-8">
            <Card>
                <h3 className="font-bold text-lg text-white flex items-center mb-2"><BrainCircuit className="mr-2 text-cyan-400"/>Trợ lý Phân tích AI</h3>
                <p className="text-gray-400 mb-4">Chạy phân tích để AI tự động đề xuất các thử nghiệm, chiến dịch và email marketing mới dựa trên dữ liệu gần đây.</p>
                <button onClick={handleAiAnalysis} disabled={isAiLoading} className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {isAiLoading ? <><Loader2 className="mr-2 animate-spin" /> Đang phân tích...</> : <><Wand2 className="mr-2" /> Chạy Phân tích & Tự động hóa</>}
                </button>
                {aiResults.insights && <p className="mt-4 text-cyan-200 bg-cyan-900/30 p-3 rounded-lg">{aiResults.insights}</p>}
            </Card>
        </div>
    );

    // --- Render chính ---
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen bg-gray-900 text-white"><Loader2 className="animate-spin mr-3"/> Đang tải dữ liệu từ server...</div>
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen bg-gray-900 text-red-400">
            <Card className="text-center">
                <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Lỗi Kết Nối</h2>
                <p className="text-gray-300">{error}</p>
                <p className="text-sm text-gray-500 mt-4">Vui lòng kiểm tra lại URL Backend và đảm bảo server Render đang hoạt động.</p>
            </Card>
        </div>
    }
    
    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Nền tảng Tự động hóa Marketing</h1>
                    <p className="text-gray-400">Phân tích, hoạch định và hành động với sự trợ giúp của AI.</p>
                </header>
                <div className="flex space-x-2 border-b border-gray-700 mb-6 overflow-x-auto pb-2">
                    <TabButton onClick={() => setActiveTab('overview')} isActive={activeTab === 'overview'}><ShoppingCart className="mr-2" size={16}/> Tổng quan</TabButton>
                    <TabButton onClick={() => setActiveTab('management')} isActive={activeTab === 'management'}><Tag className="mr-2" size={16}/> Quản lý Mã</TabButton>
                    <TabButton onClick={() => setActiveTab('automation')} isActive={activeTab === 'automation'}><BrainCircuit className="mr-2" size={16}/> Trợ lý AI & Tự động hóa</TabButton>
                </div>
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'management' && <CouponManagementTab />}
                {activeTab === 'automation' && <AiAutomationTab />}
            </div>
        </div>
    );
}
