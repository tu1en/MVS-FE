import HomeBanner from './components/HomeBanner';
import RoleCards from './components/RoleCards';
import FeatureSection from './components/FeatureSection';
import Footer from './components/Footer';
import { useSelector } from 'react-redux';

export default function HomePage() {
  const { isLogin, role } = useSelector((state) => state.auth);

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
        <FeatureSection />
      </div>
      {!isLogin && 
        <Footer />
      }
    </div>
  );
}
