'use client';

import { useMemo, useEffect } from 'react';
import { format, eachDayOfInterval, subDays, getDay, getMonth } from 'date-fns';

export interface Task {
  status?: string;
  taskStatus?: string | number;
  modified: string;
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
      const taskStatusValues = new Set();
      
      validTasks.forEach(task => {
        if (task.status) statusValues.add(task.status);
        if (task.taskStatus) taskStatusValues.add(task.taskStatus);
      });
      
      console.log('Status values found:', Array.from(statusValues));
      console.log('TaskStatus values found:', Array.from(taskStatusValues));
      
      // Count completed tasks (case insensitive)
      const completedTasks = validTasks.filter(
        task => task.status && task.status.toLowerCase() === 'completed'
      );
      console.log('Completed tasks (case insensitive):', completedTasks.length);
      
      // Check modified dates
      const modifiedDates = validTasks
        .filter(task => task.modified)
        .map(task => new Date(task.modified));
      
      if (modifiedDates.length > 0) {
        console.log('Sample modified dates:', 
          modifiedDates.slice(0, 3).map(d => d.toISOString())
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
      if (status && typeof status === 'string' && status.toLowerCase() === 'completed' && task.modified) {
        try {
          // Parse the date, handling potential invalid dates
          const modifiedDate = new Date(task.modified);
          
          // Check if date is valid
          if (!isNaN(modifiedDate.getTime())) {
            const dateStr = format(modifiedDate, 'yyyy-MM-dd');
            
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
      {/* Month Labels */}
      <div className="relative h-8 ml-10 mb-1"> {/* Adjusted ml-10 */} 
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
      
      {/* Heatmap Grid */}
      <div className="flex">
        {/* Weekday Labels - Aligned with grid rows */}
        <div className="flex flex-col mr-2 text-xs text-gray-500 dark:text-gray-400 shrink-0" style={{ width: '30px' }}>
          {/* Mirror the 7 day cells vertically */} 
          {['Mon', '', 'Wed', '', 'Fri', '', ''].map((dayLabel, index) => (
            <div 
              key={`weekday-${index}`}
              className="h-3 m-0.5 flex items-center" // Match cell height + margin
            >
              {dayLabel}
            </div>
          ))}
        </div>

        {/* Grid Columns (Weeks) - Remove overflow to prevent scrollbar */}
        <div className="flex"> 
          {weeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className="flex flex-col">
              {week.map((day, dayIndex) => (
                <div 
                  key={`day-${weekIndex}-${dayIndex}`}
                  className={`w-3 h-3 m-0.5 rounded-sm relative group ${day ? getLevelColor(day.level) : 'opacity-0'}`}
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
      
      {/* Legend */}
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
    case 0: return 'bg-gray-100 dark:bg-gray-800';
    case 1: return 'bg-green-100 dark:bg-green-900';
    case 2: return 'bg-green-300 dark:bg-green-700';
    case 3: return 'bg-green-500 dark:bg-green-500';
    case 4: return 'bg-green-700 dark:bg-green-300';
    default: return 'bg-gray-100 dark:bg-gray-800';
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
