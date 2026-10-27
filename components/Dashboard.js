function Dashboard({ currentUser, onLogout }) {
    const [showForm, setShowForm] = React.useState(false);
    const [showTransport, setShowTransport] = React.useState(false);
    const [bookings, setBookings] = React.useState([]);
    const [rooms, setRooms] = React.useState([]);
    const [transportRecords, setTransportRecords] = React.useState([]);
    const [cars, setCars] = React.useState([]);

    const loadBookings = async () => {
        const b = await store.getBookings();
        const r = await store.getRooms();
        const allCars = await store.getCars();
        const tr = await store.getTransportRecords();
        
        const centerRecords = tr.filter(record => {
            const rc = allCars.find(car => car.id === record.carId);
            return rc && rc.centerId === currentUser.centerId;
        });

        setBookings(b);
        setRooms(r.filter(room => room.centerId === currentUser.centerId));
        setTransportRecords(centerRecords);
        setCars(allCars);
    };

    React.useEffect(() => {
        loadBookings();
    }, []);

    const handleBookingSuccess = () => {
        setShowForm(false);
        loadBookings();
    };

    return (
        <div className="min-h-screen pb-12" data-name="dashboard" data-file="components/Dashboard.js">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-xl">
                        <i className="icon-calendar-days"></i>
                        نظام الحجوزات
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => window.location.reload()} className="text-gray-400 hover:text-[var(--primary)] transition-colors" title="تحديث الصفحة">
                            <i className="icon-rotate-cw text-xl"></i>
                        </button>
                        <span className="text-gray-600">مرحباً، {currentUser.name}</span>
                        <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="تسجيل الخروج">
                            <i className="icon-square-x text-xl"></i>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 mt-8">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">حجوزات الغرف</h1>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                            onClick={() => { setShowTransport(true); setShowForm(false); }} 
                            className={`btn ${showTransport ? 'bg-sky-100 text-sky-700' : 'btn-outline'} w-full sm:w-auto border-dashed`}
                        >
                            <i className="icon-car"></i>
                            استعلام عن حركة
                        </button>
                        {!showForm && (
                            <button onClick={() => { setShowForm(true); setShowTransport(false); }} className="btn btn-primary w-full sm:w-auto">
                                <i className="icon-plus"></i>
                                حجز قاعة
                            </button>
                        )}
                    </div>
                </div>

                {showForm && (
                    <div className="mb-8">
                        <BookingForm 
                            currentUser={currentUser}
                            onSuccess={handleBookingSuccess}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                )}

                {showTransport && (
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">الحركات المسجلة</h2>
                            <button onClick={() => setShowTransport(false)} className="text-gray-500 hover:text-red-500"><i className="icon-x"></i> إغلاق</button>
                        </div>
                        <TransportList records={transportRecords} cars={cars} />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <BookingList 
                            bookings={bookings} 
                            currentUser={currentUser}
                            onRefresh={loadBookings}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-700 mb-4">القاعات المتاحة في مركزك ({rooms.length})</h3>
                            {rooms.map(room => (
                                <div key={room.id} className="card p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                                        <i className={room.icon}></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">{room.name}</h4>
                                        <span className="text-xs text-gray-500">تتسع لـ {room.capacity} أشخاص</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}