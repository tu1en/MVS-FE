import { Button, Result } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <Result
    status="404"
    title="404 - Page Not Found"
    subTitle="Sorry, the page you visited does not exist."
    extra={
      <Link to="/">
        <Button type="primary">Back Home</Button>
      </Link>
    }
  />
);

export default NotFoundPage; 