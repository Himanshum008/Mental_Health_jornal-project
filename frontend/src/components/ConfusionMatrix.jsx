import React from 'react';

export const ConfusionMatrix = ({ data }) => {
  if (!data || !data.labels || !data.matrix) {
    return (
      <div className="p-6 text-center text-slate-400 italic">
        No confusion matrix data available for this model.
      </div>
    );
  }

  const { labels, matrix } = data;
  
  // Find max value in matrix for relative color scaling
  let maxVal = 1;
  matrix.forEach(row => {
    row.forEach(val => {
      if (val > maxVal) maxVal = val;
    });
  });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[450px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Confusion Matrix (Actual vs Predicted)
          </span>
          <span className="text-xs text-slate-400">
            Rows: Actual, Cols: Predicted
          </span>
        </div>

        <table className="w-full border-collapse text-center text-xs">
          <thead>
            <tr>
              <th className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                Actual \ Pred
              </th>
              {labels.map((lbl, idx) => (
                <th
                  key={idx}
                  className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-200"
                >
                  {lbl}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rIdx) => {
              const actualLabel = labels[rIdx];
              return (
                <tr key={rIdx}>
                  <td className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-200 text-left pl-3">
                    {actualLabel}
                  </td>
                  {row.map((count, cIdx) => {
                    const isDiagonal = rIdx === cIdx;
                    const ratio = count / maxVal;
                    
                    // Heatmap background color based on ratio
                    let cellBg = 'bg-transparent text-slate-400';
                    if (count > 0) {
                      if (isDiagonal) {
                        cellBg = ratio > 0.6 
                          ? 'bg-emerald-600 text-white font-bold' 
                          : ratio > 0.3 
                            ? 'bg-emerald-500/70 text-white font-semibold' 
                            : 'bg-emerald-500/30 text-emerald-900 dark:text-emerald-200';
                      } else {
                        cellBg = ratio > 0.4 
                          ? 'bg-rose-500/70 text-white font-medium' 
                          : 'bg-rose-500/20 text-rose-900 dark:text-rose-200';
                      }
                    }

                    return (
                      <td
                        key={cIdx}
                        className={`p-2 border border-slate-200 dark:border-slate-800 transition-colors ${cellBg}`}
                        title={`Actual: ${actualLabel}, Predicted: ${labels[cIdx]} -> ${count} samples`}
                      >
                        {count}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
