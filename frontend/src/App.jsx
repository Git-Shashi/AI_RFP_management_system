import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { FileText, Users, CheckSquare, LayoutDashboard } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import RFPsPage from './pages/RFPsPage';
import VendorsPage from './pages/VendorsPage';
import ProposalsPage from './pages/ProposalsPage';
import RFPDetailPage from './pages/RFPDetailPage';

function App() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/rfps', icon: FileText, label: 'RFPs' },
    { path: '/vendors', icon: Users, label: 'Vendors' },
    { path: '/proposals', icon: CheckSquare, label: 'Proposals' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">RFP Manager</h1>
          <p className="text-sm text-gray-500 mt-1">AI-Powered</p>
        </div>
        
        <nav className="px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        <div className="p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rfps" element={<RFPsPage />} />
            <Route path="/rfps/:id" element={<RFPDetailPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/proposals" element={<ProposalsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
