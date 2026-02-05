import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, LogOut, User as UserIcon, FolderOpen, Shield } from 'lucide-react';
import { toast } from 'sonner';

import type { Project } from '@/types';
import { deleteProject, getProjectsForMember, signOut } from '@/lib/supabase';
import { useMemberSession } from '@/features/member/context/MemberContext';
import { logMemberAction } from '@/lib/activityLogs';

export function MemberDashboard() {
  const navigate = useNavigate();
  const { user, member } = useMemberSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    const data = await getProjectsForMember(member.id);
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [member.id]);

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const project = projects.find((p) => p.id === id);
      await deleteProject(id);
      toast.success('Project deleted successfully');
      await logMemberAction(
        {
          action: 'delete',
          entityType: 'project',
          entityId: id,
          entitySlug: project?.slug,
          entityName: project?.title,
          message: `Deleted project "${project?.title || 'Unknown'}"`,
        },
        user,
        member
      );
      fetchProjects();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white text-lg font-semibold">Member Portal</h1>
              <p className="text-white/40 text-xs">Manage your profile and projects</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Profile Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40">
                <UserIcon className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white text-lg font-semibold">{member.name}</h2>
            <p className="text-white/50 text-sm">{member.role}</p>
            <p className="text-white/40 text-xs mt-1">{member.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/member/profile')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
            <button
              onClick={() => window.open(`/team/${member.slug}`, '_blank')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/15 text-sm transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Public Profile
            </button>
          </div>
        </motion.section>

        {/* Projects Section */}
        <section className="glass rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-white/50" />
              <h3 className="text-white text-base font-semibold">Assigned Projects</h3>
            </div>
            <button
              onClick={() => navigate('/member/projects/new')}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {loading ? (
            <div className="h-40 sm:h-56 rounded-xl bg-white/5 animate-pulse" />
          ) : projects.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-white/50 text-sm">No assigned projects yet.</p>
              <button
                onClick={() => navigate('/member/projects/new')}
                className="mt-3 text-white/70 hover:text-white text-sm underline"
              >
                Create your first project
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="text-left px-3 py-3 text-white/40 font-medium text-xs">Project</th>
                    <th className="text-left px-3 py-3 text-white/40 font-medium text-xs">Status</th>
                    <th className="text-left px-3 py-3 text-white/40 font-medium text-xs">Visibility</th>
                    <th className="text-right px-3 py-3 text-white/40 font-medium text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={project.thumbnail}
                            alt={project.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-white text-sm font-medium">{project.title}</p>
                            <p className="text-white/30 text-xs">/{project.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          project.status === 'ongoing'
                            ? 'bg-blue-500/20 text-blue-400'
                            : project.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : project.status === 'draft'
                            ? 'bg-gray-500/20 text-gray-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          project.visibility === 'public'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {project.visibility}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => window.open(`/portfolio/${project.slug}`, '_blank')}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/member/projects/${project.slug}`)}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
