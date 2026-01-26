import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';

const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-purple-500/30">
            {/* SIDEBAR - Desktop */}
            <Sidebar />

            {/* MAIN CONTENT */}
            <main className="lg:pl-72 transition-all duration-300 min-h-screen flex flex-col">
                <div className="flex-1 p-4 md:p-8 pb-24 lg:pb-8 max-w-[1600px] mx-auto w-full">
                    <Outlet />
                </div>
            </main>

            {/* BOTTOM NAV - Mobile */}
            <BottomNav />
        </div>
    );
};

export default MainLayout;
