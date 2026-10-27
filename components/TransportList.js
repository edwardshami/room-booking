function TransportList({ records, cars }) {
    if (!records || records.length === 0) {
        return (
            <div className="card text-center py-12 border-dashed" data-name="transport-list" data-file="components/TransportList.js">
                <div className="text-gray-400 mb-3">
                    <i className="icon-car text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900">لا توجد حركات</h3>
                <p className="text-gray-500 mt-1">لا توجد حركات سيارات مسجلة للفترة الحالية</p>
            </div>
        );
    }

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-4" data-name="transport-list" data-file="components/TransportList.js">
            {records.map(record => {
                const car = cars.find(c => c.id === record.carId);
                const isExpired = record.date < today || record.isCompleted;
                
                return (
                    <div key={record.id} className={`card transition-shadow ${isExpired ? 'bg-gray-50 opacity-75' : 'hover:shadow-md'}`}>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className={`font-bold text-lg ${isExpired ? 'text-gray-500' : 'text-[var(--primary)]'}`}>
                                        الوجهة: {record.destination}
                                    </h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${isExpired ? 'bg-gray-200 text-gray-600' : 'bg-sky-100 text-sky-700'}`}>
                                        {record.date}
                                    </span>
                                    {record.isCompleted && (
                                        <span className="px-2 py-1 bg-gray-200 text-gray-500 text-xs rounded-full font-medium">
                                            منتهية ({record.completionTime})
                                        </span>
                                    )}
                                    {(isExpired && !record.isCompleted) && (
                                        <span className="px-2 py-1 bg-gray-200 text-gray-500 text-xs rounded-full font-medium">
                                            منتهية
                                        </span>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600 mt-3">
                                    <p className="flex items-center gap-2">
                                        <i className="icon-clock text-gray-400 w-4"></i>
                                        الانطلاق: {record.departureTime}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <i className="icon-user text-gray-400 w-4"></i>
                                        السائق: {record.driver}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <i className="icon-car text-gray-400 w-4"></i>
                                        السيارة: {car ? `${car.type} (${car.plateNumber})` : 'سيارة محذوفة'}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <i className="icon-users text-gray-400 w-4"></i>
                                        السعة: {car ? `${car.capacity} أشخاص` : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
