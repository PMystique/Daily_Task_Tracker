import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Moon, 
  Sun, 
  Bell, 
  BellOff, 
  BellRing,
  Volume2,
  VolumeX,
  Plus, 
  Layers,
  User,
  Edit3,
  ShieldCheck,
  Check,
  X,
  Zap,
  Sparkles,
  Sliders,
  Mail,
  Lock,
  ChevronRight
} from 'lucide-react';
import { NotificationSetting, NotificationMode, UserProfile } from '../types';
import { requestNotificationPermission, playNotificationSound } from '../utils/notifications';
import { MainViewMode } from './CategoryTabs';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  notificationSettings: NotificationSetting;
  onUpdateNotificationSettings: (settings: NotificationSetting) => void;
  userProfile: UserProfile;
  onUpdateUserProfile: (profile: UserProfile) => void;
  onSendTestNotification?: () => void;
  onOpenNewTaskModal: () => void;
  onOpenCalendarModal: () => void;
  onOpenAnalytics: () => void;
  onOpenAskCoach?: () => void;
  activeView: MainViewMode;
  onSelectView: (view: MainViewMode) => void;
  pendingCount: number;
  completedTodayCount: number;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  notificationSettings,
  onUpdateNotificationSettings,
  userProfile,
  onUpdateUserProfile,
  onSendTestNotification,
  onOpenNewTaskModal,
  onOpenCalendarModal,
  onOpenAnalytics,
  onOpenAskCoach,
  activeView,
  onSelectView,
  pendingCount,
  completedTodayCount,
  onToggleSidebar,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  // Dropdown states
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false);
  const [isCloudSyncInfoOpen, setIsCloudSyncInfoOpen] = useState<boolean>(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState<string>(userProfile.name);
  const [editEmail, setEditEmail] = useState<string>(userProfile.email);
  const [editInitials, setEditInitials] = useState<string>(userProfile.initials);
  const [editColor, setEditColor] = useState<string>(userProfile.avatarColor || 'bg-indigo-600');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cycle mode on direct bell click or select mode
  const handleSetMode = async (mode: NotificationMode) => {
    let enabled = mode !== 'disabled';
    let perm = notificationSettings.permissionStatus;

    if (mode === 'all' && perm !== 'granted') {
      perm = await requestNotificationPermission();
      if (perm !== 'granted') {
        mode = 'popup'; // fallback to in-app popups
      }
    }

    onUpdateNotificationSettings({
      ...notificationSettings,
      enabled,
      mode,
      permissionStatus: perm,
    });
  };

  const handleToggleSound = () => {
    const nextSound = !notificationSettings.soundEnabled;
    if (nextSound) {
      playNotificationSound();
    }
    onUpdateNotificationSettings({
      ...notificationSettings,
      soundEnabled: nextSound,
    });
  };

  const handleLeadTimeChange = (minutes: number) => {
    onUpdateNotificationSettings({
      ...notificationSettings,
      leadTimeMinutes: minutes,
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    onUpdateUserProfile({
      ...userProfile,
      name: editName.trim(),
      email: editEmail.trim(),
      initials: (editInitials.trim() || editName.trim().substring(0, 2)).toUpperCase(),
      avatarColor: editColor,
    });
    setIsEditProfileModalOpen(false);
  };

  const getModeBadge = (mode: NotificationMode) => {
    switch (mode) {
      case 'all':
        return { label: 'Push & Popups', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'popup':
        return { label: 'In-App Popups', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'silent':
        return { label: 'Silent Mode', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'disabled':
        return { label: 'Muted / Off', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
    }
  };

  const currentMode = notificationSettings.mode || (notificationSettings.enabled ? 'all' : 'disabled');
  const badge = getModeBadge(currentMode);

  const COLOR_OPTIONS = [
    { label: 'Indigo', value: 'bg-indigo-600' },
    { label: 'Emerald', value: 'bg-emerald-600' },
    { label: 'Purple', value: 'bg-purple-600' },
    { label: 'Amber', value: 'bg-amber-600' },
    { label: 'Teal', value: 'bg-teal-600' },
    { label: 'Rose', value: 'bg-rose-600' },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
        
        {/* Left Title & Date */}
        <div className="flex items-center space-x-4">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <Layers className="w-5 h-5" />
            </button>
          )}

          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {dateStr || 'Monday, October 23'}
            </h2>
            <div className="flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 font-semibold">
                Weekday Routine
              </span>
              <span>• {timeStr}</span>
              <span className="text-emerald-500 font-bold">• {completedTodayCount} done today</span>
            </div>
          </div>
        </div>

        {/* Center View Selector Buttons */}
        <div className="hidden lg:flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs">
          <button
            onClick={() => onSelectView('goals')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              activeView === 'goals'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Goals & Projects
          </button>
          <button
            onClick={() => onSelectView('tasks')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              activeView === 'tasks'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Action Tasks
          </button>
          <button
            onClick={() => onSelectView('routines')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              activeView === 'routines'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Routine Protocol
          </button>
          <button
            onClick={() => onSelectView('calendar')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              activeView === 'calendar'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Calendar Sync
          </button>
          <button
            onClick={() => onSelectView('analytics')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              activeView === 'analytics'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Push Notification Mode Dropdown & Button */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`p-2 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5 ${
                currentMode === 'all'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : currentMode === 'popup'
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20'
                  : currentMode === 'silent'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={`Notification Mode: ${badge.label}`}
            >
              {currentMode === 'all' && <Bell className="w-4 h-4 text-emerald-400 animate-pulse" />}
              {currentMode === 'popup' && <BellRing className="w-4 h-4 text-indigo-400" />}
              {currentMode === 'silent' && <VolumeX className="w-4 h-4 text-amber-400" />}
              {currentMode === 'disabled' && <BellOff className="w-4 h-4 text-slate-400" />}
              
              <span className="hidden sm:inline-block text-[11px] font-medium font-mono">
                {currentMode === 'all' ? 'Alerts On' : currentMode === 'popup' ? 'Popups' : currentMode === 'silent' ? 'Silent' : 'Off'}
              </span>
            </button>

            {/* Notification Control Popover */}
            {isNotifOpen && (
              <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full sm:mt-2 w-[calc(100vw-1rem)] sm:w-80 max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Notification Modes</h3>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold border rounded-full ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Mode Selector Options */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSetMode('all')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between space-y-1 ${
                      currentMode === 'all'
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-white'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      {currentMode === 'all' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <span className="text-xs font-bold block">Push & Popups</span>
                    <span className="text-[10px] text-slate-400 leading-tight">Desktop alerts + in-app banners + sound</span>
                  </button>

                  <button
                    onClick={() => handleSetMode('popup')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between space-y-1 ${
                      currentMode === 'popup'
                        ? 'bg-indigo-950/60 border-indigo-500/50 text-white'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <BellRing className="w-4 h-4 text-indigo-400" />
                      {currentMode === 'popup' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <span className="text-xs font-bold block">Popups Only</span>
                    <span className="text-[10px] text-slate-400 leading-tight">On-screen popups & chimes inside app</span>
                  </button>

                  <button
                    onClick={() => handleSetMode('silent')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between space-y-1 ${
                      currentMode === 'silent'
                        ? 'bg-amber-950/60 border-amber-500/50 text-white'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <VolumeX className="w-4 h-4 text-amber-400" />
                      {currentMode === 'silent' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <span className="text-xs font-bold block">Silent Mode</span>
                    <span className="text-[10px] text-slate-400 leading-tight">Visual banners without sound or desktop push</span>
                  </button>

                  <button
                    onClick={() => handleSetMode('disabled')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between space-y-1 ${
                      currentMode === 'disabled'
                        ? 'bg-slate-800 border-slate-500 text-white'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <BellOff className="w-4 h-4 text-slate-400" />
                      {currentMode === 'disabled' && <Check className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                    <span className="text-xs font-bold block">Disable All</span>
                    <span className="text-[10px] text-slate-400 leading-tight">Mute all deadline alerts completely</span>
                  </button>
                </div>

                {/* Extra Options: Sound & Lead Time */}
                <div className="pt-2 border-t border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      {notificationSettings.soundEnabled ? (
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span>Audio Chime Sound</span>
                    </div>
                    <button
                      onClick={handleToggleSound}
                      className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                        notificationSettings.soundEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          notificationSettings.soundEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Alert Lead Time</span>
                    <div className="flex gap-1">
                      {[5, 15, 30, 60].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => handleLeadTimeChange(mins)}
                          className={`px-1.5 py-0.5 text-[10px] font-mono rounded font-bold transition ${
                            notificationSettings.leadTimeMinutes === mins
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Test Alert Button */}
                {onSendTestNotification && (
                  <button
                    onClick={() => {
                      onSendTestNotification();
                      setIsNotifOpen(false);
                    }}
                    className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Send Test Notification Alert</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Profile Avatar Circle & Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`w-9 h-9 rounded-full ${userProfile.avatarColor || 'bg-indigo-600'} flex items-center justify-center text-xs font-bold text-white shadow-md ring-2 ring-indigo-500/40 hover:ring-indigo-400 transition transform active:scale-95`}
              title={`${userProfile.name} (${userProfile.email})`}
            >
              {userProfile.initials || 'JD'}
            </button>

            {/* Profile Popover Card */}
            {isProfileOpen && (
              <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full sm:mt-2 w-[calc(100vw-1rem)] sm:w-72 max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                {/* User Header */}
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                  <div className={`w-11 h-11 rounded-2xl ${userProfile.avatarColor || 'bg-indigo-600'} flex items-center justify-center text-sm font-black text-white shadow-inner`}>
                    {userProfile.initials || 'JD'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white truncate">{userProfile.name}</h4>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-slate-400 truncate">{userProfile.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                      {userProfile.role || 'Pro Member'}
                    </span>
                  </div>
                </div>

                {/* Quick Productivity Stats */}
                <div className="grid grid-cols-2 gap-2 py-1">
                  <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-800 text-center">
                    <span className="text-xs text-slate-400 block">Completed Today</span>
                    <span className="text-base font-extrabold text-emerald-400">{completedTodayCount}</span>
                  </div>
                  <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-800 text-center">
                    <span className="text-xs text-slate-400 block">Action Pending</span>
                    <span className="text-base font-extrabold text-indigo-400">{pendingCount}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setEditName(userProfile.name);
                      setEditEmail(userProfile.email);
                      setEditInitials(userProfile.initials);
                      setEditColor(userProfile.avatarColor || 'bg-indigo-600');
                      setIsEditProfileModalOpen(true);
                    }}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Edit Profile Details</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsCloudSyncInfoOpen(true);
                    }}
                    className="w-full py-2 px-3 bg-slate-800/70 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-between transition border border-slate-700/50"
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Account Sync & Security</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono">Local Data</span>
                  </button>
                </div>

                {/* Footer Notice */}
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 text-center">
                  Data safely stored in offline local storage.
                </div>
              </div>
            )}
          </div>

          {/* Ask Coach Pill Button */}
          {onOpenAskCoach && (
            <button
              onClick={onOpenAskCoach}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-500/20 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-teal-200 animate-pulse" />
              <span className="hidden sm:inline">Ask Coach</span>
            </button>
          )}

          {/* + Add Task Primary Button */}
          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>

        </div>

      </header>

      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Edit Profile Information</h3>
              </div>
              <button
                onClick={() => setIsEditProfileModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Avatar Initials</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={editInitials}
                    onChange={(e) => setEditInitials(e.target.value.toUpperCase())}
                    placeholder="JD"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Accent Color</label>
                  <select
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {COLOR_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/20"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cloud Sync & Account Information Dialog */}
      {isCloudSyncInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Account & Cloud Backup</h3>
              </div>
              <button
                onClick={() => setIsCloudSyncInfoOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Local Profile Active</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your profile <strong>{userProfile.name}</strong> and all created goals, tasks, and routines are saved securely in your browser's persistent storage.
              </p>
            </div>

            <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-slate-200">Upcoming Cloud Account Registration</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Account creation, email login, and real-time multi-device cloud synchronization will be available when online authentication is enabled.
              </p>
            </div>

            <button
              onClick={() => setIsCloudSyncInfoOpen(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};


