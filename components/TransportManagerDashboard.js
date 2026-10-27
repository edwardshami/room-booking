function TransportManagerDashboard({ currentUser, onLogout }) {
    const [cars, setCars] = React.useState([]);
    const [records, setRecords] = React.useState([]);
    const [showForm, setShowForm] = React.useState(false);
    const [filterDate, setFilterDate] = React.useState(new Date().toISOString().split('T')[0]);
    
    const [formData, setFormData] = React.useState({
        date: new Date().toISOString().split('T')[0],
        carId: '',
        driver: '',
        destination: '',
        departureTime: ''
    });

    const loadData = async () => {
        const allCars = await store.getCars();
        const centerCars = allCars.filter(car => car.centerId === currentUser.centerId);
        
        const allRecords = await store.getTransportRecords();
        const centerRecords = allRecords.filter(record => {
            const rc = allCars.find(c => c.id === record.carId);
            return rc && rc.centerId === currentUser.centerId;
        });

        setCars(centerCars);
        setRecords(centerRecords);
        if (centerCars.length > 0 && !formData.carId) {
            setFormData(prev => ({...prev, carId: centerCars[0].id}));
        }
    };
    
    const handleMarkCompleted = async (id) => {
        if(confirm('هل تريد تحديد هذه الحركة كمنتهية؟')) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            await store.markTransportRecordCompleted(id, timeString);
            await loadData();
        }
    };

    React.useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.carId) {
            alert('الرجاء إضافة سيارات في لوحة الإدارة أولاً.');
            return;
        }
        try {
            await store.addTransportRecord(formData);
            setShowForm(false);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                carId: cars.length > 0 ? cars[0].id : '',
                driver: '',
                destination: '',
                departureTime: ''
            });
            await loadData();
        } catch (error) {
            alert('حدث خطأ أثناء الحفظ');
        }
    };

    const handleDelete = async (id) => {
        if(confirm('هل أنت متأكد من حذف هذه الحركة؟')) {
            await store.deleteTransportRecord(id);
            await loadData();
        }
    };

    const filteredRecords = records.filter(r => r.date === filterDate);

    return (
        <div className="min-h-screen pb-12" data-name="transport-dashboard" data-file="components/TransportManagerDashboard.js">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-xl">
                        <i className="icon-car"></i>
                        نظام إدارة الحركة
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 font-medium">مرحباً، {currentUser.name}</span>
                        <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="تسجيل الخروج">
                            <i className="icon-square-x text-xl"></i>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 mt-8">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">سجل الحركة والسيارات</h1>
                    {!showForm && (
                        <button onClick={() => setShowForm(true)} className="btn btn-primary w-full sm:w-auto">
                            <i className="icon-plus"></i>
                            إضافة حركة جديدة
                        </button>
                    )}
                </div>

                {showForm && (
                    <div className="card mb-8">
                        <h2 className="text-xl font-bold mb-6 border-b pb-4">إضافة حركة سيارة</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                                    <input type="date" required min={new Date().toISOString().split('T')[0]} className="input-field" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">وقت الانطلاق</label>
                                    <input type="time" required className="input-field" value={formData.departureTime} onChange={(e) => setFormData({...formData, departureTime: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">السيارة</label>
                                    <select className="input-field" required value={formData.carId} onChange={(e) => setFormData({...formData, carId: e.target.value})}>
                                        {cars.length === 0 && <option value="">لا توجد سيارات</option>}
                                        {cars.map(c => <option key={c.id} value={c.id}>{c.type} - {c.plateNumber} (سعة {c.capacity})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم السائق</label>
                                    <input type="text" required className="input-field" placeholder="اسم السائق..." value={formData.driver} onChange={(e) => setFormData({...formData, driver: e.target.value})} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الوجهة</label>
                                    <input type="text" required className="input-field" placeholder="مكان التوجه..." value={formData.destination} onChange={(e) => setFormData({...formData, destination: e.target.value})} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t">
                                <button type="submit" className="btn btn-primary flex-1">حفظ الحركة</button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">إلغاء</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="card">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <i className="icon-calendar text-[var(--primary)]"></i>
                            الحركات حسب التاريخ
                        </h2>
                        <input type="date" className="input-field !w-auto" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                    </div>

                    {filteredRecords.length > 0 ? (
                        <div className="space-y-4">
                            {filteredRecords.map(record => {
                                const car = cars.find(c => c.id === record.carId);
                                const isExpired = record.date < new Date().toISOString().split('T')[0] || record.isCompleted;
                                return (
                                    <div key={record.id} className={`p-4 border rounded-lg flex flex-col sm:flex-row justify-between gap-4 ${isExpired ? 'bg-gray-100 opacity-75' : 'bg-gray-50'}`}>
                                        <div>
                                            <h3 className={`font-bold text-lg ${isExpired ? 'text-gray-500' : 'text-[var(--primary)]'}`}>
                                                الوجهة: {record.destination} 
                                                {record.isCompleted && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full mr-2 font-normal">منتهية ({record.completionTime})</span>}
                                                {(isExpired && !record.isCompleted) && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full mr-2 font-normal">منتهية</span>}
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600 mt-2">
                                                <p><i className="icon-clock w-4 inline-block"></i> الانطلاق: {record.departureTime}</p>
                                                <p><i className="icon-user w-4 inline-block"></i> السائق: {record.driver}</p>
                                                <p><i className="icon-car w-4 inline-block"></i> السيارة: {car ? `${car.type} (${car.plateNumber})` : 'محذوفة'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 self-start">
                                            {!isExpired && (
                                                <button onClick={() => handleMarkCompleted(record.id)} className="btn btn-outline py-1 px-3 text-sm text-emerald-600 border-emerald-200 hover:bg-emerald-50" title="تحديد كمنتهية">
                                                    <i className="icon-check"></i>
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(record.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="حذف">
                                                <i className="icon-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">لا توجد حركات مسجلة لهذا اليوم.</div>
                    )}
                </div>
            </main>
        </div>
    );
}