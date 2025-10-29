import React from 'react';



// a
type KpiCardProps = {
  title: string;
  value: string;

  icon: React.ReactNode; 
  iconBgColor: string;
};


function KpiCard({ 
  title, 
  value, 
  icon, 
  iconBgColor 
}: KpiCardProps) {
  
  

  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        <div className="kpi-icon-wrapper" style={{ backgroundColor: iconBgColor }}>
          {icon}
        </div>
      </div>

      <h2 className="kpi-value">{value}</h2>

      {}
      {}
    </div>
  );
}

export default KpiCard;