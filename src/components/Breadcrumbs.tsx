import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  if (pathnames.length === 0) return null;

  return (
    <nav className="bg-slate-50 border-b border-slate-100 py-2 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest overflow-x-auto whitespace-nowrap scrollbar-hide">
        <Link to="/" className="hover:text-postal-red flex items-center gap-1 transition-colors">
          <Home size={12} /> HOME
        </Link>
        
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          // Clean up common ID patterns for display
          let displayName = name.replace(/-/g, ' ');
          if (displayName.length > 20) displayName = displayName.substring(0, 20) + '...';

          return (
            <React.Fragment key={routeTo}>
              <ChevronRight size={10} className="shrink-0" />
              {isLast ? (
                <span className="text-postal-red truncate max-w-[150px]">{displayName}</span>
              ) : (
                <Link to={routeTo} className="hover:text-postal-red transition-colors truncate max-w-[100px]">
                  {displayName}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}
