import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/reset.css";
import { ConfigProvider } from "antd";
import { ToastContainer } from 'react-toastify';
import viVN from "antd/locale/vi_VN"; 
import 'react-toastify/dist/ReactToastify.css';
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from 'react-redux';
import { store } from './store';

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
    >
      <Provider store={store}>
        <App />
      </Provider>
    <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar theme="light" />
    </ConfigProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();