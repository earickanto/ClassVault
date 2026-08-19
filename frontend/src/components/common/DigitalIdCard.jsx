import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { Download, ShieldCheck, Award } from 'lucide-react';
import { Button } from './Button';
import { useToast } from '../../context/ToastContext';

export const DigitalIdCard = ({ student }) => {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const { addToast } = useToast();

  const handleExportPng = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${student.rollNumber || 'Student'}_ClassVault_ID.png`;
      link.href = dataUrl;
      link.click();
      addToast('Digital Student ID Card downloaded as PNG!', 'success');
    } catch (err) {
      addToast('Failed to export Digital ID card', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const profileUrl = `${window.location.origin}/profile/${student?.id || ''}`;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Visual ID Card Container */}
      <div
        ref={cardRef}
        className="w-[340px] h-[520px] bg-gradient-to-br from-slate-900 via-[#0d1322] to-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-brand-500/30 relative flex flex-col justify-between overflow-hidden select-none"
      >
        {/* Decorative Grid & Accent Lights */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center font-extrabold text-white text-base shadow-md">
                CV
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-wider text-slate-100 uppercase">ClassVault</h4>
                <p className="text-[10px] text-slate-400 font-medium">Digital Student Badge</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[10px] font-semibold">
              <ShieldCheck className="w-3 h-3" /> Verified
            </div>
          </div>

          {/* Student Photo Section */}
          <div className="flex flex-col items-center mt-5">
            <div className="relative">
              <img
                src={student?.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={student?.name || 'Student Avatar'}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-500/50 shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-brand-600 p-1.5 rounded-xl border border-slate-900 shadow-md">
                <Award className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <h3 className="font-bold text-lg text-white mt-3 text-center tracking-tight">{student?.name || 'Student'}</h3>
            <span className="text-xs font-mono font-semibold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20 mt-1">
              {student?.rollNumber || '—'}
            </span>
          </div>

          {/* Details Table */}
          <div className="mt-4 space-y-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Department:</span>
              <span className="font-medium text-slate-200 truncate max-w-[170px]">{student?.department || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Register No:</span>
              <span className="font-mono text-slate-200">{student?.registerNumber || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Year / Section:</span>
              <span className="font-medium text-slate-200">Year {student?.year || 1} • Sec {student?.section || 'A'}</span>
            </div>
          </div>
        </div>

        {/* Footer & Dynamic QR Code */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
          <div className="text-[10px] text-slate-400">
            <p className="font-semibold text-slate-300">Scan to View Profile</p>
            <p>ClassVault Student Repository</p>
          </div>
          <div className="bg-white p-1.5 rounded-xl shadow-md">
            <QRCodeSVG value={profileUrl} size={48} level="M" />
          </div>
        </div>
      </div>

      {/* Export Action Button */}
      <Button onClick={handleExportPng} isLoading={downloading} variant="secondary" className="w-full max-w-[340px]">
        <Download className="w-4 h-4" /> Download ID Card (PNG)
      </Button>
    </div>
  );
};
