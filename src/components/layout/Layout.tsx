import { Outlet } from 'react-router-dom';
import { DemoBanner } from '../demo/DemoBanner';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="workspace-shell">
            <Sidebar />
            <div className="workspace-main">
                <DemoBanner />
                <Header />
                <main className="workspace-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}