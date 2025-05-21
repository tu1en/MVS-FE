import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [backendMessage, setBackendMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        console.log("Đang gọi API đến: /api/v1/greetings/hello");
        const response = await axios.get('/api/v1/greetings/hello');
        console.log("Phản hồi từ API:", response);
        setBackendMessage(response.data);
        setError('');
      } catch (err) {
        console.error("Lỗi khi gọi API backend:", err);
        if (err.response) {
          // Server trả về lỗi
          console.log("Chi tiết lỗi:", err.response);
          setError(`Lỗi từ server: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
        } else if (err.request) {
          // Request gửi đi nhưng không nhận được response
          console.log("Request gửi nhưng không có response:", err.request);
          setError('Không thể kết nối đến server backend. Vui lòng kiểm tra xem backend có đang chạy không.');
        } else {
          // Lỗi khi thiết lập request
          setError(`Lỗi khi thiết lập request: ${err.message}`);
        }
        setBackendMessage('');
      } finally {
        setLoading(false);
      }
    };

    fetchGreeting();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ứng dụng Quản lý Lớp học - Frontend</h1>
        <h2>Kết nối với Backend:</h2>
        
        {loading && <p>Đang tải thông điệp từ backend...</p>}
        
        {error && (
          <div>
            <p style={{ color: 'red' }}>Lỗi: {error}</p>
            <p>API đang gọi đến: http://localhost:8090/api/v1/greetings/hello</p>
            <button onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        )}
        
        {backendMessage && (
          <p style={{ color: 'lightgreen' }}>
            Thông điệp từ Backend: "{backendMessage}"
          </p>
        )}
      </header>
    </div>

//     // SAMPLE TEST FE TAILWIND
//     <div class="bg-white">
//   <header class="absolute inset-x-0 top-0 z-50">
//     <nav class="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
//       <div class="flex lg:flex-1">
//         <a href="#" class="-m-1.5 p-1.5">
//           <span class="sr-only">Your Company</span>
//           <img class="h-8 w-auto" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" alt=""/>
//         </a>
//       </div>
//       <div class="flex lg:hidden">
//         <button type="button" class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700">
//           <span class="sr-only">Open main menu</span>
//           <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
//             <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
//           </svg>
//         </button>
//       </div>
//       <div class="hidden lg:flex lg:gap-x-12">
//         <a href="#" class="text-sm/6 font-semibold text-gray-900">Product</a>
//         <a href="#" class="text-sm/6 font-semibold text-gray-900">Features</a>
//         <a href="#" class="text-sm/6 font-semibold text-gray-900">Marketplace</a>
//         <a href="#" class="text-sm/6 font-semibold text-gray-900">Company</a>
//       </div>
//       <div class="hidden lg:flex lg:flex-1 lg:justify-end">
//         <a href="#" class="text-sm/6 font-semibold text-gray-900">Log in <span aria-hidden="true">&rarr;</span></a>
//       </div>
//     </nav>
//     <div class="lg:hidden" role="dialog" aria-modal="true">
//       <div class="fixed inset-0 z-50"></div>
//       <div class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
//         <div class="flex items-center justify-between">
//           <a href="#" class="-m-1.5 p-1.5">
//             <span class="sr-only">Your Company</span>
//             <img class="h-8 w-auto" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" alt=""/>
//           </a>
//           <button type="button" class="-m-2.5 rounded-md p-2.5 text-gray-700">
//             <span class="sr-only">Close menu</span>
//             <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
//               <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>
//         <div class="mt-6 flow-root">
//           <div class="-my-6 divide-y divide-gray-500/10">
//             <div class="space-y-2 py-6">
//               <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">Product</a>
//               <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">Features</a>
//               <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">Marketplace</a>
//               <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">Company</a>
//             </div>
//             <div class="py-6">
//               <a href="#" class="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">Log in</a>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </header>

//   <div class="relative isolate px-6 pt-14 lg:px-8">
//     <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
// <div
//   className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[144.5rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[288.75rem]"
//   style={{
//     clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
//   }}
// ></div>
//     </div>
//     <div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
//       <div class="hidden sm:mb-8 sm:flex sm:justify-center">
//         <div class="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
//           Announcing our next round of funding. <a href="#" class="font-semibold text-indigo-600"><span class="absolute inset-0" aria-hidden="true"></span>Read more <span aria-hidden="true">&rarr;</span></a>
//         </div>
//       </div>
//       <div class="text-center">
//         <h1 class="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">Data to enrich your online business</h1>
//         <p class="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat.</p>
//         <div class="mt-10 flex items-center justify-center gap-x-6">
//           <a href="#" class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Get started</a>
//           <a href="#" class="text-sm/6 font-semibold text-gray-900">Learn more <span aria-hidden="true">→</span></a>
//         </div>
//       </div>
//     </div>
//     <div class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
//       <div
//   className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[144.5rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[288.75rem]"
//   style={{
//     clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
//   }}
// ></div>
//     </div>
//   </div>
// </div>


  );
}

export default App;