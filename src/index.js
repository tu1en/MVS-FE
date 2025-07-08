import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import viVN from "antd/locale/vi_VN";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { store } from './store';
import './styles/vietnamese-fonts.css';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 8, 
          fontSize: 14, 
        },
      }}
    >      <Provider store={store}>
        <App />
      </Provider>
      <ToastContainer 
        position="bottom-right" 
        autoClose={2000} 
        hideProgressBar={true} 
        theme="light"
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
        draggable={true}
        pauseOnHover={true}
      />
    </ConfigProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();