import React, { useState, useEffect, useRef } from 'react';
import { Carousel, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function HomeBanner() {
  const navigate = useNavigate();
  const [imageErrors, setImageErrors] = useState({});
  const carouselRef = useRef(null);

  const educationSlides = [
    {
      title: "Minh Việt Education",
      subtitle: "Hệ thống giáo dục trực tuyến hàng đầu",
      description: "Cung cấp giải pháp học tập toàn diện cho học sinh, giáo viên và nhà quản lý",
      image: "/anh-day-hoc-1.jpg"
    },
    {
      title: "Môi trường học tập hiện đại",
      subtitle: "Công nghệ tiên tiến",
      description: "Nền tảng học trực tuyến với giao diện thân thiện và tính năng đa dạng",
      image: "/anh-day-hoc-2.jpg"
    },
    {
      title: "Kết nối cộng đồng giáo dục",
      subtitle: "Tương tác đa chiều",
      description: "Tạo môi trường học tập tương tác giữa học sinh, giáo viên và phụ huynh",
      image: "/anh-day-hoc-3.jpg"
    },
    {
      title: "Theo dõi tiến độ học tập",
      subtitle: "Báo cáo chi tiết",
      description: "Hệ thống đánh giá và báo cáo toàn diện giúp theo dõi sự tiến bộ của học sinh",
      image: "/anh-day-hoc-4.jpg"
    }
  ];

  useEffect(() => {
    console.log('HomeBanner component mounted');
    console.log('Education slides:', educationSlides);
  }, []);

  const handleSlideClick = () => {
    console.log('Slide clicked, navigating to login...');
    navigate('/login');
  };

  const handleImageError = (index) => {
    console.log(`Image failed to load for slide ${index}:`, educationSlides[index].image);
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const handleImageLoad = (index) => {
    console.log(`Image loaded successfully for slide ${index}:`, educationSlides[index].image);
  };

  const handlePrevSlide = () => {
    carouselRef.current?.prev();
  };

  const handleNextSlide = () => {
    carouselRef.current?.next();
  };

  return (
    <div className="w-full relative">
      <Carousel 
        ref={carouselRef}
        autoplay 
        autoplaySpeed={5000}
        className="text-center"
        dots={{ position: 'bottom' }}
      >
        {educationSlides.map((slide, index) => (
          <div 
            key={index}
            className="relative text-white py-28 px-6 overflow-hidden carousel-slide-hover"
            style={{
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
            onClick={handleSlideClick}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: imageErrors[index] 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            
            {/* Hidden image for error detection */}
            <img 
              src={slide.image}
              alt=""
              style={{ display: 'none' }}
              onError={() => handleImageError(index)}
              onLoad={() => handleImageLoad(index)}
            />
            
            {/* Overlay */}
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundColor: imageErrors[index] 
                  ? 'rgba(0, 0, 0, 0.3)'
                  : 'rgba(0, 0, 0, 0.6)'
              }}
            />
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-bold mb-2 animate-pulse">{slide.title}</h2>
              <h3 className="text-2xl font-semibold mb-4 text-blue-200">{slide.subtitle}</h3>
              <p className="text-lg mb-6 max-w-2xl mx-auto leading-relaxed">{slide.description}</p>
              <div className="text-sm text-blue-100 bg-black bg-opacity-30 px-4 py-2 rounded-full inline-block">
                💡 Tham gia ngay
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* Navigation Arrows */}
      <Button
        type="text"
        icon={<LeftOutlined />}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 hover:text-blue-600 border-0 shadow-lg"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={(e) => {
          e.stopPropagation();
          handlePrevSlide();
        }}
      />
      
      <Button
        type="text"
        icon={<RightOutlined />}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 hover:text-blue-600 border-0 shadow-lg"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleNextSlide();
        }}
      />
    </div>
  );
}
