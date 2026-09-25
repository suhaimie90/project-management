import { format } from "date-fns";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarIcon, ListChecks, MessageCircle, Paperclip, PenIcon, PlusIcon, XIcon } from "lucide-react";
import { assets } from "../assets/assets";
import { updateTask } from "../features/workspaceSlice";

const TaskDetails = () => {

    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    const user = { id : 'user_1'}
    const [task, setTask] = useState(null);
    const [project, setProject] = useState(null);
    const [comments, setComments] = useState([]);
    const [subtasks, setSubtasks] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [newSubtask, setNewSubtask] = useState("");
    const [loading, setLoading] = useState(true);

    const { currentWorkspace } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();

    const fetchComments = async () => {

    };

    const fetchTaskDetails = async () => {
        setLoading(true);
        if (!projectId || !taskId) return;

        const proj = currentWorkspace.projects.find((p) => p.id === projectId);
        if (!proj) return;

        const tsk = proj.tasks.find((t) => t.id === taskId);
        if (!tsk) return;

        setTask(tsk);
        setProject(proj);
        setSubtasks(tsk.subtasks || []);
        setAttachments(tsk.attachments || []);
        setLoading(false);
    };

    // Keep local state and the Redux store in sync
    const syncTask = (updates) => {
        const updatedTask = { ...task, ...updates };
        setTask(updatedTask);
        dispatch(updateTask(updatedTask));
    };

    const handleAddSubtask = (e) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;

        syncTask({ subtasks: [...subtasks, { id: Date.now(), title: newSubtask.trim(), completed: false }] });
        setNewSubtask("");
        toast.success("Subtask added.");
    };

    const handleToggleSubtask = (id) => {
        syncTask({ subtasks: subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)) });
    };

    const handleDeleteSubtask = (id) => {
        syncTask({ subtasks: subtasks.filter((s) => s.id !== id) });
        toast.success("Subtask deleted.");
    };

    const handleAddAttachment = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        syncTask({ attachments: [...attachments, { id: Date.now(), name: file.name, url: "#", createdAt: new Date().toISOString() }] });
        e.target.value = "";
        toast.success("Attachment added.");
    };

    const handleDeleteAttachment = (id) => {
        syncTask({ attachments: attachments.filter((a) => a.id !== id) });
        toast.success("Attachment deleted.");
    };

    const handleAssigneeChange = async (userId) => {
        try {
            const member = project.members.find((m) => m.user.id === userId);
            if (!member) return;

            toast.loading("Updating assignee...");

            //  Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const updatedTask = { ...task, assigneeId: member.userId, assignee: member.user };
            dispatch(updateTask(updatedTask));
            setTask(updatedTask);

            toast.dismissAll();
            toast.success("Assignee updated successfully");
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.response?.data?.message || error.message);
            console.error(error);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {

            toast.loading("Adding comment...");

            //  Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const dummyComment = { id: Date.now(), user: { id: 1, name: "User", image: assets.profile_img_a }, content: newComment, createdAt: new Date() };
            
            setComments((prev) => [...prev, dummyComment]);
            setNewComment("");
            toast.dismissAll();
            toast.success("Comment added.");
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.response?.data?.message || error.message);
            console.error(error);
        }
    };

    useEffect(() => { fetchTaskDetails(); }, [taskId]);

    useEffect(() => {
        if (taskId && task) {
            fetchComments();
            const interval = setInterval(() => { fetchComments(); }, 10000);
            return () => clearInterval(interval);
        }
    }, [taskId, task]);

    if (loading) return <div className="text-gray-500 dark:text-zinc-400 px-4 py-6">Loading task details...</div>;
    if (!task) return <div className="text-red-500 px-4 py-6">Task not found.</div>;

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-6 sm:p-4 text-gray-900 dark:text-zinc-100 max-w-6xl mx-auto">
            {/* Left: Comments / Chatbox */}
            <div className="w-full lg:w-2/3">
                <div className="p-5 rounded-md  border border-gray-300 dark:border-zinc-800  flex flex-col lg:h-[80vh]">
                    <h2 className="text-base font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                        <MessageCircle className="size-5" /> Task Discussion ({comments.length})
                    </h2>

                    <div className="flex-1 md:overflow-y-scroll no-scrollbar">
                        {comments.length > 0 ? (
                            <div className="flex flex-col gap-4 mb-6 mr-2">
                                {comments.map((comment) => (
                                    <div key={comment.id} className={`sm:max-w-4/5 dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900 border border-gray-300 dark:border-zinc-700 p-3 rounded-md ${comment.user.id === user?.id ? "ml-auto" : "mr-auto"}`} >
                                        <div className="flex items-center gap-2 mb-1 text-sm text-gray-500 dark:text-zinc-400">
                                            <img src={comment.user.image} alt="avatar" className="size-5 rounded-full" />
                                            <span className="font-medium text-gray-900 dark:text-white">{comment.user.name}</span>
                                            <span className="text-xs text-gray-400 dark:text-zinc-600">
                                                • {format(new Date(comment.createdAt), "dd MMM yyyy, HH:mm")}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-900 dark:text-zinc-200">{comment.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-zinc-500 mb-4 text-sm">No comments yet. Be the first!</p>
                        )}
                    </div>

                    {/* Add Comment */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md p-2 text-sm text-gray-900 dark:text-zinc-200 resize-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                            rows={3}
                        />
                        <button onClick={handleAddComment} className="bg-gradient-to-l from-blue-500 to-blue-600 transition-colors text-white text-sm px-5 py-2 rounded " >
                            Post
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Task + Project Info */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
                {/* Task Info */}
                <div className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 ">
                    <div className="mb-3">
                        <h1 className="text-lg font-medium text-gray-900 dark:text-zinc-100">{task.title}</h1>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-300 text-xs">
                                {task.status}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-300 text-xs">
                                {task.type}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-green-200 dark:bg-emerald-900 text-green-900 dark:text-emerald-300 text-xs">
                                {task.priority}
                            </span>
                        </div>
                    </div>

                    {task.description && (
                        <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed mb-4">{task.description}</p>
                    )}

                    <hr className="border-zinc-200 dark:border-zinc-700 my-3" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-zinc-300">
                        <div className="flex items-center gap-2">
                            <select
                                value={task.assignee?.id || ""}
                                onChange={(e) => handleAssigneeChange(e.target.value)}
                                className="bg-transparent outline-none rounded px-1 -ml-1 text-sm text-gray-700 dark:text-zinc-300 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                {project?.members?.map((m) => (
                                    <option key={m.id} value={m.user.id} className="dark:bg-zinc-900">
                                        {m.user.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="size-4 text-gray-500 dark:text-zinc-500" />
                            Due : {format(new Date(task.due_date), "dd MMM yyyy")}
                        </div>
                    </div>

                    {/* Subtasks */}
                    <hr className="border-zinc-200 dark:border-zinc-700 my-3" />
                    <div className="mb-1">
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                            <ListChecks className="size-4" /> Subtasks ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
                        </h3>

                        <div className="flex flex-col mt-3">
                            {subtasks.map((subtask) => (
                                <div key={subtask.id} className="group flex items-center gap-2 py-1 text-sm text-gray-700 dark:text-zinc-300">
                                    <input
                                        type="checkbox"
                                        checked={subtask.completed}
                                        onChange={() => handleToggleSubtask(subtask.id)}
                                        className="size-3.5 accent-blue-600"
                                    />
                                    <span className={`flex-1 ${subtask.completed ? "line-through text-zinc-400 dark:text-zinc-500" : ""}`}>{subtask.title}</span>
                                    <button onClick={() => handleDeleteSubtask(subtask.id)} className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity" >
                                        <XIcon className="size-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mt-2">
                            <input
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                placeholder="Add a subtask..."
                                className="flex-1 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 text-sm text-gray-900 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                            <button type="submit" className="p-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700" >
                                <PlusIcon className="size-4" />
                            </button>
                        </form>
                    </div>

                    {/* Attachments */}
                    <hr className="border-zinc-200 dark:border-zinc-700 my-3" />
                    <div>
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                            <Paperclip className="size-4" /> Attachments ({attachments.length})
                        </h3>

                        <div className="flex flex-col gap-1 mt-3">
                            {attachments.map((attachment) => (
                                <div key={attachment.id} className="group flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
                                    <Paperclip className="size-3.5 text-zinc-400" />
                                    <span className="flex-1 truncate">{attachment.name}</span>
                                    <button onClick={() => handleDeleteAttachment(attachment.id)} className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity" >
                                        <XIcon className="size-3.5" />
                                    </button>
                                </div>
                            ))}
                            {attachments.length === 0 && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">No attachments yet.</p>
                            )}
                        </div>

                        <label className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded text-sm cursor-pointer bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                            <PlusIcon className="size-3.5" /> Add Attachment
                            <input type="file" onChange={handleAddAttachment} className="hidden" />
                        </label>
                    </div>
                </div>

                {/* Project Info */}
                {project && (
                    <div className="p-4 rounded-md bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-gray-300 dark:border-zinc-800 ">
                        <p className="text-xl font-medium mb-4">Project Details</p>
                        <h2 className="text-gray-900 dark:text-zinc-100 flex items-center gap-2"> <PenIcon className="size-4" /> {project.name}</h2>
                        <p className="text-xs mt-3">Project Start Date: {format(new Date(project.start_date), "dd MMM yyyy")}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-zinc-400 mt-3">
                            <span>Status: {project.status}</span>
                            <span>Priority: {project.priority}</span>
                            <span>Progress: {project.progress}%</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskDetails;
