import React, { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen,
  MessageSquare, 
  Inbox,
  Settings,
  HelpCircle,
  Plus,
  Building2,
  Shield,
  Phone,
  Smartphone,
  ChevronDown,
  ChevronRight,
  Send,
  Radio
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/authSlice'

const Sidebar = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const [messagesExpanded, setMessagesExpanded] = useState(
    location.pathname.startsWith('/messages')
  )

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: GraduationCap },
    { name: 'Classes', path: '/classes', icon: BookOpen },
    { name: 'Inbox', path: '/inbox', icon: Inbox },
  ]

  const messageItems = [
    { name: 'One-to-One', path: '/messages/one-to-one', icon: MessageSquare },
    { name: 'Broadcast', path: '/messages/broadcast', icon: Radio },
  ]

  const adminItems = [
    { name: 'Schools', path: '/admin/schools', icon: Building2 },
    { name: 'Admins', path: '/admin/admins', icon: Shield },
  ]

  const whatsappItems = [
    { name: 'WhatsApp Configuration', path: '/admin/whatsapp/config', icon: Smartphone },
    { name: 'WhatsApp Testing', path: '/admin/whatsapp/testing', icon: Phone },
  ]

  const utilityItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help and Docs', path: '/help', icon: HelpCircle },
  ]

  return (
    <div className="w-64 bg-white h-screen flex flex-col border-r border-gray-200">
      {/* Header/Branding */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">N</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">WhatsApp</h1>
            <p className="text-sm text-gray-600">for Schools</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
            </NavLink>
          )
        })}

        {/* Messages Section with Submenu */}
        <div className="space-y-1">
          <button
            onClick={() => setMessagesExpanded(!messagesExpanded)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname.startsWith('/messages')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Send className="w-5 h-5" />
              <span>Messages</span>
            </div>
            {messagesExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Messages Submenu */}
          {messagesExpanded && (
            <div className="ml-8 space-y-1">
              {messageItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                )
              })}
            </div>
          )}
        </div>

        {/* New Message Button */}
        <button 
          onClick={() => navigate('/messages/broadcast')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors mt-4"
        >
          <Plus className="w-4 h-4" />
          <span>New Broadcast</span>
        </button>

        {/* Management Admin Section - Only for SUPER_ADMIN */}
        {user?.role === 'SUPER_ADMIN' && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-600 uppercase tracking-wider">
                Management Admin
              </span>
            </div>
            <div className="space-y-1">
              {adminItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-600'
                          : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        )}

        {/* WhatsApp Integration Section - Only for SUPER_ADMIN */}
        {user?.role === 'SUPER_ADMIN' && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <Smartphone className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-600 uppercase tracking-wider">
                WhatsApp Integration
              </span>
            </div>
            <div className="space-y-1">
              {whatsappItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Utility Links */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {utilityItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          )
        })}

        {/* User Info and Logout */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
