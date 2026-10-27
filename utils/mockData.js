import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAYxD7K0XghIvnLzq1DEFhgqJbQWDNMvxg",
  authDomain: "room-booking-aa336.firebaseapp.com",
  projectId: "room-booking-aa336",
  storageBucket: "room-booking-aa336.firebasestorage.app",
  messagingSenderId: "118871746547",
  appId: "1:118871746547:web:54d03b450c321a24995486",
  measurementId: "G-H3LQTSG6VW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function hashPassword(password) {
    const value = String(password ?? '');
    if (!value) return '';

    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    return Array.from(new Uint8Array(hashBuffer))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

class Store {
    constructor() {
        this.init();
    }

    async init() {
        try {
            await this.checkAndCleanupBookings();
        } catch (e) {
            console.error('Initialization error:', e);
        }
    }

    async _getCollection(tableName) {
        const querySnapshot = await getDocs(collection(db, tableName));
        const items = [];
        querySnapshot.forEach((docSnap) => {
            items.push({
                ...docSnap.data(),
                id: docSnap.id
            });
        });
        return items;
    }

    async checkAndCleanupBookings() {
        try {
            const now = new Date();
            let lastThursday20 = new Date(now);
            const dayOfWeek = now.getDay();
            let daysSinceThursday = dayOfWeek - 4;
            if (daysSinceThursday < 0) daysSinceThursday += 7;
            lastThursday20.setDate(now.getDate() - daysSinceThursday);
            lastThursday20.setHours(20, 0, 0, 0);
            if (dayOfWeek === 4 && now.getHours() < 20) {
                lastThursday20.setDate(lastThursday20.getDate() - 7);
            }

            const settings = await this._getCollection('booking_settings');
            let lastCleanup = settings.length > 0 && settings[0].lastCleanupDate ? new Date(settings[0].lastCleanupDate) : null;

            if (!lastCleanup || lastCleanup < lastThursday20) {
                await this.deleteExpiredBookings();
                await this.deleteExpiredTransportRecords();

                if (settings.length > 0) {
                    const settingRef = doc(db, 'booking_settings', settings[0].id);
                    await updateDoc(settingRef, { lastCleanupDate: now.toISOString() });
                } else {
                    await addDoc(collection(db, 'booking_settings'), { lastCleanupDate: now.toISOString() });
                }
            }
        } catch (e) {
            console.error('Cleanup error:', e);
        }
    }

    async deleteExpiredTransportRecords() {
        const records = await this.getTransportRecords();
        const today = new Date().toISOString().split('T')[0];
        for (const r of records) {
            if (r.date < today || r.isCompleted) {
                await this.deleteTransportRecord(r.id);
            }
        }
    }

    async deleteExpiredBookings() {
        const bookings = await this.getBookings();
        const today = new Date().toISOString().split('T')[0];
        const currentHour = new Date().getHours();
        for (const b of bookings) {
            let isExpired = false;
            if (b.date < today) {
                isExpired = true;
            } else if (b.date === today && b.selectedHours && b.selectedHours.length > 0) {
                const maxHour = Math.max(...b.selectedHours);
                if (maxHour < currentHour) {
                    isExpired = true;
                }
            }
            if (isExpired) {
                await this.deleteBooking(b.id);
            }
        }
    }

    async getCenters() {
        return await this._getCollection('booking_center');
    }

    async addCenter(name) {
        const docRef = await addDoc(collection(db, 'booking_center'), { name });
        return { id: docRef.id, name };
    }

    async deleteCenter(id) {
        await deleteDoc(doc(db, 'booking_center', id));
        const rooms = await this.getRooms();
        for (const r of rooms.filter(room => room.centerId === id)) {
            await this.deleteRoom(r.id);
        }
        const cars = await this.getCars();
        for (const c of cars.filter(car => car.centerId === id)) {
            await this.deleteCar(c.id);
        }
    }

    async getRooms() {
        return await this._getCollection('booking_room');
    }

    async addRoom(name, capacity, centerId) {
        const roomData = { name, capacity: Number(capacity), centerId };
        const docRef = await addDoc(collection(db, 'booking_room'), roomData);
        return { id: docRef.id, ...roomData };
    }

    async updateRoom(id, name, capacity) {
        const roomRef = doc(db, 'booking_room', id);
        const roomSnap = await getDoc(roomRef);
        if (roomSnap.exists()) {
            const newData = { ...roomSnap.data() };
            if (name) newData.name = name;
            if (capacity) newData.capacity = Number(capacity);
            await updateDoc(roomRef, newData);
        }
    }

    async deleteRoom(id) {
        await deleteDoc(doc(db, 'booking_room', id));
    }

    async getCars() {
        return await this._getCollection('transport_car');
    }

    async addCar(type, plateNumber, capacity, centerId) {
        const carData = { type, plateNumber, capacity: Number(capacity), centerId };
        const docRef = await addDoc(collection(db, 'transport_car'), carData);
        return { id: docRef.id, ...carData };
    }

    async deleteCar(id) {
        await deleteDoc(doc(db, 'transport_car', id));
    }

    async getTransportRecords() {
        const records = await this._getCollection('transport_record');
        return records.sort((a, b) => {
            if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
            return String(a.departureTime || '').localeCompare(String(b.departureTime || ''));
        });
    }

    async addTransportRecord(record) {
        const recordData = { ...record, isCompleted: false };
        const docRef = await addDoc(collection(db, 'transport_record'), recordData);
        return { id: docRef.id, ...recordData };
    }

    async markTransportRecordCompleted(id, completionTime) {
        const recordRef = doc(db, 'transport_record', id);
        const recordSnap = await getDoc(recordRef);
        if (recordSnap.exists()) {
            await updateDoc(recordRef, { ...recordSnap.data(), isCompleted: true, completionTime });
        }
    }

    async deleteTransportRecord(id) {
        await deleteDoc(doc(db, 'transport_record', id));
    }

    async getBookings() {
        const bookings = await this._getCollection('booking_record');
        return bookings.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    async addBooking(booking) {
        const docRef = await addDoc(collection(db, 'booking_record'), booking);
        return { id: docRef.id, ...booking };
    }

    async deleteBooking(id) {
        await deleteDoc(doc(db, 'booking_record', id));
    }

    async getEmployees() {
        return await this._getCollection('booking_employee');
    }

    async authenticate(name, password) {
        const emps = await this.getEmployees();
        const inputHash = await hashPassword(password);

        return emps.find((e) => {
            const storedName = String(e.name || '').trim();
            const enteredName = String(name || '').trim();
            const storedPassword = String(e.password || '');

            return storedName === enteredName && (
                storedPassword === inputHash || storedPassword === String(password || '')
            );
        }) || null;
    }

    async addEmployee(name, password, role = 'employee', centerId = null) {
        const emps = await this.getEmployees();
        const normalizedName = String(name || '').trim();

        if (!normalizedName) {
            throw new Error('اسم الموظف مطلوب');
        }

        if (emps.some(e => String(e.name || '').trim() === normalizedName)) {
            throw new Error('اسم الموظف موجود مسبقاً');
        }

        const empData = {
            name: normalizedName,
            password: await hashPassword(password),
            role,
            centerId,
            mustChangePassword: false
        };

        const docRef = await addDoc(collection(db, 'booking_employee'), empData);
        return { id: docRef.id, ...empData };
    }

    async updateEmployeeName(id, newName) {
        const empRefReal = doc(db, 'booking_employee', id);
        const empSnap = await getDoc(empRefReal);
        if (empSnap.exists()) {
            await updateDoc(empRefReal, { ...empSnap.data(), name: String(newName || '').trim() });
        }
    }

    async resetPassword(id, newPassword) {
        const empRef = doc(db, 'booking_employee', id);
        const empSnap = await getDoc(empRef);
        if (empSnap.exists()) {
            await updateDoc(empRef, { ...empSnap.data(), password: await hashPassword(newPassword) });
        }
    }

    async requirePasswordChange(id) {
        const empRef = doc(db, 'booking_employee', id);
        const empSnap = await getDoc(empRef);
        if (empSnap.exists()) {
            await updateDoc(empRef, { ...empSnap.data(), mustChangePassword: true });
        }
    }

    async updatePassword(id, newPassword) {
        const empRef = doc(db, 'booking_employee', id);
        const empSnap = await getDoc(empRef);
        if (empSnap.exists()) {
            await updateDoc(empRef, {
                ...empSnap.data(),
                password: await hashPassword(newPassword),
                mustChangePassword: false
            });
        }
    }

    async deleteEmployee(id) {
        await deleteDoc(doc(db, 'booking_employee', id));
    }
}

export const mockData = new Store();
window.mockData = mockData;
window.store = mockData;
