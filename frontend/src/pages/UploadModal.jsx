import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, ArrowRight, ArrowLeft, FileCode, Video, FileText, Image, Sparkles, BookOpen, Clock, Globe, Github, Eye, Edit3 } from 'lucide-react';
import { projectApi } from '../api/projectApi';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

const DEFAULT_README_TEMPLATE = `# Project Title

## Overview
Briefly describe what this project does, the core problem it solves, and the target audience.

## Key Features
- Feature 1: Core functionality description
- Feature 2: Security and role-based access
- Feature 3: Responsive modern UI

## Tech Stack & Architecture
- **Frontend**: React 18, Tailwind CSS, Lucide Icons
- **Backend**: Java 21, Spring Boot 3, REST APIs
- **Database**: PostgreSQL / MySQL / H2

## How It Works & Setup Instructions
\`\`\`bash
# Clone the repository
git clone https://github.com/username/project.git

# Setup and run backend
cd backend
./mvnw spring-boot:run

# Setup and run frontend
cd ../frontend
npm install
npm run dev
\`\`\`

## Future Scope & Improvements
- Future enhancements planned for upcoming milestones
`;

export const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [readmePreviewMode, setReadmePreviewMode] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    readmeContent: DEFAULT_README_TEMPLATE,
    technologyUsed: '',
    category: 'Web Application',
    semester: 6,
    githubRepoUrl: '',
    liveDemoUrl: '',
    visibility: 'PUBLIC',
  });

  const categories = ['Web Application', 'Machine Learning', 'Mobile App', 'Systems & Cloud', 'IoT & Embedded'];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (targetStatus) => {
    if (!formData.title.trim() || !formData.technologyUsed.trim()) {
      addToast('Please fill in project title and technology stack', 'error');
      return;
    }

    setLoading(true);
    try {
      const createRes = await projectApi.createProject({
        ...formData,
        status: targetStatus,
      });

      if (createRes.success && createRes.data) {
        addToast(targetStatus === 'DRAFT' ? 'Project saved as Draft' : 'Project submitted for class evaluation!', 'success');
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to submit project';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Class Project" maxWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Step Indicator Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 overflow-x-auto gap-2">
          {[
            { num: 1, label: 'Details' },
            { num: 2, label: 'Links & Tech' },
            { num: 3, label: 'README Docs' },
            { num: 4, label: 'Files (V2)' },
            { num: 5, label: 'Review' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-1.5 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s.num
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : step > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs font-medium ${step === s.num ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content Panels */}
        <AnimatePresence mode="wait">
          {/* Step 1: Details */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. ClassVault SaaS Platform"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Brief Overview / Abstract</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="A concise summary of the project goals, use-case, and significance..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => handleChange('semester', parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Visibility</label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => handleChange('visibility', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                  >
                    <option value="PUBLIC">PUBLIC (Visible to all classmates)</option>
                    <option value="PRIVATE">PRIVATE (Only Owner & Course Faculty)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Links & Tech */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Technology Used (comma separated) *</label>
                <input
                  type="text"
                  value={formData.technologyUsed}
                  onChange={(e) => handleChange('technologyUsed', e.target.value)}
                  placeholder="e.g. React, Spring Boot, Java 21, PostgreSQL, Docker"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Project Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleChange('category', cat)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        formData.category === cat
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Github className="w-3.5 h-3.5" /> GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    value={formData.githubRepoUrl}
                    onChange={(e) => handleChange('githubRepoUrl', e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={formData.liveDemoUrl}
                    onChange={(e) => handleChange('liveDemoUrl', e.target.value)}
                    placeholder="https://myproject.demo.com"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: README Documentation */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-500" /> Project Documentation (README.md)
                  </h3>
                  <p className="text-[11px] text-slate-400">Describe features, architecture, and step-by-step setup in Markdown</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setReadmePreviewMode(false)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                      !readmePreviewMode
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setReadmePreviewMode(true)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                      readmePreviewMode
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                </div>
              </div>

              {!readmePreviewMode ? (
                <textarea
                  rows={12}
                  value={formData.readmeContent}
                  onChange={(e) => handleChange('readmeContent', e.target.value)}
                  placeholder="# Project Title..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl min-h-[250px] max-h-[350px] overflow-y-auto prose dark:prose-invert prose-xs max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {formData.readmeContent}
                  </pre>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Files Uploads (Disabled / Coming Soon) */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <div className="p-6 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  File Uploads — Coming in V2
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  For the initial V1 release, project submissions focus on GitHub repositories, live demo deployments, and full Markdown README documentation. Raw file uploads (ZIP source files, PDFs, and demo videos) will be enabled in V2.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-60 pointer-events-none">
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3">
                  <FileCode className="w-5 h-5 text-slate-400" />
                  <div>
                    <span className="text-xs font-bold block text-slate-700 dark:text-slate-300">Source Code ZIP</span>
                    <span className="text-[10px] text-slate-400">Coming Soon (V2)</span>
                  </div>
                </div>
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3">
                  <Video className="w-5 h-5 text-slate-400" />
                  <div>
                    <span className="text-xs font-bold block text-slate-700 dark:text-slate-300">Demo Video MP4</span>
                    <span className="text-[10px] text-slate-400">Coming Soon (V2)</span>
                  </div>
                </div>
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3">
                  <Image className="w-5 h-5 text-slate-400" />
                  <div>
                    <span className="text-xs font-bold block text-slate-700 dark:text-slate-300">Project Screenshots</span>
                    <span className="text-[10px] text-slate-400">Coming Soon (V2)</span>
                  </div>
                </div>
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <span className="text-xs font-bold block text-slate-700 dark:text-slate-300">Report PDF / PPT</span>
                    <span className="text-[10px] text-slate-400">Coming Soon (V2)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Review & Publish */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Showcase Card Preview</h4>
              <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                    {formData.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Sem {formData.semester} • {formData.visibility}</span>
                </div>
                <h3 className="font-extrabold text-lg">{formData.title || 'Project Title Preview'}</h3>
                <p className="text-xs text-slate-300 line-clamp-2">{formData.description || 'No overview summary added yet.'}</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {formData.technologyUsed.split(',').map((t, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 font-mono text-indigo-300">{t.trim()}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          {step > 1 ? (
            <Button onClick={() => setStep((s) => s - 1)} variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <Button onClick={() => setStep((s) => s + 1)} size="sm">
              Next Step <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => handleSubmit('DRAFT')} isLoading={loading} variant="secondary" size="sm">
                Save as Draft
              </Button>
              <Button onClick={() => handleSubmit('PENDING')} isLoading={loading} size="sm">
                Submit Project
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
