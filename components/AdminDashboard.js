function AdminDashboard({ onLogout, currentUser }) {
    const [activeTab, setActiveTab] = React.useState('bookings'); // 'bookings' | 'employees' | 'rooms' | 'centers' | 'cars'
    const [employees, setEmployees] = React.useState([]);
    const [bookings, setBookings] = React.useState([]);
    const [centers, setCenters] = React.useState([]);
    const [rooms, setRooms] = React.useState([]);
    const [cars, setCars] = React.useState([]);
    const [transportRecords, setTransportRecords] = React.useState([]);
    const [filterDate, setFilterDate] = React.useState('');
    
    // Form States
    const [newName, setNewName] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [newRole, setNewRole] = React.useState('employee');
    const [newEmpCenter, setNewEmpCenter] = React.useState('');
    const [error, setError] = React.useState('');

    const [newCenterName, setNewCenterName] = React.useState('');
    
    const [newRoomName, setNewRoomName] = React.useState('');
    const [newRoomCapacity, setNewRoomCapacity] = React.useState('');
    const [newRoomCenter, setNewRoomCenter] = React.useState('');

    const [newCarType, setNewCarType] = React.useState('');
    const [newCarPlate, setNewCarPlate] = React.useState('');
    const [newCarCapacity, setNewCarCapacity] = React.useState('');
    const [newCarCenter, setNewCarCenter] = React.useState('');

    const hasAdmin = employees.some(emp => emp.role === 'admin');

    const loadData = async () => {
        const emps = await store.getEmployees();
        const b = await store.getBookings();
        const c = await store.getCenters();
        const r = await store.getRooms();
        const crs = await store.getCars();
        const tr = await store.getTransportRecords();
        
        setEmployees(emps);
        setBookings(b);
        setCenters(c);
        setRooms(r);
        setCars(crs);
        setTransportRecords(tr);
    };

    React.useEffect(() => {
        loadData();
    }, []);

    React.useEffect(() => {
        if (centers.length > 0 && !newEmpCenter) setNewEmpCenter(centers[0].id);
        if (centers.length > 0 && !newRoomCenter) setNewRoomCenter(centers[0].id);
        if (centers.length > 0 && !newCarCenter) setNewCarCenter(centers[0].id);
    }, [centers]);

    React.useEffect(() => {
        if (!hasAdmin && newRole !== 'admin') {
            setNewRole('admin');
        }
    }, [hasAdmin, newRole]);

    // --- Employee Handlers ---
    const handleAddEmployee = async (e) => {
        e.preventDefault();
        if (!newName.trim() || !newPassword.trim()) {
            setError('الرجاء إدخال الاسم وكلمة المرور');
            return;
        }
        if ((newRole === 'employee' || newRole === 'transport_manager') && !newEmpCenter) {
            setError('الرجاء اختيار المركز');
            return;
        }
        try {
            await store.addEmployee(newName.trim(), newPassword.trim(), newRole, newRole === 'admin' ? null : newEmpCenter);
            setNewName('');
            setNewPassword('');
            setNewRole(hasAdmin ? 'employee' : 'admin');
            setError('');
            await loadData();
        } catch (err) {
            setError(err.message);
        }
    };
    const handleRequirePasswordChange = async (id, currentName) => {
        if (confirm(`هل تريد إجبار الموظف (${currentName}) على تغيير كلمة المرور عند تسجيل الدخول القادم؟`)) {
            await store.requirePasswordChange(id);
            await loadData();
        }
    };
    const handleResetPassword = async (id, currentName) => {
        const newPass = prompt(`أدخل كلمة المرور الجديدة للموظف (${currentName}):`);
        if (newPass && newPass.trim() !== '') {
            await store.resetPassword(id, newPass.trim());
            await loadData();
        }
    };
    const handleEditEmpName = async (id, currentName) => {
        const nName = prompt(`تعديل اسم الموظف (${currentName}):`, currentName);
        if (nName && nName.trim() !== '' && nName !== currentName) {
            await store.updateEmployeeName(id, nName.trim());
            await loadData();
        }
    };
    const handleDeleteEmployee = async (id) => {
        if (confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
            await store.deleteEmployee(id);
            await loadData();
        }
    };

    // --- Center Handlers ---
    const handleAddCenter = async (e) => {
        e.preventDefault();
        if(newCenterName.trim()) {
            await store.addCenter(newCenterName.trim());
            setNewCenterName('');
            await loadData();
        }
    };
    const handleDeleteCenter = async (id) => {
        if(confirm('سيتم حذف المركز وجميع القاعات التابعة له. هل أنت متأكد؟')) {
            await store.deleteCenter(id);
            await loadData();
        }
    };

    // --- Room Handlers ---
    const handleAddRoom = async (e) => {
        e.preventDefault();
        if(newRoomName.trim() && newRoomCenter) {
            await store.addRoom(newRoomName.trim(), parseInt(newRoomCapacity) || 10, newRoomCenter);
            setNewRoomName('');
            setNewRoomCapacity('');
            await loadData();
        }
    };
    const handleEditRoomName = async (id, currentName) => {
        const nName = prompt('تعديل اسم القاعة:', currentName);
        if(nName && nName.trim() !== '') {
            await store.updateRoom(id, nName.trim(), null);
            await loadData();
        }
    };
    const handleDeleteRoom = async (id) => {
        if(confirm('هل أنت متأكد من حذف القاعة؟')) {
            await store.deleteRoom(id);
            await loadData();
        }
    };

    // --- Car Handlers ---
    const handleAddCar = async (e) => {
        e.preventDefault();
        if(newCarType.trim() && newCarPlate.trim() && newCarCenter) {
            await store.addCar(newCarType.trim(), newCarPlate.trim(), newCarCapacity, newCarCenter);
            setNewCarType('');
            setNewCarPlate('');
            setNewCarCapacity('');
            await loadData();
        }
    };
    const handleDeleteCar = async (id) => {
        if(confirm('هل أنت متأكد من حذف السيارة؟')) {
            await store.deleteCar(id);
            await loadData();
        }
    };

    return (
        <div className="min-h-screen pb-12" data-name="admin-dashboard" data-file="components/AdminDashboard.js">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-600 font-bold text-xl">
                        <i className="icon-shield-check"></i>
                        لوحة الإدارة - نظام الحجوزات
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
                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto whitespace-nowrap pb-1">
                    <button 
                        className={`pb-3 px-4 font-bold text-lg flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'bookings' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        <i className="icon-calendar-days"></i>
                        إدارة الحجوزات
                    </button>
                    <button 
                        className={`pb-3 px-4 font-bold text-lg flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'employees' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('employees')}
                    >
                        <i className="icon-users"></i>
                        الموظفين
                    </button>
                    <button 
                        className={`pb-3 px-4 font-bold text-lg flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'rooms' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('rooms')}
                    >
                        <i className="icon-door-open"></i>
                        القاعات
                    </button>
                    <button 
                        className={`pb-3 px-4 font-bold text-lg flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'centers' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('centers')}
                    >
                        <i className="icon-building-2"></i>
                        المراكز
                    </button>
                    <button 
                        className={`pb-3 px-4 font-bold text-lg flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'cars' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('cars')}
                    >
                        <i className="icon-car"></i>
                        السيارات (الحركة)
                    </button>
                </div>

                {activeTab === 'bookings' && (
                    <div className="card">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <i className="icon-calendar-days text-[var(--primary)]"></i>
                                الحجوزات حسب التاريخ
                            </h2>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <label className="text-sm text-gray-600 font-medium">اختر التاريخ:</label>
                                <input 
                                    type="date" 
                                    className="input-field !w-auto"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        {!filterDate ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                                <div className="text-gray-400 mb-3">
                                    <i className="icon-calendar-search text-4xl"></i>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">يرجى تحديد التاريخ</h3>
                                <p className="text-gray-500 mt-1">اختر تاريخاً من الأعلى لعرض الحجوزات الخاصة به</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">حجوزات القاعات</h3>
                                    <BookingList 
                                        bookings={bookings.filter(b => b.date === filterDate)} 
                                        currentUser={currentUser} 
                                        onRefresh={loadData} 
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">حركة السيارات</h3>
                                    <TransportList 
                                        records={transportRecords.filter(r => r.date === filterDate)} 
                                        cars={cars} 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'employees' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <div className="card">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <i className="icon-user-plus text-[var(--primary)]"></i>
                                    {!hasAdmin ? 'إنشاء مدير أول' : 'إضافة حساب جديد'}
                                </h2>
                                <form onSubmit={handleAddEmployee} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم الموظف</label>
                                        <input type="text" className="input-field" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="مثال: أحمد محمد" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور المبدئية</label>
                                        <input type="text" className="input-field" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="أدخل كلمة المرور" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">صلاحية الحساب</label>
                                        <select className="input-field" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                                            <option value="employee">موظف عادي (لحجز القاعات)</option>
                                            <option value="transport_manager">مسؤول حركة</option>
                                            <option value="admin">مدير نظام</option>
                                        </select>
                                    </div>
                                    {(newRole === 'employee' || newRole === 'transport_manager') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">المركز</label>
                                            <select className="input-field" value={newEmpCenter} onChange={(e) => setNewEmpCenter(e.target.value)}>
                                                {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                    {error && <div className="text-red-500 text-sm">{error}</div>}
                                    <button type="submit" className="btn btn-primary w-full">
                                        {!hasAdmin ? 'إنشاء المدير الأول' : 'إضافة الحساب'}
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="card">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <i className="icon-users text-[var(--primary)]"></i>
                                    إدارة الحسابات ({employees.length})
                                </h2>
                                <div className="divide-y border rounded-lg overflow-hidden">
                                    {employees.map(emp => {
                                        const cName = centers.find(c => c.id === emp.centerId)?.name || 'بدون مركز';
                                        return (
                                        <div key={emp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${emp.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'}`}>
                                                    <i className={emp.role === 'admin' ? 'icon-shield' : 'icon-user'}></i>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                        {emp.name}
                                                        <button onClick={() => handleEditEmpName(emp.id, emp.name)} className="text-gray-400 hover:text-sky-600"><i className="icon-pencil text-sm"></i></button>
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {emp.role === 'admin' && <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full">مدير</span>}
                                                        {emp.role === 'transport_manager' && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">مسؤول حركة</span>}
                                                        {emp.role === 'employee' && <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full">موظف</span>}
                                                        {emp.centerId && <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{cName}</span>}
                                                        {emp.mustChangePassword && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full"><i className="icon-shield-alert text-[10px]"></i> يلزم تغيير كلمة المرور</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {!emp.mustChangePassword && (
                                                    <button onClick={() => handleRequirePasswordChange(emp.id, emp.name)} className="btn btn-outline py-1 px-3 text-sm border-amber-200 text-amber-700" title="إجبار على تغيير كلمة المرور">
                                                        <i className="icon-shield-alert"></i>
                                                    </button>
                                                )}
                                                <button onClick={() => handleResetPassword(emp.id, emp.name)} className="btn btn-outline py-1 px-3 text-sm" title="تغيير كلمة المرور">
                                                    <i className="icon-key"></i>
                                                </button>
                                                <button onClick={() => handleDeleteEmployee(emp.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="حذف الحساب">
                                                    <i className="icon-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'rooms' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <div className="card">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <i className="icon-plus text-[var(--primary)]"></i> إضافة قاعة
                                </h2>
                                <form onSubmit={handleAddRoom} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">المركز</label>
                                        <select className="input-field" value={newRoomCenter} onChange={e => setNewRoomCenter(e.target.value)}>
                                            {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">اسم القاعة</label>
                                        <input type="text" className="input-field" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">السعة (أشخاص)</label>
                                        <input type="number" className="input-field" value={newRoomCapacity} onChange={e => setNewRoomCapacity(e.target.value)} />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-full">إضافة القاعة</button>
                                </form>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="card">
                                <h2 className="text-lg font-bold mb-4">القاعات الحالية</h2>
                                <div className="space-y-3">
                                    {rooms.map(room => {
                                        const cName = centers.find(c => c.id === room.centerId)?.name || 'غير معروف';
                                        return (
                                        <div key={room.id} className="p-4 border rounded-lg flex justify-between items-center bg-gray-50">
                                            <div>
                                                <h3 className="font-bold flex items-center gap-2">
                                                    {room.name}
                                                    <span className="text-xs font-normal bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">{cName}</span>
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">السعة: {room.capacity} شخص</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEditRoomName(room.id, room.name)} className="btn btn-outline py-1 px-3 text-sm"><i className="icon-pencil"></i></button>
                                                <button onClick={() => handleDeleteRoom(room.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><i className="icon-trash"></i></button>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'centers' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <div className="card">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <i className="icon-plus text-[var(--primary)]"></i> إضافة مركز
                                </h2>
                                <form onSubmit={handleAddCenter} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">اسم المركز</label>
                                        <input type="text" className="input-field" value={newCenterName} onChange={e => setNewCenterName(e.target.value)} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-full">إضافة المركز</button>
                                </form>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="card">
                                <h2 className="text-lg font-bold mb-4">المراكز الحالية</h2>
                                <div className="space-y-3">
                                    {centers.map(center => (
                                        <div key={center.id} className="p-4 border rounded-lg flex justify-between items-center bg-gray-50">
                                            <h3 className="font-bold">{center.name}</h3>
                                            <button onClick={() => handleDeleteCenter(center.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><i className="icon-trash"></i></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'cars' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <div className="card">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <i className="icon-plus text-[var(--primary)]"></i> إضافة سيارة
                                </h2>
                                <form onSubmit={handleAddCar} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">المركز</label>
                                        <select className="input-field" value={newCarCenter} onChange={e => setNewCarCenter(e.target.value)}>
                                            {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">نوع السيارة</label>
                                        <input type="text" className="input-field" value={newCarType} onChange={e => setNewCarType(e.target.value)} required placeholder="مثال: فان تويوتا" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">رقم السيارة</label>
                                        <input type="text" className="input-field" value={newCarPlate} onChange={e => setNewCarPlate(e.target.value)} required placeholder="مثال: 123456" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">السعة (أشخاص)</label>
                                        <input type="number" className="input-field" value={newCarCapacity} onChange={e => setNewCarCapacity(e.target.value)} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-full">إضافة السيارة</button>
                                </form>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="card">
                                <h2 className="text-lg font-bold mb-4">السيارات المعرفة</h2>
                                <div className="space-y-3">
                                    {cars.map(car => {
                                        const cName = centers.find(c => c.id === car.centerId)?.name || 'غير معروف';
                                        return (
                                        <div key={car.id} className="p-4 border rounded-lg flex justify-between items-center bg-gray-50">
                                            <div>
                                                <h3 className="font-bold flex items-center gap-2">
                                                    {car.type}
                                                    <span className="text-xs font-normal bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">{cName}</span>
                                                </h3>
                                                <p className="text-xs text-gray-600 mt-1">الرقم: {car.plateNumber} | السعة: {car.capacity} أشخاص</p>
                                            </div>
                                            <button onClick={() => handleDeleteCar(car.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><i className="icon-trash"></i></button>
                                        </div>
                                    )})}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
