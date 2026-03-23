"use client";

import { useState } from 'react';
import { useT } from '@/hooks/useT';

export default function ContactFormSection({ hideTitle }: { hideTitle?: boolean }) {
  const { t } = useT();
  const form = t.contactPage.form;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <div>
      {!hideTitle && <h2 className="font-serif text-black mb-8">{form.title}</h2>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs tracking-widest uppercase text-black/60 font-sans">{form.name}</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="border-0 border-b border-black/30 bg-transparent py-2 text-black placeholder-black/30 focus:outline-none focus:border-black transition-colors text-sm font-sans"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs tracking-widest uppercase text-black/60 font-sans">{form.email}</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="border-0 border-b border-black/30 bg-transparent py-2 text-black placeholder-black/30 focus:outline-none focus:border-black transition-colors text-sm font-sans"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs tracking-widest uppercase text-black/60 font-sans">{form.message}</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            rows={5}
            className="border-0 border-b border-black/30 bg-transparent py-2 text-black placeholder-black/30 focus:outline-none focus:border-black transition-colors text-sm font-sans resize-none"
          />
        </div>

        {status === 'success' && (
          <p className="text-sm text-olive font-sans">{form.success}</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-600 font-sans">{form.error}</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="btn-outline border border-black text-black px-8 py-3 text-xs tracking-widest uppercase font-sans cursor-pointer hover:bg-olive hover:border-olive hover:text-[#E0D3B7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? form.submitting : `→ ${form.submit}`}
          </button>
        </div>
      </form>
    </div>
  );
}
