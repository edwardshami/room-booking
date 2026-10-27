function BookingList({ bookings, currentUser, onRefresh }) {
    const [rooms, setRooms] = React.useState([]);

    React.useEffect(() => {
        const fetchRooms = async () => {
            const r = await store.getRooms();
            setRooms(r);
        };
        fetchRooms();
    }, []);

    const handleDelete = async (id) => {
        if (confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
            await store.deleteBooking(id);
            onRefresh();
        }
    };

    if (bookings.length === 0) {
        return (
            <div className="card text-center py-12" data-name="booking-list" data-file="components/BookingList.js">
                <div className="text-gray-400 mb-3">
                    <i className="icon-calendar text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900">لا توجد حجوزات</h3>
                <p className="text-gray-500 mt-1">ابدأ بحجز غرفة لنشاطك القادم</p>
            </div>
        );
    }

    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();

    const processedBookings = bookings.map(booking => {
        let isExpired = false;
        if (booking.date < today) {
            isExpired = true;
        } else if (booking.date === today && booking.selectedHours && booking.selectedHours.length > 0) {
            const maxHour = Math.max(...booking.selectedHours);
            if (maxHour < currentHour) {
                isExpired = true;
            }
        }
        return { ...booking, isExpired };
    });

    const activeBookings = processedBookings.filter(b => !b.isExpired);
    const expiredBookings = processedBookings.filter(b => b.isExpired);

    // Sort by room in employee dashboard
    if (currentUser?.role !== 'admin') {
        const sortByRoom = (a, b) => {
            const roomA = rooms.find(r => r.id === a.roomId)?.name || '';
            const roomB = rooms.find(r => r.id === b.roomId)?.name || '';
            return roomA.localeCompare(roomB, 'ar');
        };
        activeBookings.sort(sortByRoom);
        expiredBookings.sort(sortByRoom);
    }

    const renderBooking = (booking) => {
        const room = rooms.find(r => r.id === booking.roomId);
        const isOwner = booking.employeeName === currentUser.name || currentUser?.role === 'admin';

        return (
            <div key={booking.id} className={`card transition-shadow ${booking.isExpired ? 'bg-gray-50 opacity-75' : 'hover:shadow-md'}`}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className={`font-bold text-lg ${booking.isExpired ? 'text-gray-500' : ''}`}>{room?.name || 'غرفة محذوفة'}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${booking.isExpired ? 'bg-gray-200 text-gray-600' : 'bg-sky-100 text-sky-700'}`}>
                                {booking.date}
                            </span>
                            {booking.isExpired && (
                                <span className="px-2 py-1 bg-gray-200 text-gray-500 text-xs rounded-full font-medium">
                                    منتهية
                                </span>
                            )}
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                                <i className="icon-clock text-gray-400"></i>
                                {booking.selectedHours && booking.selectedHours.length > 0 ? 
                                    `الساعات: ${[...booking.selectedHours].sort((a,b)=>a-b).map(h => h.toString().padStart(2,'0') + ':00').join('، ')}`
                                    : `${booking.startTime} - ${booking.endTime}`
                                }
                            </p>
                            <p className="flex items-center gap-2">
                                <i className="icon-user text-gray-400"></i>
                                بواسطة: {booking.employeeName}
                            </p>
                            <p className="flex items-center gap-2">
                                <i className="icon-file-text text-gray-400"></i>
                                {booking.purpose}
                            </p>
                        </div>
                    </div>

                    {isOwner && (
                        <button 
                            onClick={() => handleDelete(booking.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors self-end sm:self-auto"
                            title="حذف الحجز"
                        >
                            <i className="icon-trash"></i>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div data-name="booking-list" data-file="components/BookingList.js">
            {activeBookings.length > 0 ? (
                <div className="space-y-4 mb-8">
                    {activeBookings.map(renderBooking)}
                </div>
            ) : (
                <div className="card text-center py-8 mb-8 border-dashed">
                    <p className="text-gray-500">لا توجد حجوزات قادمة</p>
                </div>
            )}

            {expiredBookings.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-gray-500 mb-4 flex items-center gap-2 border-t pt-6">
                        <i className="icon-history"></i>
                        الحجوزات المنتهية
                    </h3>
                    <div className="space-y-4">
                        {expiredBookings.map(renderBooking)}
                    </div>
                </div>
            )}
        </div>
    );
}
