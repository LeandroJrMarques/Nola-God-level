import React from 'react';
// Não precisamos mais das setas FiArrowUp/Down

// REMOVIDO: change, changeType da definição de props
type KpiCardProps = {
  title: string;
  value: string;
  // REMOVIDO: change: string;
  // REMOVIDO: changeType: 'positive' | 'negative' | 'neutral'; // Adicionado neutral
  icon: React.ReactNode; 
  iconBgColor: string;
};

// REMOVIDO: change, changeType da desestruturação
function KpiCard({ 
  title, 
  value, 
  icon, 
  iconBgColor 
}: KpiCardProps) {
  
  // REMOVIDO: const isPositive = ...

  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        <div className="kpi-icon-wrapper" style={{ backgroundColor: iconBgColor }}>
          {icon}
        </div>
      </div>

      <h2 className="kpi-value">{value}</h2>

      {/* =======================================================
          APAGADA A DIV INTEIRA QUE MOSTRAVA A VARIAÇÃO
         ======================================================= */}
      {/* <div className={`kpi-change ${changeType}`}>
         {changeType === 'positive' ? <FiArrowUp size={14} /> : changeType === 'negative' ? <FiArrowDown size={14} /> : null}
         <span>{change}</span>
         <span className="kpi-change-label">vs mês anterior</span>
       </div> 
      */}
    </div>
  );
}

export default KpiCard;