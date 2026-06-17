import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/store/authStore';
import { useDishStore } from '@/store/dishStore';
import { useBookingStore } from '@/store/bookingStore';
import { useConsumptionStore } from '@/store/consumptionStore';
import { useNutritionStore } from '@/store/nutritionStore';
import { useStatsStore } from '@/store/statsStore';

import Login from '@/pages/Login';
import StudentHome from '@/pages/student/StudentHome';
import StudentBooking from '@/pages/student/StudentBooking';
import StudentPickup from '@/pages/student/StudentPickup';
import StudentConsumption from '@/pages/student/StudentConsumption';
import StudentNutrition from '@/pages/student/StudentNutrition';
import ParentHome from '@/pages/parent/ParentHome';
import ParentConsumption from '@/pages/parent/ParentConsumption';
import AdminDishes from '@/pages/admin/AdminDishes';
import AdminStatistics from '@/pages/admin/AdminStatistics';
import KitchenPreparation from '@/pages/kitchen/KitchenPreparation';

function AppInitializer() {
  const initAuth = useAuthStore((state) => state.init);
  const initDishes = useDishStore((state) => state.init);
  const initBookings = useBookingStore((state) => state.init);
  const initConsumption = useConsumptionStore((state) => state.init);
  const initNutrition = useNutritionStore((state) => state.init);
  const initStats = useStatsStore((state) => state.init);

  useEffect(() => {
    initAuth();
    initDishes();
    initBookings();
    initConsumption();
    initNutrition();
    initStats();
  }, [initAuth, initDishes, initBookings, initConsumption, initNutrition, initStats]);

  return null;
}

export default function App() {
  return (
    <Router>
      <AppInitializer />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/student" element={<AppLayout />}>
          <Route index element={<Navigate to="/student/home" replace />} />
          <Route path="home" element={<StudentHome />} />
          <Route path="booking" element={<StudentBooking />} />
          <Route path="pickup" element={<StudentPickup />} />
          <Route path="consumption" element={<StudentConsumption />} />
          <Route path="nutrition" element={<StudentNutrition />} />
        </Route>

        <Route path="/parent" element={<AppLayout />}>
          <Route index element={<Navigate to="/parent/home" replace />} />
          <Route path="home" element={<ParentHome />} />
          <Route path="consumption" element={<ParentConsumption />} />
        </Route>

        <Route path="/admin" element={<AppLayout />}>
          <Route index element={<Navigate to="/admin/dishes" replace />} />
          <Route path="dishes" element={<AdminDishes />} />
          <Route path="statistics" element={<AdminStatistics />} />
        </Route>

        <Route path="/kitchen" element={<AppLayout />}>
          <Route index element={<Navigate to="/kitchen/preparation" replace />} />
          <Route path="preparation" element={<KitchenPreparation />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
