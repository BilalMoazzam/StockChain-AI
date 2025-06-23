"use client"

import { Button } from "../ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Package, ShoppingCart, DollarSign, Users, AlertTriangle, FileText } from "lucide-react"

function Dashboard() {
  return (
    <div className="flex-1 p-6 bg-gray-100 dark:bg-gray-950 min-h-screen">
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-50">Welcome back, User!</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Here's what's happening with your supply chain today.</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Products Card */}
        <Card className="relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500 group-hover:w-full transition-all duration-300 ease-in-out"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Products</CardTitle>
            <Package className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">150</div>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
              <span className="mr-1">▲</span> 12%
            </p>
          </CardContent>
        </Card>

        {/* Total Orders Card */}
        <Card className="relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-green-500 group-hover:w-full transition-all duration-300 ease-in-out"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">89</div>
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center">
              <span className="mr-1">▼</span> 8%
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue Card */}
        <Card className="relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-purple-500 group-hover:w-full transition-all duration-300 ease-in-out"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">$45,230</div>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
              <span className="mr-1">▲</span> 15%
            </p>
          </CardContent>
        </Card>

        {/* Active Users Card */}
        <Card className="relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-500 group-hover:w-full transition-all duration-300 ease-in-out"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Users</CardTitle>
            <Users className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">25</div>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
              <span className="mr-1">▲</span> 5%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Notifications */}
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-50">Alerts & Notifications</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Low Stock Alert Card */}
        <Card className="relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-500 group-hover:w-full transition-all duration-300 ease-in-out"></div>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2 relative z-10">
            <AlertTriangle className="h-6 w-6 text-orange-500 mr-3" />
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-50">Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-gray-700 dark:text-gray-300 mb-4">8 products are running low</p>
            <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600">
              View Details
            </Button>
          </CardContent>
        </Card>

        {/* Pending Orders Card */}
        <Card className="relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500 group-hover:w-full transition-all duration-300 ease-in-out"></div>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2 relative z-10">
            <FileText className="h-6 w-6 text-blue-500 mr-3" />
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-50">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-gray-700 dark:text-gray-300 mb-4">12 orders need attention</p>
            <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600">
              View Orders
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-50">Recent Orders</CardTitle>
            <Button variant="ghost" className="text-sm text-blue-500 hover:text-blue-600">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">#ORD-001</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">John Doe</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-50">$299.99</p>
                  <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-400 dark:ring-yellow-400/20">
                    Pending
                  </span>
                </div>
              </li>
              <li className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">#ORD-002</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Jane Smith</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-50">$149.50</p>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20">
                    Shipped
                  </span>
                </div>
              </li>
              <li className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">#ORD-003</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bob Johnson</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-50">$89.99</p>
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-800 ring-1 ring-inset ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20">
                    Delivered
                  </span>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Low Stock Alerts Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-50">Low Stock Alerts</CardTitle>
            <Button variant="ghost" className="text-sm text-blue-500 hover:text-blue-600">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">Wireless Headphones</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">SKU: WH-001</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-50">5</p>
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20">
                    Low Stock
                  </span>
                </div>
              </li>
              <li className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">USB Cable</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">SKU: USB-002</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-50">3</p>
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20">
                    Low Stock
                  </span>
                </div>
              </li>
              <li className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">Phone Case</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">SKU: PC-003</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-50">2</p>
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20">
                    Low Stock
                  </span>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
