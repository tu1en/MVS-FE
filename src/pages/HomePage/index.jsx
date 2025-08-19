import HomeBanner from './components/HomeBanner';
import RoleCards from './components/RoleCards';
import Footer from '../../components/Footer';
import RecruitmentModal from '../../components/RecruitmentModal';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Button } from 'antd';

export default function HomePage() {
  const { isLogin } = useSelector((state) => state.auth);
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('blackboard.jpg');

  const openRecruitModal = () => setShowRecruitModal(true);
  const closeRecruitModal = () => setShowRecruitModal(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Khi cuộn xuống quá 50% chiều cao màn hình, chuyển sang blackboard2.jpg
      if (scrollPosition > windowHeight * 0.5) {
        setBackgroundImage('blackboard2.jpg');
      } else {
        setBackgroundImage('blackboard.jpg');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="w-full min-h-screen flex flex-col"
      style={{
        backgroundImage: `url('/${backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        transition: 'background-image 0.5s ease-in-out'
      }}
    >
      <div className="mx-auto px-4 sm:px-6 max-w-screen-xl flex-1">
        <HomeBanner />
        <section className="py-16 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Tại sao chọn chúng tôi?</h2>
          <p className="text-white max-w-2xl mx-auto text-lg">
            Hệ thống học trực tuyến giúp bạn quản lý điểm, bài tập, điểm danh và báo cáo một cách hiện đại, nhanh chóng và minh bạch.
          </p>
        </section>
        {/* Nút Đăng Ký Tuyển Dụng cho guest */}
        {!isLogin && (
          <div className="flex justify-center my-10">
            <Button type="primary" size="large" className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white text-2xl px-10 py-6 rounded-xl shadow-lg hover:scale-105 transition-transform" onClick={openRecruitModal}>
              Đăng Ký Tuyển Dụng Ngay !
            </Button>
          </div>
        )}
        <RoleCards />
      </div>
      {!isLogin && <Footer />}
      {/* Modal tuyển dụng */}
      <RecruitmentModal visible={showRecruitModal} onCancel={closeRecruitModal} />
    </div>
  );
}
