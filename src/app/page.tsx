import ActivityHeatmap, { Task } from '@/components/ActivityHeatmap'; // Use default import for component, named for type
import { db } from '@/db'; // Import the db client
import { tasks as tasksSchema } from '@/db/schema'; // Import the tasks schema
import { desc } from 'drizzle-orm'; // Import desc for ordering
import { format } from 'date-fns';
import AuthHeader from '@/components/auth-header';

// Force dynamic rendering
export const revalidate = 0;

// Define the type for tasks fetched directly from the database
interface DbTask {
  id: number;
  primaryKey: string;
  name: string;
  status: string | null; // Status can be null in the DB
  added: Date | null;
  modified: Date | null;
  completed: Date | null;
  completionDate: Date | null;
  importedAt: Date;
}

// Function to fetch the latest tasks from the database
async function getLatestTasksData(): Promise<Task[]> {
  console.log('Fetching latest tasks from database...');
  try {
    // Fetch all tasks, ordered by import date descending, limit if needed
    const latestTasksFromDb: DbTask[] = await db
      .select()
      .from(tasksSchema)
      .orderBy(desc(tasksSchema.importedAt)) // Get the most recently imported set
      // If you only want the *very* latest import batch, you might need
      // to group by importedAt or fetch the latest importedAt first.
      // For now, fetching all tasks might be simpler.
      // .limit(1000); // Example: Limit the number of tasks fetched

    if (!latestTasksFromDb || latestTasksFromDb.length === 0) {
      console.log('No tasks found in the database.');
      return [];
    }

    // Construct Task objects directly from the selected DB fields
    const tasks: Task[] = latestTasksFromDb.map((dbTask): Task => ({
      // Map fields from DbTask (schema) to Task interface
      id: dbTask.id,
      primaryKey: dbTask.primaryKey,
      name: dbTask.name,
      status: dbTask.status ?? undefined, // Handle potential null from DB
      // Convert Date objects to ISO strings for the Task interface
      added: dbTask.added?.toISOString() ?? undefined,
      modified: dbTask.modified?.toISOString() ?? undefined, 
      completed: dbTask.completed?.toISOString() ?? undefined,
      completionDate: dbTask.completionDate?.toISOString() ?? null,
      importedAt: dbTask.importedAt,
      // Ensure all required fields for Task interface are mapped
    }));

    console.log(`Fetched ${tasks.length} tasks from the database.`);
    // Add detailed logging for the first few tasks fetched from DB
    // console.log('First 5 tasks from DB:', JSON.stringify(tasks.slice(0, 5), null, 2));

    return tasks;
  } catch (error) {
    console.error('Error fetching tasks from database:', error);
    return []; // Return empty array on error
  }
}

export default async function Home() {
  const taskData = await getLatestTasksData();
  
  // Log task data for debugging
  console.log('Fetched', taskData.length, 'tasks from the database.');
  console.log('Raw taskData sample (first 5):', JSON.stringify(taskData.slice(0, 5), null, 2)); // Log raw data sample
  console.log(`Task data loaded: { count: ${taskData.length}, tasksLength: ${taskData.length} }`);
  
  // Filter out any undefined/null entries before processing
  const validTaskData = taskData.filter(task => task);
  console.log('Filtered taskData length:', validTaskData.length);
  
  // Debugging: Log the first task if available
  console.log('First task in valid data:', validTaskData[0]);
  
  // Get unique status values for debugging
  const statusValues = new Set<string>(); // Be explicit with Set type
  validTaskData.forEach((task: Task) => { // Use Task type here
    if (task.status) statusValues.add(task.status);
  });
  console.log('Status values in loaded data:', Array.from(statusValues));
  
  // Count completed tasks (case insensitive)
  const completedCount = validTaskData.filter(
    (task: Task) => task.status && task.status.toLowerCase() === 'completed'
  ).length;
  console.log('Completed tasks count:', completedCount);
  
  // Handle potentially invalid date by providing a fallback
  let lastUpdated: Date;
  try {
    lastUpdated = new Date();
    // Check if date is valid
    if (isNaN(lastUpdated.getTime())) {
      lastUpdated = new Date();
    }
  } catch (error) {
    console.error('Error parsing date:', error);
    lastUpdated = new Date();
  }
  
  return (
    <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
      <AuthHeader lastUpdated={lastUpdated} />
      
      <main className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Task Completion Activity</h2>
          <ActivityHeatmap tasks={validTaskData} />
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {validTaskData.length}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    validTaskData.filter((task: Task) => // Use Task type, check status exists
                      task.status && task.status.toLowerCase() === 'completed').length
                  }
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {validTaskData.length > 0 ? 
                    Math.round((validTaskData.filter((task: Task) => // Use Task type, check status exists
                      task.status && task.status.toLowerCase() === 'completed').length / validTaskData.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="max-w-5xl mx-auto mt-12 py-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-center text-gray-500 dark:text-gray-400">
          OmniFocus Status Dashboard
        </p>
      </footer>
    </div>
  );
}
