import { format } from "date-fns";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateTask } from "../features/workspaceSlice";
import { Bug, CalendarIcon, GitCommit, MessageSquare, Square, Zap } from "lucide-react";

const typeIcons = {
    BUG: { icon: Bug, color: "text-red-600 dark:text-red-400" },
    FEATURE: { icon: Zap, color: "text-blue-600 dark:text-blue-400" },
    TASK: { icon: Square, color: "text-green-600 dark:text-green-400" },
    IMPROVEMENT: { icon: GitCommit, color: "text-purple-600 dark:text-purple-400" },
    OTHER: { icon: MessageSquare, color: "text-amber-600 dark:text-amber-400" },
};

const priorityTexts = {
    LOW: { background: "bg-red-100 dark:bg-red-950", prioritycolor: "text-red-600 dark:text-red-400" },
    MEDIUM: { background: "bg-blue-100 dark:bg-blue-950", prioritycolor: "text-blue-600 dark:text-blue-400" },
    HIGH: { background: "bg-emerald-100 dark:bg-emerald-950", prioritycolor: "text-emerald-600 dark:text-emerald-400" },
};

const columns = [
    { key: "TODO", label: "To Do", accent: "bg-zinc-400 dark:bg-zinc-600" },
    { key: "IN_PROGRESS", label: "In Progress", accent: "bg-amber-400 dark:bg-amber-500" },
    { key: "DONE", label: "Done", accent: "bg-emerald-400 dark:bg-emerald-500" },
];

const ProjectKanban = ({ tasks }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [dragTaskId, setDragTaskId] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    const tasksByStatus = useMemo(() => {
        const grouped = { TODO: [], IN_PROGRESS: [], DONE: [] };
        tasks.forEach((t) => {
            if (grouped[t.status]) grouped[t.status].push(t);
        });
        return grouped;
    }, [tasks]);

    const handleStatusChange = async (task, newStatus) => {
        if (task.status === newStatus) return;

        try {
            toast.loading("Updating status...");

            //  Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            dispatch(updateTask({ ...task, status: newStatus }));

            toast.dismissAll();
            toast.success("Task status updated successfully");
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    return (
        <div className="grid md:grid-cols-3 gap-4">
            {columns.map((column) => (
                <div
                    key={column.key}
                    onDragOver={(e) => { e.preventDefault(); setDragOverColumn(column.key); }}
                    onDragLeave={() => setDragOverColumn((prev) => (prev === column.key ? null : prev))}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragOverColumn(null);
                        const task = tasks.find((t) => t.id === dragTaskId);
                        setDragTaskId(null);
                        if (task) handleStatusChange(task, column.key);
                    }}
                    className={`dark:bg-zinc-900/40 rounded-lg border ${dragOverColumn === column.key ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" : "border-zinc-300 dark:border-zinc-800"} p-3 flex flex-col gap-3 min-h-40`}
                >
                    {/* Column Header */}
                    <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${column.accent}`} />
                        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{column.label}</h3>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{tasksByStatus[column.key].length}</span>
                    </div>

                    {/* Cards */}
                    {tasksByStatus[column.key].map((task) => {
                        const { icon: Icon, color } = typeIcons[task.type] || {};
                        const { background, prioritycolor } = priorityTexts[task.priority] || {};

                        return (
                            <div
                                key={task.id}
                                draggable
                                onDragStart={() => setDragTaskId(task.id)}
                                onDragEnd={() => { setDragTaskId(null); setDragOverColumn(null); }}
                                onClick={() => navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)}
                                className={`bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg p-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow ${dragTaskId === task.id ? "opacity-50" : ""}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{task.title}</h4>
                                    <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${background} ${prioritycolor}`}>
                                        {task.priority}
                                    </span>
                                </div>

                                <div className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                    {Icon && <Icon className={`size-3.5 ${color}`} />}
                                    <span className={`${color} uppercase`}>{task.type}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="size-3.5" />
                                        {format(new Date(task.due_date), "dd MMM")}
                                    </div>
                                    <img src={task.assignee?.image} className="size-5 rounded-full" alt={task.assignee?.name} title={task.assignee?.name} />
                                </div>
                            </div>
                        );
                    })}

                    {tasksByStatus[column.key].length === 0 && (
                        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 py-6">Drop tasks here</p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ProjectKanban;
