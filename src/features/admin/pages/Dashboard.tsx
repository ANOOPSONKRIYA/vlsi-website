import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  Users, 
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Project, TeamMember, ActivityLog } from '@/types';
import { mockDataService } from '@/lib/dataService';
import { getActivityLogs } from '@/lib/supabase';
import { logAdminAction } from '@/lib/activityLogs';
import { AdminLayout } from '@/features/admin/components/AdminLayout';

export function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [projectsData, membersData] = await Promise.all([
      mockDataService.getProjects(),
      mockDataService.getTeamMembers(),
    ]);
    setProjects(projectsData);
    setTeamMembers(membersData);
    setLoading(false);
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    const data = await getActivityLogs(100);
    setLogs(data);
    setLogsLoading(false);
  };

  useEffect(() => {
    fetchData();
    fetchLogs();
  }, []);

  const handleDeleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        const project = projects.find((p) => p.id === id);
        await mockDataService.deleteProject(id);
        toast.success('Project deleted successfully');
        await logAdminAction({
          action: 'delete',
          entityType: 'project',
          entityId: id,
          entitySlug: project?.slug,
          entityName: project?.title,
          message: `Deleted project "${project?.title || 'Unknown'}"`,
        });
        fetchData();
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const handleViewProject = (slug: string) => {
    window.open(`/portfolio/${slug}`, '_blank');
  };

  const handleViewMember = (slug: string) => {
    window.open(`/team/${slug}`, '_blank');
  };

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderOpen, onClick: () => navigate('/admin/projects') },
    { label: 'Team Members', value: teamMembers.length, icon: Users, onClick: () => navigate('/admin/team') },
    { label: 'Ongoing Projects', value: projects.filter(p => p.status === 'ongoing').length, icon: CheckCircle2, onClick: () => navigate('/admin/projects') },
    { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, icon: CheckCircle2, onClick: () => navigate('/admin/projects') },
  ];

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.button
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={stat.onClick}
                className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left hover:bg-white/[0.05] transition-colors"
              >
                <div className="w-8 sm:w-12 h-8 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center mb-2 sm:mb-4">
                  <Icon className="w-4 sm:w-6 h-4 sm:h-6 text-white/40" />
                </div>
                <p className="text-white/40 text-[10px] sm:text-sm">{stat.label}</p>
                <p className="text-xl sm:text-3xl font-bold text-white mt-0.5 sm:mt-1">{stat.value}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white">Recent Projects</h3>
                <p className="text-white/40 text-xs sm:text-sm">Latest portfolio projects</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/admin/portfolio/new')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-xs font-medium rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
                <button 
                  onClick={() => navigate('/admin/projects')}
                  className="text-xs text-white/40 hover:text-white transition-colors"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {loading ? (
                <div className="h-32 rounded-xl bg-white/5 animate-pulse" />
              ) : projects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-white/5 group hover:bg-white/[0.07] transition-colors">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs sm:text-sm font-medium truncate">{project.title}</p>
                    <p className="text-white/40 text-[10px] sm:text-xs capitalize">{project.category}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleViewProject(project.slug)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                      title="View on site"
                    >
                      <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/portfolio/${project.slug}`)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {!loading && projects.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/40 text-sm">No projects yet</p>
                  <button
                    onClick={() => navigate('/admin/portfolio/new')}
                    className="mt-2 text-white/60 hover:text-white text-sm underline"
                  >
                    Create your first project
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Team Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white">Team Overview</h3>
                <p className="text-white/40 text-xs sm:text-sm">Team members and their status</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/admin/team/new')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-xs font-medium rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
                <button 
                  onClick={() => navigate('/admin/team')}
                  className="text-xs text-white/40 hover:text-white transition-colors"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {loading ? (
                <div className="h-32 rounded-xl bg-white/5 animate-pulse" />
              ) : teamMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-white/5 group hover:bg-white/[0.07] transition-colors">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 sm:w-12 h-10 sm:h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs sm:text-sm font-medium truncate">{member.name}</p>
                    <p className="text-white/40 text-[10px] sm:text-xs">{member.role}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${
                      member.status === 'active' ? 'bg-green-400' : 
                      member.status === 'alumni' ? 'bg-amber-400' : 'bg-gray-400'
                    }`} />
                    <button
                      onClick={() => handleViewMember(member.slug)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                      title="View profile"
                    >
                      <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/team/${member.slug}`)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {!loading && teamMembers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/40 text-sm">No team members yet</p>
                  <button
                    onClick={() => navigate('/admin/team/new')}
                    className="mt-2 text-white/60 hover:text-white text-sm underline"
                  >
                    Add your first team member
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Activity Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white">Recent Activity Logs</h2>
              <p className="text-white/40 text-xs sm:text-sm">Track member and admin actions across the site</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchLogs}
                disabled={logsLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors text-xs sm:text-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button 
                onClick={() => navigate('/admin/logs')}
                className="text-xs text-white/40 hover:text-white transition-colors"
              >
                View all
              </button>
            </div>
          </div>

          {logsLoading ? (
            <div className="h-48 rounded-xl bg-white/5 animate-pulse" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-white/40 font-medium text-[10px] sm:text-xs">Time</th>
                    <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-white/40 font-medium text-[10px] sm:text-xs">Actor</th>
                    <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-white/40 font-medium text-[10px] sm:text-xs">Action</th>
                    <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-white/40 font-medium text-[10px] sm:text-xs">Target</th>
                    <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-white/40 font-medium text-[10px] sm:text-xs hidden sm:table-cell">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 5).map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-white/40 text-[10px] sm:text-xs whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="text-white text-xs sm:text-sm font-medium truncate max-w-[160px]">
                          {log.actorName || log.actorEmail || 'Unknown'}
                        </div>
                        <div className="text-white/30 text-[10px] sm:text-xs">
                          {log.actorEmail || log.actorRole || 'user'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-white/50 text-[10px] sm:text-xs uppercase tracking-wide">
                        {log.action}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="text-white text-xs sm:text-sm">
                          {log.entityName || log.entitySlug || log.entityType}
                        </div>
                        <div className="text-white/30 text-[10px] sm:text-xs uppercase">
                          {log.entityType}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-white/40 text-[10px] sm:text-xs max-w-[280px] truncate hidden sm:table-cell">
                        {log.message || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {logs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/40 text-sm">No recent activity</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
