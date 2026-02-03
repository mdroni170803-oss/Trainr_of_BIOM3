
import React, { useState, useMemo } from 'react';
import { Search, Plus, GraduationCap, Edit2, Trash2, X, ChevronRight, Calendar, User, Users, Check, AlertCircle } from 'lucide-react';
import { Course, Batch, Admin } from '../types';

interface CourseSectionProps {
  courses: Course[];
  admins: Admin[];
  onUpdateCourses: (courses: Course[]) => void;
}

const CourseSection: React.FC<CourseSectionProps> = ({ courses, admins, onUpdateCourses }) => {
  const [search, setSearch] = useState('');
  const [isCourseFormOpen, setIsCourseFormOpen] = useState<{ isOpen: boolean; editingCourse?: Course }>({ isOpen: false });
  const [batchFormConfig, setBatchFormConfig] = useState<{ courseId: string; batch?: Batch } | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<{ courseId: string; courseName: string; batch: Batch } | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [deletingBatch, setDeletingBatch] = useState<{ courseId: string; batch: Batch } | null>(null);

  const filteredCourses = useMemo(() => {
    return courses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [courses, search]);

  const handleSaveCourse = (name: string, id?: string) => {
    if (id) {
      const updatedCourses = courses.map(c => c.id === id ? { ...c, name } : c);
      onUpdateCourses(updatedCourses);
    } else {
      const newCourse: Course = {
        id: Date.now().toString(),
        name,
        batches: []
      };
      onUpdateCourses([...courses, newCourse]);
    }
    setIsCourseFormOpen({ isOpen: false });
  };

  const confirmDeleteCourse = () => {
    if (deletingCourse) {
      onUpdateCourses(courses.filter(c => c.id !== deletingCourse.id));
      setDeletingCourse(null);
    }
  };

  const confirmDeleteBatch = () => {
    if (deletingBatch) {
      const updatedCourses = courses.map(c => {
        if (c.id === deletingBatch.courseId) {
          return { ...c, batches: c.batches.filter(b => b.id !== deletingBatch.batch.id) };
        }
        return c;
      });
      onUpdateCourses(updatedCourses);
      setDeletingBatch(null);
      setSelectedBatch(null);
    }
  };

  const handleSaveBatch = (courseId: string, batchData: Omit<Batch, 'id' | 'createdAt'>, existingId?: string) => {
    const updatedCourses = courses.map(c => {
      if (c.id === courseId) {
        let updatedBatches;
        if (existingId) {
          updatedBatches = c.batches.map(b => b.id === existingId ? { ...b, ...batchData } : b);
        } else {
          const newBatch: Batch = {
            ...batchData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
          };
          updatedBatches = [...c.batches, newBatch];
        }
        return { ...c, batches: updatedBatches };
      }
      return c;
    });
    onUpdateCourses(updatedCourses);
    setBatchFormConfig(null);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-slate-50 dark:bg-slate-950">
      {/* Search Header */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex gap-2 items-center sticky top-0 z-20 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
          />
        </div>
        <button 
          onClick={() => setIsCourseFormOpen({ isOpen: true })}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Courses List - Properly scrollable with flex-1 and overflow-y-auto */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 touch-pan-y pb-24">
        {filteredCourses.map((course) => (
          <div key={course.id} className="space-y-3">
            <div className="flex items-center justify-between px-4 py-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
              <div className="flex-1 text-center pl-10">
                <h3 className="text-lg font-black text-indigo-900 dark:text-indigo-100 uppercase tracking-tight">{course.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsCourseFormOpen({ isOpen: true, editingCourse: course })}
                  className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-all"
                  title="Edit Course"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => setDeletingCourse(course)}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"
                  title="Delete Course"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={() => setBatchFormConfig({ courseId: course.id })}
                  className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl transition-all"
                  title="Add Batch"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 px-2">
              {course.batches.map((batch) => (
                <button
                  key={batch.id}
                  onClick={() => setSelectedBatch({ courseId: course.id, courseName: course.name, batch })}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                >
                  <span className="font-bold text-slate-700 dark:text-slate-200">Batch {batch.batchNumber}</span>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500" />
                </button>
              ))}
              {course.batches.length === 0 && (
                <div className="col-span-2 text-center py-4 text-slate-400 text-xs italic">No batches added yet</div>
              )}
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="text-center py-20 opacity-40">
            <GraduationCap size={64} className="mx-auto mb-4" />
            <p className="font-bold">No courses found</p>
          </div>
        )}
      </div>

      {/* Course Delete Confirmation Modal */}
      {deletingCourse && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black dark:text-white">Delete Course?</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-slate-100">"{deletingCourse.name}"</span>? 
                This will also remove all batches associated with it.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingCourse(null)}
                className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
              >Cancel</button>
              <button 
                onClick={confirmDeleteCourse}
                className="flex-1 py-4 bg-rose-500 text-white font-black rounded-2xl shadow-lg shadow-rose-500/30 transition-transform active:scale-95"
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Delete Confirmation Modal */}
      {deletingBatch && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black dark:text-white">Delete Batch?</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-slate-100">Batch {deletingBatch.batch.batchNumber}</span>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingBatch(null)}
                className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
              >Cancel</button>
              <button 
                onClick={confirmDeleteBatch}
                className="flex-1 py-4 bg-rose-500 text-white font-black rounded-2xl shadow-lg shadow-rose-500/30 transition-transform active:scale-95"
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Course Form Modal */}
      {isCourseFormOpen.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const name = new FormData(e.currentTarget).get('courseName') as string;
              if (name) handleSaveCourse(name, isCourseFormOpen.editingCourse?.id);
            }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl space-y-6"
          >
            <h3 className="text-xl font-black dark:text-white text-center uppercase tracking-widest">
              {isCourseFormOpen.editingCourse ? 'Edit Course' : 'New Course'}
            </h3>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Name</label>
              <input
                autoFocus
                name="courseName"
                defaultValue={isCourseFormOpen.editingCourse?.name}
                required
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter course name"
              />
            </div>
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setIsCourseFormOpen({ isOpen: false })}
                className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
              >Cancel</button>
              <button 
                type="submit"
                className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/30 transition-transform active:scale-95"
              >{isCourseFormOpen.editingCourse ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Batch Form Modal */}
      {batchFormConfig && (
        <BatchFormModal 
          initialData={batchFormConfig.batch}
          admins={admins}
          onClose={() => setBatchFormConfig(null)}
          onSave={(data) => handleSaveBatch(batchFormConfig.courseId, data, batchFormConfig.batch?.id)}
        />
      )}

      {/* Batch Details Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-[80] bg-slate-50 dark:bg-slate-950 overflow-y-auto flex flex-col animate-slideUp">
          <div className="sticky top-0 z-30 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between border-b dark:border-slate-800">
            <button onClick={() => setSelectedBatch(null)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><X size={24} /></button>
            <h2 className="font-black text-lg dark:text-white uppercase tracking-widest">Batch Details</h2>
            <div className="flex gap-1">
              <button 
                onClick={() => {
                  setBatchFormConfig({ courseId: selectedBatch.courseId, batch: selectedBatch.batch });
                  setSelectedBatch(null);
                }}
                className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-colors"
              ><Edit2 size={22} /></button>
              <button 
                onClick={() => setDeletingBatch({ courseId: selectedBatch.courseId, batch: selectedBatch.batch })}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors"
              ><Trash2 size={22} /></button>
            </div>
          </div>

          <div className="p-8 max-w-lg mx-auto w-full space-y-8">
            <div className="text-center">
              <p className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-xs mb-1">{selectedBatch.courseName}</p>
              <h1 className="text-4xl font-black text-slate-800 dark:text-white">Batch {selectedBatch.batch.batchNumber}</h1>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoBox icon={<Calendar size={18}/>} label="Batch Start" value={new Date(selectedBatch.batch.startDate).toLocaleDateString()} />
              <InfoBox icon={<Calendar size={18}/>} label="Admission Start" value={new Date(selectedBatch.batch.admissionDate).toLocaleDateString()} />
              <InfoBox icon={<User size={18}/>} label="Head Teacher" value={selectedBatch.batch.headTeacher} className="col-span-2" />
              <InfoBox 
                icon={<Users size={18}/>} 
                label="Total Admins" 
                value={`${selectedBatch.batch.adminIds.length} Registered`} 
                className="col-span-2" 
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                My Admin List
                <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800" />
              </h3>
              <div className="space-y-2">
                {selectedBatch.batch.adminIds.map(adminId => {
                  const admin = admins.find(a => a.id === adminId);
                  return admin ? (
                    <div key={adminId} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                        {admin.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold dark:text-white">{admin.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase">Batch {admin.batch}</p>
                      </div>
                    </div>
                  ) : null;
                })}
                {selectedBatch.batch.adminIds.length === 0 && (
                  <p className="text-center text-slate-400 italic text-sm py-4">No admins selected for this batch.</p>
                )}
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Form Created: {new Date(selectedBatch.batch.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoBox = ({ icon, label, value, className = "" }: { icon: any, label: string, value: string, className?: string }) => (
  <div className={`p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm ${className}`}>
    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-lg font-black text-slate-800 dark:text-slate-100">{value}</p>
  </div>
);

const BatchFormModal = ({ initialData, admins, onClose, onSave }: { initialData?: Batch, admins: Admin[], onClose: () => void, onSave: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    batchNumber: initialData?.batchNumber || '',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    admissionDate: initialData?.admissionDate || new Date().toISOString().split('T')[0],
    headTeacher: initialData?.headTeacher || '',
    adminIds: initialData?.adminIds || [] as string[]
  });
  const [isAdminListOpen, setIsAdminListOpen] = useState(false);

  const toggleAdmin = (id: string) => {
    setFormData(prev => ({
      ...prev,
      adminIds: prev.adminIds.includes(id) 
        ? prev.adminIds.filter(aid => aid !== id) 
        : [...prev.adminIds, id]
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 overflow-y-auto flex flex-col no-scrollbar animate-slideUp">
      <div className="sticky top-0 z-30 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between border-b dark:border-slate-800">
        <button onClick={onClose} className="px-5 py-2.5 text-slate-500 font-black hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">Cancel</button>
        <h2 className="font-black text-lg dark:text-white uppercase tracking-widest">{initialData ? 'Update Batch' : 'New Batch'}</h2>
        <button 
          onClick={() => onSave(formData)}
          className="px-6 py-2.5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/30 active:scale-95 transition-transform"
        >Save</button>
      </div>

      <div className="p-8 space-y-6 max-w-lg mx-auto w-full">
        <Input label="Batch Number" value={formData.batchNumber} onChange={v => setFormData({...formData, batchNumber: v})} placeholder="e.g. 05" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Batch Start Date" type="date" value={formData.startDate} onChange={v => setFormData({...formData, startDate: v})} />
          <Input label="Admission Start Date" type="date" value={formData.admissionDate} onChange={v => setFormData({...formData, admissionDate: v})} />
        </div>
        <Input label="Head Teacher" value={formData.headTeacher} onChange={v => setFormData({...formData, headTeacher: v})} />
        
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">My Admin</label>
          <button 
            onClick={() => setIsAdminListOpen(true)}
            className="w-full p-5 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 font-bold flex items-center justify-between hover:border-indigo-500 transition-all"
          >
            <span>{formData.adminIds.length > 0 ? `${formData.adminIds.length} Admins Selected` : 'Choose Admin'}</span>
            <ChevronRight size={20} />
          </button>
        </div>

        {isAdminListOpen && (
          <div className="fixed inset-0 z-[110] bg-slate-50 dark:bg-slate-950 flex flex-col animate-slideUp">
            <div className="p-4 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between">
              <button onClick={() => setIsAdminListOpen(false)} className="p-2 text-slate-500"><X size={24} /></button>
              <h3 className="font-black uppercase tracking-widest dark:text-white">Select Admins</h3>
              <button onClick={() => setIsAdminListOpen(false)} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl">Done</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {admins.map(admin => (
                <button 
                  key={admin.id}
                  onClick={() => toggleAdmin(admin.id)}
                  className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                    formData.adminIds.includes(admin.id)
                      ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800'
                      : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    formData.adminIds.includes(admin.id)
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}>
                    {formData.adminIds.includes(admin.id) && <Check size={14} />}
                  </div>
                  <div className="text-left">
                    <p className="font-bold dark:text-white">{admin.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Batch {admin.batch}</p>
                  </div>
                </button>
              ))}
              {admins.length === 0 && (
                <div className="text-center py-20 opacity-40">
                  <Users size={48} className="mx-auto mb-2" />
                  <p className="font-bold">No admins registered in the system</p>
                </div>
              )}
            </div>
          </div>
        )}
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

export default CourseSection;
