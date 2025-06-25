
export default function TestHomePage() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'red', 
      minHeight: '100vh',
      color: 'white',
      fontSize: '24px'
    }}>
      <h1>🔴 KIỂM TRA - ỨNG DỤNG REACT ĐANG HOẠT ĐỘNG!</h1>
      <p>Nếu bạn thấy văn bản này, ứng dụng React đang chạy bình thường.</p>
      <p>Thời gian hiện tại: {new Date().toLocaleString('vi-VN')}</p>
      <div style={{ 
        border: '3px solid yellow', 
        padding: '20px', 
        margin: '20px 0',
        backgroundColor: 'blue'
      }}>
        <h2>🔵 THÔNG TIN DEBUG:</h2>
        <p>URL hiện tại: {window.location.href}</p>
        <p>Port: {window.location.port}</p>
        <button onClick={() => alert('Button hoạt động!')} style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: 'green',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}>
          🟢 BẤM ĐỂ KIỂM TRA
        </button>
      </div>
    </div>
  );
}
