import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Settings, 
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Menu
} from 'lucide-react';
import type { Project, TeamMember } from '@/types';
import { mockDataService } from '@/lib/mockData';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'team', label: 'Team Members', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'project' | 'member' | null>(null);
  const [editingItem, setEditingItem] = useState<Project | TeamMember | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [projectsData, membersData] = await Promise.all([
      mockDataService.getProjects(),
      mockDataService.getTeamMembers(),
    ]);
    setProjects(projectsData);
    setTeamMembers(membersData);
    setLoading(false);
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await mockDataService.deleteProject(id);
      fetchData();
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm('Are you sure you want to delete this team member?')) {
      await mockDataService.deleteTeamMember(id);
      fetchData();
    }
  };

  const openModal = (type: 'project' | 'member', item?: Project | TeamMember) => {
    setModalType(type);
    setEditingItem(item || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setModalType(null);
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMembers = teamMembers.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 admin-sidebar border-r border-white/10 flex-shrink-0 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-white flex items-center justify-center">
              <LayoutDashboard className="w-4 sm:w-5 h-4 sm:h-5 text-black" />
            </div>
            <span className="font-bold text-white text-sm sm:text-base">Admin Panel</span>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-left transition-all text-sm ${
                    activeTab === item.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 sm:w-5 h-4 sm:h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm">
            <LogOut className="w-4 sm:w-5 h-4 sm:h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 glass-strong border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-white capitalize">
                {activeTab === 'dashboard' ? 'Dashboard' : activeTab}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 rounded-lg glass text-white text-xs sm:text-sm placeholder:text-white/40 focus:outline-none focus:border-white/20 w-32 sm:w-48 lg:w-64"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardContent 
              projects={projects} 
              teamMembers={teamMembers} 
            />
          )}
          
          {activeTab === 'projects' && (
            <ProjectsContent
              projects={filteredProjects}
              onAdd={() => openModal('project')}
              onEdit={(p) => openModal('project', p)}
              onDelete={handleDeleteProject}
              loading={loading}
            />
          )}
          
          {activeTab === 'team' && (
            <TeamContent
              members={filteredMembers}
              onAdd={() => openModal('member')}
              onEdit={(m) => openModal('member', m)}
              onDelete={handleDeleteMember}
              loading={loading}
            />
          )}
          
          {activeTab === 'settings' && (
            <SettingsContent />
          )}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <Modal
            type={modalType}
            item={editingItem}
            onClose={closeModal}
            onSave={fetchData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Dashboard Content
function DashboardContent({ projects, teamMembers }: { projects: Project[]; teamMembers: TeamMember[] }) {
  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderOpen },
    { label: 'Team Members', value: teamMembers.length, icon: Users },
    { label: 'Ongoing Projects', value: projects.filter(p => p.status === 'ongoing').length, icon: CheckCircle2 },
    { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6"
            >
              <div className="w-8 sm:w-12 h-8 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center mb-2 sm:mb-4">
                <Icon className="w-4 sm:w-6 h-4 sm:h-6 text-white/40" />
              </div>
              <p className="text-white/40 text-[10px] sm:text-sm">{stat.label}</p>
              <p className="text-xl sm:text-3xl font-bold text-white mt-0.5 sm:mt-1">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Recent Projects</h3>
          <div className="space-y-2 sm:space-y-3">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-white/5">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs sm:text-sm font-medium truncate">{project.title}</p>
                  <p className="text-white/40 text-[10px] sm:text-xs">{project.category}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${
                  project.status === 'ongoing'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Team Overview</h3>
          <div className="space-y-2 sm:space-y-3">
            {teamMembers.slice(0, 5).map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-white/5">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 sm:w-12 h-10 sm:h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs sm:text-sm font-medium truncate">{member.name}</p>
                  <p className="text-white/40 text-[10px] sm:text-xs">{member.role}</p>
                </div>
                <span className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${member.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Projects Content
function ProjectsContent({ 
  projects, 
  onAdd, 
  onEdit, 
  onDelete, 
  loading 
}: { 
  projects: Project[]; 
  onAdd: () => void; 
  onEdit: (p: Project) => void; 
  onDelete: (id: string) => void;
  loading: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white">All Projects</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors text-xs sm:text-sm"
        >
          <Plus className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          <span className="hidden sm:inline">Add Project</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {loading ? (
        <div className="glass rounded-xl sm:rounded-2xl h-64 sm:h-96 animate-pulse" />
      ) : (
        <div className="glass rounded-xl sm:rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-white/40 font-medium text-[10px] sm:text-xs">Project</th>
                <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-white/40 font-medium text-[10px] sm:text-xs">Category</th>
                <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-white/40 font-medium text-[10px] sm:text-xs">Status</th>
                <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-white/40 font-medium text-[10px] sm:text-xs hidden sm:table-cell">Date</th>
                <th className="text-right px-3 sm:px-6 py-3 sm:py-4 text-white/40 font-medium text-[10px] sm:text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg object-cover"
                      />
                      <span className="text-white text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-none">{project.title}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-white/40 text-[10px] sm:text-xs capitalize">{project.category}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${
                      project.status === 'ongoing'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                    <span className="text-white/40 text-xs">
                      {new Date(project.startDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => onEdit(project)}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(project.id)}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Team Content
function TeamContent({ 
  members, 
  onAdd, 
  onEdit, 
  onDelete, 
  loading 
}: { 
  members: TeamMember[]; 
  onAdd: () => void; 
  onEdit: (m: TeamMember) => void; 
  onDelete: (id: string) => void;
  loading: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white">Team Members</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors text-xs sm:text-sm"
        >
          <Plus className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          <span className="hidden sm:inline">Add Member</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {loading ? (
        <div className="glass rounded-xl sm:rounded-2xl h-64 sm:h-96 animate-pulse" />
      ) : (
        <div className="glass rounded-xl sm:rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-white/40 font-medium text-[10px] sm:text-xs">Member</th>
                <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-white/40 font-medium text-[10px] sm:text-xs">Role</th>
                <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-white/40 font-medium text-[10px] sm:text-xs">Status</th>
                <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-white/40 font-medium text-[10px] sm:text-xs hidden sm:table-cell">Joined</th>
                <th className="text-right px-3 sm:px-6 py-3 sm:py-4 text-white/40 font-medium text-[10px] sm:text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 sm:w-10 h-8 sm:h-10 rounded-full object-cover"
                      />
                      <span className="text-white text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-none">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-white/40 text-[10px] sm:text-xs">{member.role}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${
                      member.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                    <span className="text-white/40 text-xs">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => onEdit(member)}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(member.id)}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Settings Content
function SettingsContent() {
  return (
    <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
      <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-4 sm:mb-6">Settings</h2>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-white/40 text-xs sm:text-sm mb-1.5 sm:mb-2">Site Name</label>
          <input
            type="text"
            defaultValue="VLSI & AI Robotics Lab"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg glass text-white text-xs sm:text-sm focus:outline-none focus:border-white/20"
          />
        </div>
        <div>
          <label className="block text-white/40 text-xs sm:text-sm mb-1.5 sm:mb-2">Contact Email</label>
          <input
            type="email"
            defaultValue="contact@lab.edu"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg glass text-white text-xs sm:text-sm focus:outline-none focus:border-white/20"
          />
        </div>
        <div className="flex items-center justify-end">
          <button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors text-xs sm:text-sm">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal Component
function Modal({ 
  type, 
  item, 
  onClose, 
  onSave 
}: { 
  type: 'project' | 'member' | null; 
  item: Project | TeamMember | null; 
  onClose: () => void;
  onSave: () => void;
}) {
  if (!type) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-strong rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white">
            {item ? 'Edit' : 'Add'} {type === 'project' ? 'Project' : 'Team Member'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-white/40 transition-colors"
          >
            <XCircle className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {type === 'project' ? (
            <>
              <div>
                <label className="block text-white/40 text-xs sm:text-sm mb-1.5">Title</label>
                <input
                  type="text"
                  defaultValue={(item as Project)?.title || ''}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg glass text-white text-xs sm:text-sm focus:outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="block text-white/40 text-xs sm:text-sm mb-1.5">Short Description</label>
                <textarea
                  defaultValue={(item as Project)?.shortDescription || ''}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg glass text-white text-xs sm:text-sm focus:outline-none focus:border-white/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-white/40 text-xs sm:text-sm mb-1.5">Category</label>
                  <select
                    defaultValue={(item as Project)?.category || 'vlsi'}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg glass text-white text-xs sm:text-sm focus:outline-none focus:border-white/20"
                  >
                    <option value="vlsi">VLSI</option>
                    <option value="ai-robotics">AI & Robotics</option>
                    <option value="research">Research</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/40 text-xs sm:text-sm mb-1.5">Status</label>
                  <select
                    defaultValue={(item as Project)?.status || 'ongoing'}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg glass text-white text-xs sm:text-sm focus:outline-none focus:border-white/20"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-white/40 text-xs sm:text-sm mb-1.5">Name</label>
                <input
                  type="text"
                  defaultValue={(item as TeamMember)?.name || ''}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg glass text-white text-xs sm:text-sm focus:outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="block text-white/40 text-xs sm:text-sm mb-1.5">Role</label>
                <input
                  type="text"
                  defaultValue={(item as TeamMember)?.role || ''}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg glass text-white text-xs sm:text-sm focus:outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="block text-white/40 text-xs sm:text-sm mb-1.5">Email</label>
                <input
                  type="email"
                  defaultValue={(item as TeamMember)?.email || ''}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg glass text-white text-xs sm:text-sm focus:outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="block text-white/40 text-xs sm:text-sm mb-1.5">Bio</label>
                <textarea
                  defaultValue={(item as TeamMember)?.bio || ''}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg glass text-white text-xs sm:text-sm focus:outline-none focus:border-white/20"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg glass text-white hover:bg-white/10 transition-colors text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave();
                onClose();
              }}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors text-xs sm:text-sm"
            >
              {item ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
