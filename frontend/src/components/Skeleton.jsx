import React from 'react';

const SkeletonMetricCard = () => (
  <div className="glass-panel text-center p-4 min-w-[150px]">
    <div className="h-3 w-16 bg-white/10 rounded mx-auto skeleton-loader mb-3"></div>
    <div className="h-8 w-12 bg-white/10 rounded mx-auto skeleton-loader mb-2"></div>
    <div className="h-3 w-24 bg-white/10 rounded mx-auto skeleton-loader"></div>
  </div>
);

const SkeletonTableRow = ({ columns = 5 }) => (
  <tr className="border-b border-neon-blue/10">
    {Array.from({ length: columns }).map((_, idx) => (
      <td key={idx} className="p-3">
        <div className="h-4 bg-white/10 rounded skeleton-loader w-3/4"></div>
      </td>
    ))}
  </tr>
);

const SkeletonTable = ({ rows = 5, columns = 5 }) => (
  <div className="glass-panel overflow-x-auto">
    <div className="h-6 w-36 bg-white/10 rounded skeleton-loader mb-6"></div>
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-neon-blue/30">
          {Array.from({ length: columns }).map((_, idx) => (
            <th key={idx} className="p-3">
              <div className="h-3 bg-white/15 rounded skeleton-loader w-20"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, idx) => (
          <SkeletonTableRow key={idx} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

const SkeletonChart = () => (
  <div className="glass-panel flex flex-col justify-between min-h-[300px]">
    <div className="h-4 w-40 bg-white/10 rounded skeleton-loader mb-4"></div>
    <div className="flex-1 w-full bg-white/5 rounded skeleton-loader min-h-[200px]"></div>
  </div>
);

const SkeletonProfile = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
    <div className="space-y-6">
      <div className="glass-panel flex flex-col items-center justify-center p-6 text-center">
        <div className="w-32 h-32 rounded-full bg-white/10 skeleton-loader"></div>
        <div className="h-5 w-24 bg-white/10 rounded skeleton-loader mt-4"></div>
        <div className="h-3 w-40 bg-white/10 rounded skeleton-loader mt-2"></div>
      </div>
      <div className="glass-panel p-6 h-40">
        <div className="h-4 w-40 bg-white/10 rounded skeleton-loader mb-4"></div>
        <div className="h-10 w-full bg-white/5 rounded skeleton-loader"></div>
      </div>
    </div>
    <div className="lg:col-span-2 space-y-6">
      <div className="glass-panel p-6 h-64">
        <div className="h-5 w-48 bg-white/10 rounded skeleton-loader mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-white/5 rounded skeleton-loader"></div>
          <div className="h-10 bg-white/5 rounded skeleton-loader"></div>
          <div className="h-10 bg-white/5 rounded skeleton-loader"></div>
          <div className="h-10 bg-white/5 rounded skeleton-loader"></div>
        </div>
      </div>
    </div>
  </div>
);

const Skeleton = ({ type = 'metrics', count = 5, rows = 5, columns = 5 }) => {
  switch (type) {
    case 'metrics':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: count }).map((_, idx) => (
            <SkeletonMetricCard key={idx} />
          ))}
        </div>
      );
    case 'table':
      return <SkeletonTable rows={rows} columns={columns} />;
    case 'chart':
      return <SkeletonChart />;
    case 'profile':
      return <SkeletonProfile />;
    default:
      return null;
  }
};

export default Skeleton;
export { SkeletonMetricCard, SkeletonTable, SkeletonChart, SkeletonProfile };
