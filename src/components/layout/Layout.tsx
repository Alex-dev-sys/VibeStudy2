import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="min-h-screen bg-background">
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(243,186,47,0.08),transparent_18%),radial-gradient(circle_at_top_right,rgba(7,198,239,0.08),transparent_18%),linear-gradient(180deg,#060a12_0%,#0b1120_50%,#060a12_100%)]" />
            <Sidebar />
            <Header />
            <main className="ml-72 min-h-screen pt-24">
                <Outlet />
            </main>
        </div>
    );
}
