import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../../styles/vietnamese-fonts.css'; // Ensure fonts are loaded

export const MarkdownRenderer = ({ content }) => {
  if (!content) {
    return null;
  }

  return (
    <div className="vietnamese-text">
      <ReactMarkdown
        children={content}
        components={{
          // Optional: customize rendering of specific elements
          h1: ({node, ...props}) => <h1 className="vietnamese-heading text-vietnamese-2xl" {...props} />,
          h2: ({node, ...props}) => <h2 className="vietnamese-heading text-vietnamese-xl" {...props} />,
          p: ({node, ...props}) => <p className="vietnamese-body text-vietnamese-base" {...props} />,
          // Add other element customizations if needed
        }}
      />
    </div>
  );
};