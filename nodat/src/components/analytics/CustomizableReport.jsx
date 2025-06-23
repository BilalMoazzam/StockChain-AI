"use client"

import { useState, useEffect } from "react"

const CustomizableReport = ({ allProducts }) => {
  const [reportType, setReportType] = useState("performanceMetrics")
  const [reportData, setReportData] = useState([])
  const [reportHeaders, setReportHeaders] = useState([])

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // Number of items per page

  useEffect(() => {
    generateReport()
  }, [reportType, allProducts])

  const generateReport = () => {
    if (!Array.isArray(allProducts) || allProducts.length === 0) {
      setReportData([])
      setReportHeaders([])
      setCurrentPage(1) // Reset page on no data
      return
    }

    const shoesProducts = allProducts.filter((item) => item.Category && item.Category.toLowerCase().includes("shoes"))

    if (shoesProducts.length === 0) {
      setReportData([])
      setReportHeaders([])
      setCurrentPage(1) // Reset page on no data
      return
    }

    let data = []
    let headers = []

    switch (reportType) {
      case "performanceMetrics":
        const reorderCount = shoesProducts.filter((p) => p.ai_prediction === "Reorder").length
        const monitorCount = shoesProducts.filter((p) => p.ai_prediction === "Monitor").length
        const enoughCount = shoesProducts.filter((p) => p.ai_prediction === "Enough").length
        const totalShoesAnalyzed = shoesProducts.length

        const inventoryHealth = totalShoesAnalyzed > 0 ? ((enoughCount / totalShoesAnalyzed) * 100).toFixed(1) : 0

        headers = ["Metric", "Value", "Status"]
        data = [
          { Metric: "Total Shoes Analyzed", Value: totalShoesAnalyzed, Status: "N/A" },
          {
            Metric: "Reorder Needed",
            Value: reorderCount,
            Status: reorderCount > 0 ? "Action Required" : "Good",
          },
          { Metric: "Monitor Stock", Value: monitorCount, Status: monitorCount > 0 ? "Watch" : "Good" },
          { Metric: "Enough Stock", Value: enoughCount, Status: "Good" },
          {
            Metric: "Inventory Health (Shoes)",
            Value: `${inventoryHealth}%`,
            Status: "Calculated",
          },
        ]
        break
      case "inventoryReport":
        headers = ["Product ID", "Product Name", "Quantity", "Stock Status", "AI Prediction", "Value"]
        data = shoesProducts.map((p) => ({
          "Product ID": p.ProductID,
          "Product Name": p.ProductName,
          Quantity: Number.parseFloat(p.quantity) || 0,
          "Stock Status": p.stock,
          "AI Prediction": p.ai_prediction,
          Value: `$${((Number.parseFloat(p.quantity) || 0) * (Number.parseFloat(p.Price) || 0)).toLocaleString(
            undefined,
            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
          )}`,
        }))
        break
      case "salesReport":
        const sortedSales = [...shoesProducts]
          .sort((a, b) => {
            const valA = (Number.parseFloat(a.quantity) || 0) * (Number.parseFloat(a.Price) || 0)
            const valB = (Number.parseFloat(b.quantity) || 0) * (Number.parseFloat(b.Price) || 0)
            return valB - valA
          })
          .slice(0, 10)

        headers = ["Product ID", "Product Name", "Quantity Sold", "Revenue", "Profit"]
        data = sortedSales.map((p) => ({
          "Product ID": p.ProductID,
          "Product Name": p.ProductName,
          "Quantity Sold": Number.parseFloat(p.quantity) || 0,
          Revenue: `$${((Number.parseFloat(p.quantity) || 0) * (Number.parseFloat(p.Price) || 0)).toLocaleString(
            undefined,
            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
          )}`,
          Profit: `$${((Number.parseFloat(p.quantity) || 0) * (Number.parseFloat(p.Price) || 0) * 0.3).toLocaleString(
            undefined,
            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
          )}`,
        }))
        break
      default:
        data = []
        headers = []
    }

    setReportData(data)
    setReportHeaders(headers)
    setCurrentPage(1) // Reset to first page when report data changes
  }

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value)
  }

  const formatHeader = (header) => {
    return header
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace("Id", "ID")
      .trim()
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = reportData.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(reportData.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const renderPageNumbers = () => {
    const pageNumbers = []
    const maxPageButtons = 5 // Max number of page buttons to show

    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2))
      let endPage = Math.min(totalPages, currentPage + Math.floor(maxPageButtons / 2))

      if (endPage - startPage + 1 < maxPageButtons) {
        if (startPage === 1) {
          endPage = Math.min(totalPages, startPage + maxPageButtons - 1)
        } else if (endPage === totalPages) {
          startPage = Math.max(1, totalPages - maxPageButtons + 1)
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      if (startPage > 1) {
        if (startPage > 2) pageNumbers.unshift("...")
        pageNumbers.unshift(1)
      }
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push("...")
        pageNumbers.push(totalPages)
      }
    }
    return pageNumbers.map((number, index) =>
      number === "..." ? (
        <span key={index} className="pagination-ellipsis">
          ...
        </span>
      ) : (
        <button
          key={index}
          onClick={() => paginate(number)}
          className={`pagination-button ${number === currentPage ? "active" : ""}`}
        >
          {number}
        </button>
      ),
    )
  }

  return (
    <div className="customizable-report">
      <div className="report-controls">
        <div className="report-type-selector">
          <label htmlFor="report-type">Select Report Type:</label>
          <select id="report-type" value={reportType} onChange={handleReportTypeChange}>
            <option value="performanceMetrics">Performance Metrics (Shoes)</option>
            <option value="inventoryReport">Inventory Report (Shoes)</option>
            <option value="salesReport">Sales Report (Shoes)</option>
          </select>
        </div>
      </div>

      <div className="report-table-container">
        {currentItems.length > 0 ? (
          <table className="report-table">
            <thead>
              <tr>
                {reportHeaders.map((header) => (
                  <th key={header}>{formatHeader(header)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {reportHeaders.map((header, colIndex) => (
                    <td key={`${rowIndex}-${colIndex}`}>{row[header]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">No data available for this report type or category.</div>
        )}
      </div>

      {reportData.length > itemsPerPage && ( // Only show pagination if there's more than one page
        <div className="pagination-controls">
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">
            Previous
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => paginate(currentPage + 1)}
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

export default CustomizableReport
