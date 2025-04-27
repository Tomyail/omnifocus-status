'use client';

import { useMemo, useEffect } from 'react';
import { format, eachDayOfInterval, subDays, getDay, getMonth } from 'date-fns';

export interface Task {
  status?: string;
  taskStatus?: string | number;
  modified?: string; // Keep if needed elsewhere, otherwise remove
  completionDate?: string | null; // Add completion date
  name: string;
  primaryKey: string;
  [key: string]: any; // Allow for additional properties
}

interface ActivityHeatmapProps {
  tasks: Task[];
}

interface DayData {
  date: Date;
  dateStr: string;
  count: number;
  level: number;
}

export default function ActivityHeatmap({ tasks = [] }: ActivityHeatmapProps) {
  // Ensure tasks is an array even if undefined or null is passed
  const validTasks = Array.isArray(tasks) ? tasks : [];
  
  const today = new Date();
  const startDate = subDays(today, 365); // Show a year of data

  // For debugging - log detailed task information
  useEffect(() => {
    console.log('Tasks received by component:', validTasks.length);
    
    if (validTasks.length > 0) {
      console.log('Sample task:', validTasks[0]);
      
      // Check status values
      const statusValues = new Set();
      
      validTasks.forEach(task => {
        if (task.status !== undefined) statusValues.add(task.status);
      });
      
      console.log('Status values found:', Array.from(statusValues));
      
      // Count completed tasks (case insensitive)
      const completedTasks = validTasks.filter(
        task => task.status && task.status.toLowerCase() === 'completed'
      );
      console.log('Completed tasks (case insensitive):', completedTasks.length);
      
      // Check completion dates
      const completionDates = validTasks
        .filter(task => task.completionDate)
        .map(task => task.completionDate ? new Date(task.completionDate) : null)
        .filter(date => date !== null) as Date[]; // Filter out nulls and assert type
      
      if (completionDates.length > 0) {
        console.log('Sample completion dates:', 
          completionDates.slice(0, 3).map(d => d.toISOString())
        );
      }
    }
  }, [validTasks]);

  // Generate all dates and task data for the heatmap
  const { dates, tasksByDate, weeks, monthLabels } = useMemo(() => {
    // Generate all dates for the interval
    const allDates = eachDayOfInterval({
      start: startDate,
      end: today
    });

    // Initialize task count map
    const taskMap: Record<string, number> = {};
    allDates.forEach(date => { taskMap[format(date, 'yyyy-MM-dd')] = 0; });

    // Count completed tasks
    validTasks.forEach(task => {
      // Check for completed status - case insensitive comparison and handle different formats
      const status = task.status || task.taskStatus;
      // Use completionDate for aggregation
      if (status && typeof status === 'string' && status.toLowerCase() === 'completed' && task.completionDate) {
        try {
          // Parse the date, handling potential invalid dates
          const completionDateValue = new Date(task.completionDate);
          
          // Check if date is valid
          if (!isNaN(completionDateValue.getTime())) {
            const dateStr = format(completionDateValue, 'yyyy-MM-dd');
            
            if (taskMap[dateStr] !== undefined) {
              taskMap[dateStr]++;
            }
          }
        } catch (error) {
          console.error('Error parsing date for task:', task.primaryKey, error);
        }
      }
    });

    // Generate weeks array first
    const allWeeks: (DayData | null)[][] = [];
    let currentWeek: (DayData | null)[] = [];
    const firstDay = getDay(startDate);
    for (let i = 0; i < firstDay; i++) currentWeek.push(null);

    allDates.forEach((date, index) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = taskMap[dateStr];
      const dayData: DayData = { date, dateStr, count, level: getIntensityLevel(count) };
      currentWeek.push(dayData);

      if (getDay(date) === 6 || index === allDates.length - 1) {
        while (currentWeek.length < 7) currentWeek.push(null);
        allWeeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    // Calculate Month Labels based on weeks
    const finalMonthLabels: { month: string; left: number }[] = [];
    const cellWidth = 12; // w-3
    const cellMargin = 4; // m-0.5 * 2
    const weekWidth = cellWidth + cellMargin;
    let lastMonthAdded = -1;

    allWeeks.forEach((week, weekIndex) => {
      const firstValidDayInWeek = week.find(day => day !== null);
      if (firstValidDayInWeek) {
        const currentMonth = getMonth(firstValidDayInWeek.date);
        if (currentMonth !== lastMonthAdded) {
          // Found a new month
          finalMonthLabels.push({
            month: format(firstValidDayInWeek.date, 'MMM'),
            left: weekIndex * weekWidth, // Position based on the index of this week
          });
          lastMonthAdded = currentMonth;
        }
      }
    });

    console.log('Calculated finalMonthLabels based on weeks:', finalMonthLabels); // Debugging

    return {
      dates: allDates,
      tasksByDate: taskMap,
      weeks: allWeeks,
      monthLabels: finalMonthLabels // Use the newly calculated labels
    };
  }, [tasks, startDate, today]); // Make sure dependencies are correct

  // Calculate the intensity level (0-4) for each cell
  function getIntensityLevel(count: number): number {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  }

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      {/* Main layout: Fixed weekdays on left, scrollable content on right */}
      <div className="flex">
        {/* Weekday Labels - Fixed */}
        <div className="flex flex-col mr-2 text-xs text-gray-500 dark:text-gray-400 shrink-0" style={{ width: '30px' }}>
          {/* Placeholder for month label row height */}
          <div className="h-8 mb-1"></div> 
          {/* Actual Weekday labels aligned with grid (Sunday = row 0) */}
          {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((dayLabel, index) => (
            <div 
              key={`weekday-${index}`}
              className="h-3 m-0.5 flex items-center" // Match cell height + margin
            >
              {dayLabel}
            </div>
          ))}
        </div>

        {/* Scrollable container for Months and Grid */}
        <div className="flex-grow overflow-x-auto">
          {/* Month Labels - Now inside scrollable area */}
          <div className="relative h-8 mb-1" style={{ minWidth: `${weeks.length * 14}px` }}> {/* Use minWidth based on weeks */} 
            <div className="relative w-full">
              {monthLabels.map((monthLabel, index) => (
                <div 
                  key={`month-${index}`}
                  className="absolute top-0 text-xs text-gray-500 dark:text-gray-400"
                  style={{ 
                    left: `${monthLabel.left}px` // Use calculated left position
                  }}
                >
                  {monthLabel.month}
                </div>
              ))}
            </div>
          </div>

          {/* Grid Columns (Weeks) - Now inside scrollable area */}
          <div className="flex"> {/* Removed overflow-x-auto from here */}
            {weeks.map((week, weekIndex) => (
              <div key={`week-${weekIndex}`} className="flex flex-col">
                {week.map((day, dayIndex) => (
                  <div 
                    key={`day-${weekIndex}-${dayIndex}`}
                    className={`w-3 h-3 m-0.5 rounded-sm relative group border border-gray-200 dark:border-gray-600 ${day ? getLevelColor(day.level) : 'bg-gray-100 dark:bg-gray-700 opacity-50'}`}
                    title={day ? `${format(day.date, 'yyyy-MM-dd')}: ${day.count} tasks` : ''}
                  >
                    {day && day.count > 0 && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                        {format(day.date, 'yyyy-MM-dd')}: {day.count} tasks
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend (remains outside the scrolling area) */}
      <div className="flex items-center justify-end mt-2 text-xs text-gray-500 dark:text-gray-400">
        <div>Less</div>
        <div className="flex mx-2">
          {[0, 1, 2, 3, 4].map(level => (
            <div 
              key={`legend-${level}`}
              className={`w-3 h-3 mx-0.5 rounded-sm ${getLevelColor(level)}`}
            />
          ))}
        </div>
        <div>More</div>
      </div>
    </div>
  );
}

function getLevelColor(level: number): string {
  switch (level) {
    case 0: return 'bg-gray-100 dark:bg-gray-700';
    case 1: return 'bg-green-100 dark:bg-green-900';
    case 2: return 'bg-green-300 dark:bg-green-700';
    case 3: return 'bg-green-500 dark:bg-green-500';
    case 4: return 'bg-green-700 dark:bg-green-300';
    default: return 'bg-gray-100 dark:bg-gray-700';
  }
}

// For debugging - log the color mapping
console.log('Color mapping:', {
  'Level 0 (No tasks)': getLevelColor(0),
  'Level 1 (1-2 tasks)': getLevelColor(1),
  'Level 2 (3-5 tasks)': getLevelColor(2),
  'Level 3 (6-10 tasks)': getLevelColor(3),
  'Level 4 (>10 tasks)': getLevelColor(4)
});
