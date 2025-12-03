"use client"

import { useEffect, useState, useRef } from 'react'
import { Bell, X, Check, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCurrentUser } from '@/lib/auth'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  metadata?: any
}

interface NotificationsProps {
  variant?: 'admin' | 'intern'
}

export function Notifications({ variant = 'admin' }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    getCurrentUser().then(setCurrentUser)
  }, [])

  useEffect(() => {
    if (currentUser?.id) {
      fetchNotifications()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [currentUser])

  const fetchNotifications = async () => {
    if (!currentUser?.id) return
    
    try {
      const res = await fetch(`/api/notifications?userId=${currentUser.id}`)
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.notifications?.filter((n: Notification) => !n.isRead).length || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!currentUser?.id) return
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true, userId: currentUser.id })
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_intern':
        return '👤'
      case 'clock_in':
        return '🕐'
      case 'clock_out':
        return '🕕'
      case 'leave_application':
        return '📝'
      case 'leave_approved':
        return '✅'
      case 'leave_rejected':
        return '❌'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_intern':
        return 'bg-blue-100 text-blue-700'
      case 'clock_in':
        return 'bg-green-100 text-green-700'
      case 'clock_out':
        return 'bg-purple-100 text-purple-700'
      case 'leave_application':
        return 'bg-amber-100 text-amber-700'
      case 'leave_approved':
        return 'bg-green-100 text-green-700'
      case 'leave_rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-5 w-5" />
      </Button>
    )
  }

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      })
    }
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative z-[9999]">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            onClick={() => setIsOpen(false)}
          />
          <Card 
            className="fixed w-96 max-h-[600px] overflow-hidden z-[9999] shadow-lg border-[#40e0d0]/30"
            style={{ 
              backgroundColor: '#ffffff',
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`
            }}
          >
            <CardHeader 
              className="pb-3 border-b"
              style={{ backgroundColor: '#ffffff' }}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs h-7"
                    >
                      <CheckCheck className="h-3 w-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent 
              className="p-0"
              style={{ backgroundColor: '#ffffff' }}
            >
              <div 
                className="max-h-[500px] overflow-y-auto"
                style={{ backgroundColor: '#ffffff' }}
              >
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y" style={{ backgroundColor: '#ffffff' }}>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50' : 'bg-white'
                        }`}
                        style={{ backgroundColor: !notification.isRead ? '#eff6ff' : '#ffffff' }}
                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`text-2xl ${getNotificationColor(notification.type)} rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className={`font-semibold text-sm ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

