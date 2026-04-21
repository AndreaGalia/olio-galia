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
    <form onSubmit={handleSubmit} className="flex flex-col gap-0">
      {!hideTitle && (
        <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-8">{form.title}</p>
      )}

      {/* Name + Email affiancati */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <input
          type="text"
          placeholder={form.name}
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="border-b border-olive/20 bg-transparent py-3 garamond-13 placeholder-black/30 focus:outline-none focus:border-olive/50 transition-colors"
        />
        <input
          type="email"
          placeholder={form.email}
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="border-b border-olive/20 bg-transparent py-3 garamond-13 placeholder-black/30 focus:outline-none focus:border-olive/50 transition-colors"
        />
      </div>

      {/* Textarea con bordo completo */}
      <textarea
        placeholder={form.message}
        value={message}
        onChange={e => setMessage(e.target.value)}
        required
        rows={8}
        className="border border-olive/20 bg-transparent p-4 garamond-13 placeholder-black/30 focus:outline-none focus:border-olive/50 transition-colors resize-none mb-1"
      />

      {status === 'success' && (
        <p className="font-serif termina-11 tracking-[0.15em] uppercase text-olive py-3">{form.success}</p>
      )}
      {status === 'error' && (
        <p className="font-serif termina-11 tracking-[0.15em] uppercase text-red-600 py-3">{form.error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full py-4 bg-sabbia text-black font-serif termina-11 tracking-[0.25em] uppercase transition-all duration-300 cursor-pointer hover:bg-olive hover:text-beige disabled:bg-sabbia/40 disabled:text-black/30 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? form.submitting : form.submit}
      </button>
    </form>
  );
}
