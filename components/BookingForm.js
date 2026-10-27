function BookingForm({ currentUser, onSuccess, onCancel }) {
    const [rooms, setRooms] = React.useState([]);
    const [bookings, setBookings] = React.useState([]);
    
    const [formData, setFormData] = React.useState({
        roomId: '',
        date: new Date().toISOString().split('T')[0],
        selectedHours: [],
        purpose: ''
    });

    React.useEffect(() => {
        const loadData = async () => {
            const r = await store.getRooms();
            const filteredRooms = r.filter(room => room.centerId === currentUser.centerId);
            setRooms(filteredRooms);
            if(filteredRooms.length > 0) {
                setFormData(prev => ({ ...prev, roomId: filteredRooms[0].id }));
            }
            const b = await store.getBookings();
            setBookings(b);
        };
        loadData();
    }, [currentUser.centerId]);
    
    // Generate timeline hours 9 AM to 4 PM (16:00)
    const hours = Array.from({length: 8}, (_, i) => i + 9);

    const getDayBookings = () => {
        return bookings.filter(b => b.date === formData.date && b.roomId === formData.roomId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.roomId) {
            alert('لا توجد قاعات متاحة في مركزك.');
            return;
        }
        if (formData.selectedHours.length === 0) {
            alert('الرجاء اختيار ساعة واحدة على الأقل للحجز.');
            return;
        }
        try {
            const sortedHours = [...formData.selectedHours].sort((a,b) => a-b);
            const startTime = sortedHours[0].toString().padStart(2, '0') + ':00';
            const endTime = (sortedHours[sortedHours.length - 1] + 1).toString().padStart(2, '0') + ':00';

            await store.addBooking({
                ...formData,
                startTime,
                endTime,
                employeeName: currentUser.name,
                centerId: currentUser.centerId
            });
            onSuccess();
        } catch (error) {
            console.error('Error saving booking:', error);
            alert('حدث خطأ أثناء الحجز');
        }
    };

    const dayBookings = getDayBookings();

    return (
        <div className="card" data-name="booking-form" data-file="components/BookingForm.js">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">حجز غرفة جديدة</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الغرفة</label>
                    {rooms.length > 0 ? (
                        <select
                            className="input-field"
                            value={formData.roomId}
                            onChange={(e) => setFormData({...formData, roomId: e.target.value, selectedHours: []})}
                        >
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>{room.name}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="text-red-500 text-sm">لا يوجد قاعات مضافة في مركزك بعد.</div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                    <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="input-field"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value, selectedHours: []})}
                    />
                </div>

                {/* Timeline display */}
                {formData.roomId && formData.date && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">اختر الساعات المطلوبة:</h3>
                        <div className="flex flex-wrap gap-2">
                            {hours.map(hour => {
                                const hStr = hour.toString().padStart(2, '0') + ':00';
                                
                                const booking = dayBookings.find(b => {
                                    if (b.selectedHours) return b.selectedHours.includes(hour);
                                    const bStart = parseInt(b.startTime.split(':')[0]);
                                    const bEnd = parseInt(b.endTime.split(':')[0]);
                                    return hour >= bStart && hour < bEnd;
                                });
                                
                                const isSelected = formData.selectedHours.includes(hour);
                                
                                const today = new Date().toISOString().split('T')[0];
                                const currentHour = new Date().getHours();
                                const isPastHour = formData.date === today && hour <= currentHour;
                                const isPastDate = formData.date < today;
                                const isExpired = isPastDate || isPastHour;

                                let btnClass = "";
                                let tooltip = "";
                                let isDisabled = false;
                                
                                if (isExpired) {
                                    isDisabled = true;
                                    btnClass = "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";
                                    tooltip = "الوقت منتهي";
                                } else if (booking) {
                                    isDisabled = true;
                                    if (booking.employeeName === currentUser.name) {
                                        btnClass = "bg-[var(--primary)] opacity-60 text-white border-transparent cursor-not-allowed";
                                        tooltip = `محجوز مسبقاً بواسطتك (${booking.purpose})`;
                                    } else {
                                        btnClass = "bg-amber-500 opacity-60 text-white border-transparent cursor-not-allowed";
                                        tooltip = `محجوز بواسطة ${booking.employeeName} (${booking.purpose})`;
                                    }
                                } else if (isSelected) {
                                    btnClass = "bg-emerald-500 text-white border-emerald-600 shadow-sm transform scale-105 ring-2 ring-emerald-200";
                                    tooltip = "محدد للحجز";
                                } else {
                                    btnClass = "bg-white border-gray-300 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 transition-colors";
                                    tooltip = "متاح - اضغط للاختيار";
                                }

                                return (
                                    <button 
                                        key={hour} 
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => {
                                            if (isSelected) {
                                                setFormData(prev => ({...prev, selectedHours: prev.selectedHours.filter(h => h !== hour)}));
                                            } else {
                                                setFormData(prev => ({...prev, selectedHours: [...prev.selectedHours, hour]}));
                                            }
                                        }}
                                        className={`px-3 py-2 text-sm font-medium border rounded-lg transition-all ${btnClass}`}
                                        title={tooltip}
                                    >
                                        {hStr}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-white border border-gray-300"></span> متاح</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> التحديد الحالي</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[var(--primary)] opacity-60"></span> محجوز لك مسبقاً</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 opacity-60"></span> محجوز لغيرك</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200"></span> وقت منتهي</span>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">النشاط / السبب</label>
                    <textarea
                        required
                        className="input-field min-h-[100px]"
                        placeholder="تفاصيل النشاط..."
                        value={formData.purpose}
                        onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                    ></textarea>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                    <button type="submit" className="btn btn-primary flex-1" disabled={!formData.roomId}>
                        تأكيد الحجز
                    </button>
                    <button type="button" onClick={onCancel} className="btn btn-outline">
                        إلغاء
                    </button>
                </div>
            </form>
        </div>
    );
}