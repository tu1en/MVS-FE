import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import React from 'react';

/**
 * Reusable Pagination Component
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current active page
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.startIndex - Start index of current page items (1-based)
 * @param {number} props.endIndex - End index of current page items
 * @param {Array} props.pageNumbers - Array of page numbers to display
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {Function} props.onNextPage - Callback for next page
 * @param {Function} props.onPreviousPage - Callback for previous page
 * @param {boolean} props.hasNextPage - Whether there's a next page
 * @param {boolean} props.hasPreviousPage - Whether there's a previous page
 * @param {string} props.itemName - Name of items being paginated (default: "items")
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  pageNumbers,
  onPageChange,
  onNextPage,
  onPreviousPage,
  hasNextPage,
  hasPreviousPage,
  itemName = "mục"
}) => {
  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page or no items
  }

  return (
    <div className="course-pagination">
      {/* Pagination Info */}
      <div className="pagination-info">
        Hiển thị {startIndex} - {endIndex} trong tổng số {totalItems} {itemName}
      </div>

      {/* Pagination Controls */}
      <div className="pagination-controls">
        {/* Previous Button */}
        <button
          className="pagination-button"
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
          aria-label="Trang trước"
        >
          <LeftOutlined className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">Trước</span>
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber === '...') {
            return (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                ...
              </span>
            );
          }

          return (
            <button
              key={pageNumber}
              className={`pagination-button ${
                pageNumber === currentPage ? 'active' : ''
              }`}
              onClick={() => onPageChange(pageNumber)}
              aria-label={`Trang ${pageNumber}`}
              aria-current={pageNumber === currentPage ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          className="pagination-button"
          onClick={onNextPage}
          disabled={!hasNextPage}
          aria-label="Trang sau"
        >
          <span className="hidden sm:inline mr-1">Sau</span>
          <RightOutlined className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
