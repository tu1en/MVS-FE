import HomeBanner from './components/HomeBanner';
import RoleCards from './components/RoleCards';
import FeatureSection from './components/FeatureSection';
import Footer from './components/Footer';
import RecruitmentModal from '../../components/RecruitmentModal';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { Button } from 'antd';

export default function HomePage() {
  const { isLogin } = useSelector((state) => state.auth);
  const [showRecruitModal, setShowRecruitModal] = useState(false);

  const openRecruitModal = () => setShowRecruitModal(true);
  const closeRecruitModal = () => setShowRecruitModal(false);

  return (
    <div className="w-full">
      <div className="mx-auto px-4 sm:px-6 max-w-screen-xl">
        <HomeBanner />
        <section className="py-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Tại sao chọn chúng tôi?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hệ thống học trực tuyến giúp bạn quản lý điểm, bài tập, điểm danh và báo cáo một cách hiện đại, nhanh chóng và minh bạch.
          </p>
        </section>
        <RoleCards />
        {/* Nút Đăng Ký Tuyển Dụng cho guest */}
        {!isLogin && (
          <div className="flex justify-center my-10">
            <Button type="primary" size="large" className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white text-2xl px-10 py-6 rounded-xl shadow-lg hover:scale-105 transition-transform" onClick={openRecruitModal}>
              Đăng Ký Tuyển Dụng
            </Button>
          </div>
        )}
        <FeatureSection />
      </div>
      {!isLogin && <Footer />}
      {/* Modal tuyển dụng */}
      <RecruitmentModal visible={showRecruitModal} onCancel={closeRecruitModal} />
    </div>
  );
}
