#!/usr/bin/env node

/**
 * Script to automatically fix navigation issues in MVS application
 * Run with: node fix-navigation-issues.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Navigation Issues Fix...\n');

// 1. Fix NavigationMenu.jsx routes
function fixNavigationMenu() {
  console.log('📝 Fixing NavigationMenu.jsx routes...');
  
  const filePath = './src/components/NavigationMenu.jsx';
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ NavigationMenu.jsx not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix student routes
  content = content.replace(
    "onClick: () => navigate('/assignments-new')",
    "onClick: () => navigate('/student/assignments')"
  );
  
  content = content.replace(
    "onClick: () => navigate('/lectures')",
    "onClick: () => navigate('/student/lectures')"
  );
  
  content = content.replace(
    "onClick: () => navigate('/attendance-marking')",
    "onClick: () => navigate('/student/attendance-records')"
  );
  
  content = content.replace(
    "onClick: () => navigate('/messaging')",
    "onClick: () => navigate('/student/messages')"
  );
  
  // Fix teacher routes
  content = content.replace(
    "onClick: () => navigate('/classes')",
    "onClick: () => navigate('/teacher/courses')"
  );
  
  content = content.replace(
    /teacherMenuItems[\s\S]*?onClick: \(\) => navigate\('\/assignments-new'\)/,
    (match) => match.replace('/assignments-new', '/teacher/assignments')
  );
  
  content = content.replace(
    /teacherMenuItems[\s\S]*?onClick: \(\) => navigate\('\/lectures'\)/,
    (match) => match.replace('/lectures', '/teacher/lectures')
  );
  
  content = content.replace(
    /teacherMenuItems[\s\S]*?onClick: \(\) => navigate\('\/messaging'\)/,
    (match) => match.replace('/messaging', '/teacher/messages')
  );
  
  fs.writeFileSync(filePath, content);
  console.log('✅ NavigationMenu.jsx routes fixed');
}

// 2. Fix NavigationBar.jsx duplicate categories
function fixNavigationBar() {
  console.log('📝 Fixing NavigationBar.jsx duplicate categories...');
  
  const filePath = './src/components/NavigationBar.jsx';
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ NavigationBar.jsx not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix duplicate "Lương" category in accountantNavItems
  const duplicateLuongRegex = /{\s*category:\s*"Lương",\s*items:\s*\[\s*{\s*name:\s*'Lương của tôi',[\s\S]*?\]\s*},\s*{\s*category:\s*"Lương",\s*items:\s*\[[\s\S]*?\]\s*}/;
  
  const fixedLuongSection = `{
      category: "Lương",
      items: [
        { name: 'Lương của tôi', path: '/accountant/my/payroll', icon: '💵' },
        { name: 'Quản lý bảng lương', path: '/accountant/payroll', icon: '📑' },
        { name: 'Tra soát lương', path: '/accountant/payroll-issues', icon: '🛠️' }
      ]
    }`;
  
  if (duplicateLuongRegex.test(content)) {
    content = content.replace(duplicateLuongRegex, fixedLuongSection);
    console.log('✅ Fixed duplicate "Lương" category');
  }
  
  fs.writeFileSync(filePath, content);
  console.log('✅ NavigationBar.jsx duplicate categories fixed');
}

// 3. Create missing page components
function createMissingComponents() {
  console.log('📝 Creating missing page components...');
  
  const components = [
    {
      name: 'AboutPage.jsx',
      path: './src/pages/AboutPage.jsx',
      content: `import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const AboutPage = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Về Chúng Tôi</Title>
        <Paragraph>
          Hệ thống quản lý học tập MVS (Management & Virtual Study) là một nền tảng 
          giáo dục hiện đại, được thiết kế để hỗ trợ quá trình dạy và học trực tuyến.
        </Paragraph>
        <Paragraph>
          Chúng tôi cam kết mang đến trải nghiệm học tập tốt nhất cho học sinh, 
          giáo viên và phụ huynh thông qua công nghệ tiên tiến và giao diện thân thiện.
        </Paragraph>
      </Card>
    </div>
  );
};

export default AboutPage;`
    },
    {
      name: 'AdminEditProfile.jsx',
      path: './src/pages/admin/AdminEditProfile.jsx',
      content: `import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const AdminEditProfile = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Quản Lý Tài Khoản Admin</Title>
        <p>Trang quản lý thông tin tài khoản admin đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default AdminEditProfile;`
    },
    {
      name: 'TeacherGrading.jsx',
      path: './src/pages/teacher/TeacherGrading.jsx',
      content: `import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const TeacherGrading = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Chấm Điểm</Title>
        <p>Trang chấm điểm cho giáo viên đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default TeacherGrading;`
    }
  ];
  
  components.forEach(component => {
    const dir = path.dirname(component.path);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
    
    // Create component file
    if (!fs.existsSync(component.path)) {
      fs.writeFileSync(component.path, component.content);
      console.log(`✅ Created component: ${component.name}`);
    } else {
      console.log(`⚠️  Component already exists: ${component.name}`);
    }
  });
}

// 4. Generate App.js route additions
function generateAppJsRoutes() {
  console.log('📝 Generating App.js route additions...');
  
  const routeAdditions = `
// Add these routes to App.js in the appropriate sections:

// Public Routes (add after line ~285)
<Route path="/about" element={<PublicRoute><AboutPage /></PublicRoute>} />

// Admin Routes (add after line ~370)
<Route path="/admin/account" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminEditProfile /></ProtectedRoute>} />

// Teacher Routes (add after line ~314)
<Route path="/teacher/grading" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherGrading /></ProtectedRoute>} />

// Don't forget to add imports at the top of App.js:
import AboutPage from './pages/AboutPage.jsx';
import AdminEditProfile from './pages/admin/AdminEditProfile.jsx';
import TeacherGrading from './pages/teacher/TeacherGrading.jsx';
`;
  
  fs.writeFileSync('./ROUTES_TO_ADD.txt', routeAdditions);
  console.log('✅ Generated route additions in ROUTES_TO_ADD.txt');
}

// Main execution
async function main() {
  try {
    fixNavigationMenu();
    fixNavigationBar();
    createMissingComponents();
    generateAppJsRoutes();
    
    console.log('\n🎉 Navigation fixes completed successfully!');
    console.log('\n📋 Manual steps remaining:');
    console.log('1. Add the routes from ROUTES_TO_ADD.txt to App.js');
    console.log('2. Add the component imports to App.js');
    console.log('3. Test all navigation paths');
    console.log('4. Remove or repurpose NavigationMenu.jsx if needed');
    
  } catch (error) {
    console.error('❌ Error during fix process:', error);
  }
}

main();`
