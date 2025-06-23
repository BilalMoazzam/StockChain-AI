"use client"

import { useState } from "react"

const AIPredictionTable = ({ predictions }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // Display 10 items per page

  // Ensure predictions is an array before slicing
  const currentPredictions = Array.isArray(predictions)
    ? predictions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : []

  const totalPages = Array.isArray(predictions) ? Math.ceil(predictions.length / itemsPerPage) : 0

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  const renderPaginationButtons = () => {
    const pageNumbers = []
    const maxPageButtons = 5 // Max number of page buttons to show

    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2))
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1)

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-button ${currentPage === i ? "active" : ""}`}
        >
          {i}
        </button>,
      )
    }
    return pageNumbers
  }

  if (!predictions || predictions.length === 0) {
    return <div className="no-data">No product data available for AI predictions.</div>
  }

  return (
    <div className="ai-prediction-table-container">
      <table className="ai-prediction-table">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Stock Status</th>
            <th>AI Prediction</th>
          </tr>
        </thead>
        <tbody>
          {currentPredictions.map((item) => (
            <tr key={item.ProductID}>
              <td>{item.ProductID}</td>
              <td>{item.ProductName}</td>
              <td>{item.quantity}</td>
              <td>${(item.Price || 0).toLocaleString()}</td> {/* Ensure price is formatted and handles 0 */}
              <td>
                <span className={`stock-status ${item.stock.toLowerCase().replace(/\s/g, "-")}`}>{item.stock}</span>
              </td>
              <td>
                <span className={`ai-prediction ${item.ai_prediction.toLowerCase()}`}>{item.ai_prediction}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          {renderPaginationButtons()}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default AIPredictionTable
