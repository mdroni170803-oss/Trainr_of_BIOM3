
import React, { useState, useMemo } from 'react';
import { Search, Plus, Star, Download, Edit2, Trash2, X, User, MapPin, Phone, ExternalLink, Calendar, AlertCircle, Maximize2, UserCheck, UserX, Camera } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Admin } from '../types';

interface AdminSectionProps {
  admins: Admin[];
  onUpdateAdmins: (admins: Admin[]) => void;
}

const AdminSection: React.FC<AdminSectionProps> = ({ admins, onUpdateAdmins }) => {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState<{id: string, rating: number} | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<{id: string, currentStatus: boolean} | null>(null);
  const [deletingAdminConfirm, setDeletingAdminConfirm] = useState<Admin | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const filteredSortedAdmins = useMemo(() => {
    return admins
      .filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.rating - a.rating);
  }, [admins, search]);

  const stats = useMemo(() => {
    return {
      active: admins.filter(a => a.isActive).length,
      inactive: admins.filter(a => !a.isActive).length,
      total: admins.length
    };
  }, [admins]);

  const calculateExperience = (joinDate: string) => {
    const start = new Date(joinDate);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years > 0 ? years + 'y ' : ''}${months > 0 ? months + 'm ' : ''}${days}d`;
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    onUpdateAdmins(admins.map(a => a.id === id ? { ...a, isActive: !currentStatus } : a));
    setConfirmToggle(null);
  };

  const handleUpdateRating = (id: string, newRating: number) => {
    onUpdateAdmins(admins.map(a => a.id === id ? { ...a, rating: newRating } : a));
    setIsRatingModalOpen(null);
  };

  const confirmDeleteAdmin = () => {
    if (deletingAdminConfirm) {
      onUpdateAdmins(admins.filter(a => a.id !== deletingAdminConfirm.id));
      setDeletingAdminConfirm(null);
      setSelectedAdmin(null);
    }
  };

  const downloadDetailsAsImage = async () => {
    const node = document.getElementById('admin-details-card');
    if (node) {
      try {
        const dataUrl = await toPng(node, { cacheBust: true });
        const link = document.createElement('a');
        link.download = `admin_${selectedAdmin?.name.replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Image download failed', error);
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-slate-50 dark:bg-slate-950">
      {/* Search Header */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex gap-2 items-center flex-shrink-0 sticky top-0 z-20">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search admins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
          />
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="px-4 py-3 flex gap-3 overflow-x-auto no-scrollbar flex-shrink-0">
        <div className="flex-1 min-w-[140px] bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active</p>
            <p className="text-xl font-black text-emerald-900 dark:text-emerald-50">{stats.active}</p>
          </div>
        </div>
        <div className="flex-1 min-w-[140px] bg-rose-50 dark:bg-rose-950/30 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <UserX size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Inactive</p>
            <p className="text-xl font-black text-rose-900 dark:text-rose-50">{stats.inactive}</p>
          </div>
        </div>
      </div>

      {/* Admin List */}
      <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-4 touch-pan-y pb-24">
        {filteredSortedAdmins.map((admin, index) => (
          <div 
            key={admin.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col items-center justify-center min-w-[32px]">
              <span className="text-slate-300 font-black text-lg leading-none">{index + 1}</span>
            </div>
            
            <div className="flex-1 cursor-pointer" onClick={() => setSelectedAdmin(admin)}>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{admin.name}</h3>
              <div 
                className="flex gap-1 mt-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRatingModalOpen({ id: admin.id, rating: admin.rating });
                }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={16} 
                    fill={star <= admin.rating ? "#f59e0b" : "none"} 
                    className={star <= admin.rating ? "text-amber-500" : "text-slate-200 dark:text-slate-700"}
                  />
                ))}
              </div>
            </div>

            <button 
              onClick={() => setConfirmToggle({ id: admin.id, currentStatus: admin.isActive })}
              className={`min-w-[85px] py-2 px-4 rounded-xl text-xs font-black transition-all transform active:scale-95 ${
                admin.isActive 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
              }`}
            >
              {admin.isActive ? 'ACTIVE' : 'INACTIVE'}
            </button>
          </div>
        ))}
        {filteredSortedAdmins.length === 0 && (
          <div className="text-center py-20 animate-pulse">
            <User size={64} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">No admins found</p>
          </div>
        )}
      </div>

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-4 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            onClick={() => setPreviewImage(null)}
          >
            <X size={32} />
          </button>
          <img 
            src={previewImage} 
            alt="Full Preview" 
            className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Custom Confirmation Dialog for Status Toggle */}
      {confirmToggle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl space-y-6">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto ${confirmToggle.currentStatus ? 'bg-rose-100 text-rose-500' : 'bg-emerald-100 text-emerald-500'}`}>
              <AlertCircle size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black dark:text-white">Confirm Change</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Are you sure you want to make this admin 
                <span className={`font-bold mx-1 ${confirmToggle.currentStatus ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {confirmToggle.currentStatus ? 'Inactive' : 'Active'}
                </span>?
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmToggle(null)}
                className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
              >
                No, Cancel
              </button>
              <button 
                onClick={() => handleToggleStatus(confirmToggle.id, confirmToggle.currentStatus)}
                className={`flex-1 py-4 text-white font-black rounded-2xl shadow-lg transition-transform active:scale-95 ${confirmToggle.currentStatus ? 'bg-rose-500 shadow-rose-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}
              >
                Yes, Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Admin Confirmation Modal */}
      {deletingAdminConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black dark:text-white">Delete Profile?</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-slate-100">"{deletingAdminConfirm.name}"</span>? 
                This action is permanent.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingAdminConfirm(null)}
                className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
              >Cancel</button>
              <button 
                onClick={confirmDeleteAdmin}
                className="flex-1 py-4 bg-rose-500 text-white font-black rounded-2xl shadow-lg shadow-rose-500/30 transition-transform active:scale-95"
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Form Modal */}
      {(isFormOpen || editingAdmin) && (
        <AdminFormModal 
          initialData={editingAdmin}
          onClose={() => { setIsFormOpen(false); setEditingAdmin(null); }}
          onSave={(data) => {
            if (editingAdmin) {
              onUpdateAdmins(admins.map(a => a.id === editingAdmin.id ? { ...data, id: a.id } : a));
            } else {
              onUpdateAdmins([...admins, { ...data, id: Date.now().toString(), rating: 3, isActive: true }]);
            }
            setIsFormOpen(false);
            setEditingAdmin(null);
          }}
        />
      )}

      {/* Rating Modal */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-xs shadow-2xl">
            <h3 className="text-xl font-black text-center mb-8 dark:text-white">Performance Rating</h3>
            <div className="flex justify-center gap-2 mb-10">
              {[1, 2, 3, 4, 5].map((s) => (
                <button 
                  key={s} 
                  onClick={() => setIsRatingModalOpen({...isRatingModalOpen, rating: s})}
                  className="p-1 transform hover:scale-125 transition-transform"
                >
                  <Star 
                    size={36} 
                    fill={s <= isRatingModalOpen.rating ? "#f59e0b" : "none"} 
                    className={s <= isRatingModalOpen.rating ? "text-amber-500 drop-shadow-sm" : "text-slate-200 dark:text-slate-700"}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsRatingModalOpen(null)}
                className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleUpdateRating(isRatingModalOpen.id, isRatingModalOpen.rating)}
                className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/30 active:scale-95 transition-transform"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details View */}
      {selectedAdmin && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col animate-slideUp">
          <div className="sticky top-0 z-30 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between border-b dark:border-slate-800">
            <button onClick={() => setSelectedAdmin(null)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><X size={24} /></button>
            <h2 className="font-black text-lg dark:text-white uppercase tracking-widest">Profile</h2>
            <div className="flex gap-1">
              <button onClick={downloadDetailsAsImage} className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors"><Download size={22} /></button>
              <button onClick={() => { setEditingAdmin(selectedAdmin); setSelectedAdmin(null); }} className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-colors"><Edit2 size={22} /></button>
              <button onClick={() => setDeletingAdminConfirm(selectedAdmin)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors"><Trash2 size={22} /></button>
            </div>
          </div>

          <div id="admin-details-card" className="p-8 bg-white dark:bg-slate-950 flex-1">
            <div className="flex flex-col items-center mb-10">
              <div className="w-28 h-28 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black mb-6 shadow-2xl shadow-indigo-500/40 relative">
                {selectedAdmin.name.charAt(0)}
                <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white dark:border-slate-950 shadow-md ${selectedAdmin.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              </div>
              <h1 className="text-3xl font-black dark:text-white text-center leading-tight">{selectedAdmin.name}</h1>
              <p className="text-indigo-600 dark:text-indigo-400 font-black mt-2 tracking-widest uppercase text-sm">BATCH {selectedAdmin.batch}</p>
              
              <div className="flex gap-4 mt-8 w-full max-w-sm">
                <div className="flex-1 text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">EXPERIENCE</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{calculateExperience(selectedAdmin.joinDate)}</p>
                </div>
                <div className="flex-1 text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">RATING</p>
                  <div className="flex gap-0.5 justify-center mt-0.5">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill={s <= selectedAdmin.rating ? "#f59e0b" : "none"} className={s <= selectedAdmin.rating ? "text-amber-500" : "text-slate-300"} />)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8 max-w-md mx-auto pb-10">
              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-800" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Personal Details</h3>
                  <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-800" />
                </div>
                <DetailRow icon={<User size={18}/>} label="Age & Gender" value={`${selectedAdmin.age} Years • ${selectedAdmin.gender}`} />
                <DetailRow icon={<MapPin size={18}/>} label="Address" value={selectedAdmin.address} />
                <DetailRow icon={<Phone size={18}/>} label="Primary Mobile" value={selectedAdmin.mobile} />
                {selectedAdmin.whatsapp && <DetailRow icon={<Phone size={18} className="text-emerald-500"/>} label="WhatsApp" value={selectedAdmin.whatsapp} />}
                <DetailRow icon={<ExternalLink size={18}/>} label="Facebook" value={selectedAdmin.facebookLink} isLink />
              </section>

              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-800" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Assignment</h3>
                  <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-800" />
                </div>
                <DetailRow icon={<Calendar size={18}/>} label="Enrolled On" value={new Date(selectedAdmin.joinDate).toLocaleDateString(undefined, { dateStyle: 'long' })} />
                <DetailRow icon={<User size={18}/>} label="Current Mentor" value={selectedAdmin.currentTrainer} />
                <DetailRow icon={<User size={18}/>} label="Latest Mentor" value={selectedAdmin.latestTrainer} />
              </section>

              {selectedAdmin.documents.length > 0 && (
                <section className="space-y-5 pb-10">
                  <div className="flex items-center gap-3">
                    <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-800" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Documents</h3>
                    <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedAdmin.documents.map((doc, i) => (
                      <button 
                        key={i} 
                        onClick={() => setPreviewImage(doc)}
                        className="group relative aspect-square rounded-3xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-inner active:scale-95 transition-all outline-none"
                      >
                        <img src={doc} alt="document" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Maximize2 className="text-white" size={24} />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ icon, label, value, isLink }: { icon: any, label: string, value: string, isLink?: boolean }) => (
  <div className="flex items-start gap-5 group">
    <div className="mt-0.5 p-3 bg-slate-50 dark:bg-slate-900 rounded-[1.25rem] text-slate-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 transition-all">
      {icon}
    </div>
    <div className="flex-1 border-b border-slate-50 dark:border-slate-800 pb-4 group-last:border-0">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
          Visit Profile <ExternalLink size={14} />
        </a>
      ) : (
        <p className="font-bold text-slate-700 dark:text-slate-200">{value}</p>
      )}
    </div>
  </div>
);

const AdminFormModal = ({ initialData, onClose, onSave }: { initialData: Admin | null, onClose: () => void, onSave: (data: any) => void }) => {
  const [formData, setFormData] = useState<Partial<Admin>>(initialData || {
    name: '',
    age: 20,
    gender: 'Male',
    address: '',
    mobile: '',
    whatsapp: '',
    batch: '',
    joinDate: new Date().toISOString().split('T')[0],
    currentTrainer: '',
    latestTrainer: '',
    facebookLink: '',
    documents: []
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          documents: [...(prev.documents || []), reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-white dark:bg-slate-950 overflow-y-auto flex flex-col no-scrollbar animate-slideUp">
      <div className="sticky top-0 z-30 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between border-b dark:border-slate-800">
        <button onClick={onClose} className="px-5 py-2.5 text-slate-500 font-black hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">Cancel</button>
        <h2 className="font-black text-lg dark:text-white uppercase tracking-widest">{initialData ? 'Edit Admin' : 'New Admin'}</h2>
        <button 
          onClick={() => onSave(formData)}
          className="px-6 py-2.5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/30 active:scale-95 transition-transform"
        >Save</button>
      </div>

      <div className="p-8 space-y-6 max-w-lg mx-auto w-full pb-20">
        <Input label="Full Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="Admin Name" />
        
        <div className="grid grid-cols-2 gap-4">
          <Input label="Age" type="number" value={formData.age} onChange={v => setFormData({...formData, age: parseInt(v)})} />
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
            <select 
              value={formData.gender} 
              onChange={e => setFormData({...formData, gender: e.target.value})}
              className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent dark:border-slate-800 rounded-2xl dark:text-white font-bold outline-none appearance-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <Input label="Address" value={formData.address} onChange={v => setFormData({...formData, address: v})} placeholder="City, Area" />
        <Input label="Mobile Number" value={formData.mobile} onChange={v => setFormData({...formData, mobile: v})} placeholder="01XXX-XXXXXX" />
        <Input label="WhatsApp (Optional)" value={formData.whatsapp} onChange={v => setFormData({...formData, whatsapp: v})} placeholder="Same or different" />
        
        <div className="grid grid-cols-2 gap-4">
          <Input label="Batch" value={formData.batch} onChange={v => setFormData({...formData, batch: v})} placeholder="e.g. 27th" />
          <Input label="Join Date" type="date" value={formData.joinDate} onChange={v => setFormData({...formData, joinDate: v})} />
        </div>

        <Input label="Current Trainer" value={formData.currentTrainer} onChange={v => setFormData({...formData, currentTrainer: v})} />
        <Input label="Latest Trainer" value={formData.latestTrainer} onChange={v => setFormData({...formData, latestTrainer: v})} />
        <Input label="Facebook Link" value={formData.facebookLink} onChange={v => setFormData({...formData, facebookLink: v})} placeholder="https://..." />

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Documents / Photos</label>
          <div className="flex flex-wrap gap-4">
            {formData.documents?.map((doc, i) => (
              <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-sm group">
                <img src={doc} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setFormData({...formData, documents: formData.documents?.filter((_, idx) => idx !== i)})}
                  className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-500 transition-all">
              <Camera size={24} />
              <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder }: { label: string, value: any, onChange: (v: string) => void, type?: string, placeholder?: string }) => (
  <div className="flex flex-col gap-2 group">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent dark:border-slate-800 rounded-2xl dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all placeholder:text-slate-300 font-bold"
    />
  </div>
);

export default AdminSection;
