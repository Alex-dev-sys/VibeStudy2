import { Outlet } from 'react-router-dom';
import { DemoBanner } from '../demo/DemoBanner';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="app-shell min-h-screen bg-background">
            <div className="app-grid" aria-hidden="true" />
            <Sidebar />
            <div className="app-workspace">
                <DemoBanner />
                <Header />
                <main className="min-h-screen pb-28 pt-32 lg:pb-10 lg:pt-36">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}