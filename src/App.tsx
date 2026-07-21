import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { HashRouter, Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Check, CircleUserRound, Clock3, LogOut, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { authClient } from './lib/auth-client';
import { api } from './lib/api';
import type { Job, Passport, UserRole } from './types';

const card = 'border-2 border-black bg-white shadow-[5px_5px_0_#000]';
const input = 'w-full border-2 border-black bg-white px-3 py-2.5 outline-none focus:shadow-[3px_3px_0_#ec4899]';
const button = 'inline-flex items-center justify-center gap-2 border-2 border-black bg-black px-4 py-2.5 font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#ec4899] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryButton = 'inline-flex items-center justify-center gap-2 border-2 border-black bg-white px-4 py-2.5 font-bold transition hover:bg-[#e8ff36] disabled:opacity-50';

function roleFor(session: ReturnType<typeof authClient.useSession>['data']): UserRole | null {
  const role = session?.user.role;
  return role === 'candidate' || role === 'employer' || role === 'admin' ? role : null;
}

function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'error' | 'success' }) {
  const colours = tone === 'error' ? 'bg-red-100' : tone === 'success' ? 'bg-emerald-100' : 'bg-[#e8ff36]';
  return <div role={tone === 'error' ? 'alert' : 'status'} className={`border-2 border-black p-3 text-sm ${colours}`}>{children}</div>;
}

function Shell({ children }: { children: ReactNode }) {
  const session = authClient.useSession();
  const role = roleFor(session.data);
  const logout = async () => { await authClient.signOut(); window.location.hash = '#/'; };

  return <div className="min-h-screen bg-[#fffdf3] text-[#151515]">
    <header className="sticky top-0 z-30 border-b-2 border-black bg-[#e8ff36]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-2xl font-black uppercase tracking-tight sm:text-3xl">Cre8tiv<span className="text-pink-600">.</span></Link>
        <nav aria-label="Primary navigation" className="flex flex-wrap items-center justify-end gap-2 text-sm font-bold">
          <Link className="px-2 py-1 hover:bg-white" to="/">Jobs</Link>
          {role === 'candidate' && <><Link className="px-2 py-1 hover:bg-white" to="/passport">My Passport</Link><Link className="px-2 py-1 hover:bg-white" to="/applications">Applications</Link></>}
          {role === 'employer' && <><Link className="px-2 py-1 hover:bg-white" to="/employer">Employer desk</Link><Link className="px-2 py-1 hover:bg-white" to="/post-job">Submit a job</Link></>}
          {role === 'admin' && <Link className="px-2 py-1 hover:bg-white" to="/admin">Review queue</Link>}
          {session.data ? <button onClick={logout} className="inline-flex items-center gap-1 border-2 border-black bg-white px-2 py-1"><LogOut size={15}/> Sign out</button> : <Link className="border-2 border-black bg-black px-3 py-1.5 text-white" to="/sign-in">Sign in</Link>}
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">{children}</main>
    <footer className="mt-16 border-t-2 border-black bg-black px-4 py-6 text-sm text-white">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 sm:flex-row"><span>Free Passports. $30 reviewed exclusives.</span><span>Chronological jobs · no paid ranking · human decisions</span></div>
    </footer>
  </div>;
}

function Guard({ role, children }: { role: UserRole; children: ReactNode }) {
  const session = authClient.useSession();
  if (session.isPending) return <p>Checking your secure session…</p>;
  if (!session.data) return <Navigate to="/sign-in" replace />;
  if (roleFor(session.data) !== role) return <Notice tone="error">This area is only available to {role} accounts.</Notice>;
  return children;
}

function JobsHome() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { api<{ jobs: Job[] }>('/jobs').then((data) => setJobs(data.jobs)).catch((err) => setError(err.message)).finally(() => setLoading(false)); }, []);

  return <div className="space-y-10">
    <section className="grid items-end gap-8 border-b-2 border-black pb-10 md:grid-cols-[1.4fr_0.6fr]">
      <div><p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em]">Australian creative + technology roles</p><h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl">Good work.<br/><span className="text-pink-600">Less noise.</span></h1></div>
      <div className={`${card} rotate-1 p-5`}><p className="font-bold">Every listing is human reviewed.</p><p className="mt-2 text-sm">No promoted positions. No algorithmic feed. Newest published roles appear first.</p></div>
    </section>
    <section aria-labelledby="jobs-heading">
      <div className="mb-5 flex items-end justify-between gap-4"><div><h2 id="jobs-heading" className="text-3xl font-black uppercase">Open roles</h2><p className="text-sm">Exclusively listed for $30 after approval.</p></div><span className="font-mono text-sm">{jobs.length} live</span></div>
      {loading && <Notice>Loading reviewed roles…</Notice>}
      {error && <Notice tone="error">{error} Configure and seed the database to load the demonstration workflow.</Notice>}
      {!loading && !error && jobs.length === 0 && <Notice>No published jobs yet. Approved listings will appear here chronologically.</Notice>}
      <div className="grid gap-4">
        {jobs.map((job) => <Link key={job.id} to={`/jobs/${job.id}`} className={`${card} group grid gap-4 p-5 hover:-translate-y-0.5 md:grid-cols-[1fr_auto]`}>
          <div><div className="mb-2 flex flex-wrap gap-2"><span className="border border-black bg-[#e8ff36] px-2 py-0.5 font-mono text-xs uppercase">Exclusive</span><span className="border border-black px-2 py-0.5 font-mono text-xs uppercase">{job.employmentType.replaceAll('_', ' ')}</span></div><h3 className="text-2xl font-black group-hover:text-pink-600">{job.title}</h3><p className="font-bold">{job.company}</p><p className="mt-2 flex items-center gap-1 text-sm"><MapPin size={15}/>{job.location} · {job.workArrangement.replace('_', ' ')}</p></div>
          <div className="flex items-center gap-4 md:text-right"><div><p className="font-bold">{formatSalary(job)}</p><p className="text-xs">Published {formatDate(job.publishedAt)}</p></div><ArrowRight/></div>
        </Link>)}
      </div>
    </section>
    <section className="grid gap-4 sm:grid-cols-3"><Principle icon={<CircleUserRound/>} title="One permanent Passport">Candidates apply with an attributable, reusable profile.</Principle><Principle icon={<ShieldCheck/>} title="Human reviewed">An administrator decides what is published.</Principle><Principle icon={<Clock3/>} title="Transparent order">Jobs are chronological, never pay-to-promote.</Principle></section>
  </div>;
}

function Principle({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return <div className="border-t-2 border-black pt-4">{icon}<h3 className="mt-3 font-black uppercase">{title}</h3><p className="mt-1 text-sm">{children}</p></div>;
}

function AuthPage() {
  const navigate = useNavigate();
  const session = authClient.useSession();
  const [mode, setMode] = useState<'sign-in' | 'register'>('sign-in');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (session.data) navigate('/'); }, [session.data, navigate]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email')); const password = String(form.get('password'));
    try {
      const result = mode === 'sign-in'
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: String(form.get('name')), accountType: form.get('accountType') === 'employer' ? 'employer' : 'candidate' });
      if (result.error) throw new Error(result.error.message || 'Authentication failed.');
      await session.refetch(); navigate('/');
    } catch (err) { setError(err instanceof Error ? err.message : 'Authentication failed.'); }
    finally { setBusy(false); }
  };

  return <div className="mx-auto max-w-md">
    <div className={`${card} p-6 sm:p-8`}><p className="font-mono text-xs font-bold uppercase">Secure account access</p><h1 className="mt-2 text-4xl font-black uppercase">{mode === 'sign-in' ? 'Welcome back' : 'Join Cre8tiv'}</h1><p className="mt-2 text-sm">Secure database-backed sessions. Candidate and employer accounts have separate permissions.</p>
      {error && <div className="mt-5"><Notice tone="error">{error}</Notice></div>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === 'register' && <><label className="block font-bold">Display name<input required name="name" maxLength={100} className={`${input} mt-1`}/></label><fieldset><legend className="font-bold">I am joining as</legend><div className="mt-2 grid grid-cols-2 gap-2"><label className="border-2 border-black p-3"><input required defaultChecked type="radio" name="accountType" value="candidate"/> Candidate</label><label className="border-2 border-black p-3"><input required type="radio" name="accountType" value="employer"/> Employer</label></div></fieldset></>}
        <label className="block font-bold">Email<input required type="email" autoComplete="email" name="email" className={`${input} mt-1`}/></label>
        <label className="block font-bold">Password<input required minLength={12} maxLength={128} type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} name="password" className={`${input} mt-1`}/><span className="text-xs font-normal">12 characters minimum.</span></label>
        <button disabled={busy} className={`${button} w-full`}>{busy ? 'Working…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}<ArrowRight size={17}/></button>
      </form>
      <button className="mt-5 text-sm font-bold underline" onClick={() => { setError(''); setMode(mode === 'sign-in' ? 'register' : 'sign-in'); }}>{mode === 'sign-in' ? 'Need an account? Register' : 'Already registered? Sign in'}</button>
    </div>
  </div>;
}

function JobDetails() {
  const { jobId = '' } = useParams(); const session = authClient.useSession(); const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null); const [error, setError] = useState(''); const [note, setNote] = useState(''); const [applied, setApplied] = useState(false);
  useEffect(() => { api<{ job: Job }>(`/jobs/${jobId}`).then((data) => setJob(data.job)).catch((err) => setError(err.message)); }, [jobId]);
  const apply = async () => {
    if (!session.data) return navigate('/sign-in');
    try { await api(`/jobs/${jobId}/applications`, { method: 'POST', body: JSON.stringify({ note: note || null }) }); setApplied(true); setError(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'Application failed.'); }
  };
  if (error && !job) return <Notice tone="error">{error}</Notice>; if (!job) return <p>Loading role…</p>;
  return <article className="mx-auto max-w-4xl space-y-6"><Link className="font-bold underline" to="/">← All roles</Link><div className={`${card} p-6 sm:p-10`}><span className="border-2 border-black bg-[#e8ff36] px-2 py-1 font-mono text-xs uppercase">Human-reviewed exclusive</span><h1 className="mt-5 text-4xl font-black uppercase leading-none sm:text-6xl">{job.title}</h1><p className="mt-3 text-xl font-bold">{job.company}</p><p className="mt-2">{job.location} · {job.workArrangement.replace('_', ' ')} · {job.employmentType.replaceAll('_', ' ')}</p><div className="my-8 grid gap-3 border-y-2 border-black py-5 sm:grid-cols-3"><div><b>Salary</b><p>{formatSalary(job)}</p></div><div><b>Published</b><p>{formatDate(job.publishedAt)}</p></div><div><b>Closes</b><p>{formatDate(job.expiresAt)}</p></div></div><h2 className="text-2xl font-black uppercase">The role</h2><p className="mt-3 whitespace-pre-wrap leading-7">{job.description}</p><h2 className="mt-8 text-2xl font-black uppercase">How applications work</h2><p className="mt-3 leading-7">{job.applicationDetails}</p><div className="mt-8 border-t-2 border-black pt-6"><label className="font-bold">Optional note<textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={1500} rows={4} className={`${input} mt-2`} placeholder="A concise, role-specific note."/></label>{error && <div className="mt-3"><Notice tone="error">{error}</Notice></div>}{applied ? <div className="mt-3"><Notice tone="success"><Check className="mr-2 inline" size={17}/>Application submitted with your Passport.</Notice></div> : <button onClick={apply} className={`${button} mt-4`}>Apply with my Passport<ArrowRight size={17}/></button>}<p className="mt-2 text-xs">Only signed-in candidates with a completed Passport can apply. Duplicate applications are blocked.</p></div></div></article>;
}

function PassportEditor() {
  const session = authClient.useSession(); const [passport, setPassport] = useState<Passport | null>(null); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  useEffect(() => { api<{ passport: Passport | null }>('/me/passport').then((data) => setPassport(data.passport)).catch((err) => setError(err.message)); }, []);
  const save = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(''); const form = new FormData(event.currentTarget); try { const result = await api<{passport: Passport}>('/me/passport', { method: 'PUT', body: JSON.stringify({ slug: form.get('slug'), headline: form.get('headline'), location: form.get('location'), biography: form.get('biography'), skills: String(form.get('skills')).split(',').map((value) => value.trim()).filter(Boolean), portfolioLinks: String(form.get('portfolioUrl')).trim() ? [{ label: 'Portfolio', url: form.get('portfolioUrl') }] : [], availability: form.get('availability') }) }); setPassport(result.passport); setMessage('Passport saved.'); } catch (err) { setError(err instanceof Error ? err.message : 'Could not save Passport.'); } };
  return <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr]"><form onSubmit={save} className={`${card} space-y-4 p-6`}><p className="font-mono text-xs font-bold uppercase">Permanent candidate Passport</p><h1 className="text-4xl font-black uppercase">Your creative identity</h1><p className="text-sm">Free for candidates. Update it once, then use it for attributable applications.</p>{error && <Notice tone="error">{error}</Notice>}{message && <Notice tone="success">{message}</Notice>}<label className="block font-bold">Public URL slug<input required name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={passport?.slug || ''} className={`${input} mt-1`}/></label><label className="block font-bold">Headline<input required name="headline" defaultValue={passport?.headline || ''} className={`${input} mt-1`}/></label><label className="block font-bold">Location<input required name="location" defaultValue={passport?.location || ''} className={`${input} mt-1`}/></label><label className="block font-bold">Biography<textarea required minLength={20} maxLength={2000} rows={6} name="biography" defaultValue={passport?.biography || ''} className={`${input} mt-1`}/></label><label className="block font-bold">Skills, comma separated<input required name="skills" defaultValue={passport?.skills.join(', ') || ''} className={`${input} mt-1`}/></label><label className="block font-bold">Portfolio URL<input type="url" name="portfolioUrl" defaultValue={passport?.portfolioLinks[0]?.url || ''} className={`${input} mt-1`}/></label><label className="block font-bold">Availability<input required name="availability" defaultValue={passport?.availability || ''} className={`${input} mt-1`}/></label><button className={button}>Save Passport</button></form><aside>{passport ? <PassportCard passport={{...passport, displayName: session.data?.user.name}}/> : <Notice>Your public Passport preview appears after your first save.</Notice>}</aside></div>;
}

function PublicPassport() { const { slug = '' } = useParams(); const [passport, setPassport] = useState<Passport | null>(null); const [error, setError] = useState(''); useEffect(() => { api<{passport: Passport}>(`/passports/${slug}`).then((data) => setPassport(data.passport)).catch((err) => setError(err.message)); }, [slug]); if (error) return <Notice tone="error">{error}</Notice>; return passport ? <div className="mx-auto max-w-3xl"><PassportCard passport={passport}/></div> : <p>Loading Passport…</p>; }

function PassportCard({ passport }: { passport: Passport }) { return <div className={`${card} sticky top-24 overflow-hidden`}><div className="bg-pink-600 p-6 text-white"><Sparkles/><p className="mt-6 font-mono text-xs uppercase">Cre8tiv Passport</p><h1 className="mt-2 text-4xl font-black uppercase">{passport.displayName || 'Candidate'}</h1><p className="mt-2 text-lg font-bold">{passport.headline}</p></div><div className="space-y-6 p-6"><p><MapPin className="mr-2 inline" size={17}/>{passport.location}</p><p className="leading-7">{passport.biography}</p><div><h2 className="font-black uppercase">Skills</h2><div className="mt-2 flex flex-wrap gap-2">{passport.skills.map((skill) => <span key={skill} className="border-2 border-black bg-[#e8ff36] px-2 py-1 text-sm">{skill}</span>)}</div></div><div><h2 className="font-black uppercase">Availability</h2><p>{passport.availability}</p></div>{passport.portfolioLinks.map((link) => <a className={secondaryButton} key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}<ArrowRight size={16}/></a>)}<p className="border-t-2 border-black pt-4 text-xs">Permanent profile · candidate controlled · no ranking score</p></div></div>; }

function PostJobPage() {
  const navigate = useNavigate(); const [error, setError] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); try { await api('/jobs', { method: 'POST', body: JSON.stringify({ title: form.get('title'), company: form.get('company'), location: form.get('location'), workArrangement: form.get('workArrangement'), employmentType: form.get('employmentType'), salaryMin: numberOrNull(form.get('salaryMin')), salaryMax: numberOrNull(form.get('salaryMax')), salaryText: String(form.get('salaryText')).trim() || null, description: form.get('description'), applicationDetails: form.get('applicationDetails') }) }); navigate('/employer'); } catch (err) { setError(err instanceof Error ? err.message : 'Listing submission failed.'); } };
  return <form onSubmit={submit} className={`${card} mx-auto max-w-3xl space-y-5 p-6 sm:p-8`}><p className="font-mono text-xs font-bold uppercase">$30 exclusive · payment after approval</p><h1 className="text-4xl font-black uppercase">Submit for human review</h1><p>Your listing enters the review queue first. The payment hand-off is simulated for Build Week and clearly separated from approval.</p>{error && <Notice tone="error">{error}</Notice>}<div className="grid gap-4 sm:grid-cols-2"><Field name="title" label="Role title"/><Field name="company" label="Company"/><Field name="location" label="Australian location"/><label className="font-bold">Work arrangement<select name="workArrangement" className={`${input} mt-1`}><option value="on_site">On site</option><option value="hybrid">Hybrid</option><option value="remote">Remote within Australia</option></select></label><label className="font-bold">Employment type<select name="employmentType" className={`${input} mt-1`}><option value="full_time">Full time</option><option value="part_time">Part time</option><option value="contract">Contract</option><option value="casual">Casual</option></select></label><Field name="salaryText" label="Salary context" required={false}/><Field name="salaryMin" label="Minimum salary" type="number" required={false}/><Field name="salaryMax" label="Maximum salary" type="number" required={false}/></div><label className="block font-bold">Role description<textarea required minLength={80} maxLength={10000} rows={8} name="description" className={`${input} mt-1`}/></label><label className="block font-bold">Application guidance<textarea required minLength={20} maxLength={2000} rows={4} name="applicationDetails" className={`${input} mt-1`}/></label><button className={button}>Submit to manual review<ArrowRight size={17}/></button></form>;
}

function Field({ name, label, type = 'text', required = true }: {name: string; label: string; type?: string; required?: boolean}) { return <label className="font-bold">{label}<input name={name} type={type} required={required} className={`${input} mt-1`}/></label>; }

function EmployerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]); const [applications, setApplications] = useState<any[]>([]); const [error, setError] = useState('');
  const load = () => api<{jobs: Job[]}>('/employer/jobs').then((data) => setJobs(data.jobs)).catch((err) => setError(err.message)); useEffect(load, []);
  const viewApplications = async (jobId: string) => { try { const data = await api<{applications: any[]}>(`/employer/jobs/${jobId}/applications`); setApplications(data.applications); } catch (err) { setError(err instanceof Error ? err.message : 'Could not load applicants.'); } };
  return <div className="space-y-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-xs font-bold uppercase">Employer desk</p><h1 className="text-4xl font-black uppercase">Your listings</h1></div><Link className={button} to="/post-job">Submit a $30 exclusive</Link></div>{error && <Notice tone="error">{error}</Notice>}<div className="grid gap-4">{jobs.map((job) => <div key={job.id} className={`${card} p-5`}><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="border border-black bg-[#e8ff36] px-2 py-1 font-mono text-xs uppercase">{job.status.replace('_', ' ')}</span><h2 className="mt-3 text-2xl font-black">{job.title}</h2><p>{job.company} · {job.location}</p>{job.reviewNotes && <p className="mt-2 text-sm"><b>Reviewer note:</b> {job.reviewNotes}</p>}</div><button disabled={job.status !== 'published'} onClick={() => viewApplications(job.id)} className={secondaryButton}>View registered applicants</button></div></div>)}</div>{jobs.length === 0 && <Notice>No listings yet. Start with one complete exclusive submission.</Notice>}{applications.length > 0 && <section><h2 className="mb-4 text-3xl font-black uppercase">Registered applicants</h2><div className="grid gap-3">{applications.map((application) => <div className={`${card} p-5`} key={application.id}><div className="flex flex-wrap justify-between gap-3"><div><h3 className="text-xl font-black">{application.candidateName}</h3><p>{application.headline} · {application.location}</p><p className="mt-2 text-sm">{application.note || 'No application note supplied.'}</p></div><Link className={secondaryButton} to={`/passport/${application.passportSlug}`}>View Passport</Link></div></div>)}</div></section>}</div>;
}

function AdminReview() {
  const [jobs, setJobs] = useState<Job[]>([]); const [error, setError] = useState(''); const load = () => api<{jobs: Job[]}>('/admin/jobs').then((data) => setJobs(data.jobs)).catch((err) => setError(err.message)); useEffect(load, []);
  const decide = async (job: Job, action: 'approve'|'reject'|'publish') => { const notes = action === 'reject' ? window.prompt('Give the employer a concise review reason:') : ''; if (action === 'reject' && !notes) return; try { await api(`/admin/jobs/${job.id}/review`, {method:'POST', body:JSON.stringify({action, notes: notes || null})}); load(); } catch (err) { setError(err instanceof Error ? err.message : 'Review failed.'); } };
  return <div className="space-y-6"><div><p className="font-mono text-xs font-bold uppercase">Administrator · human decision</p><h1 className="text-4xl font-black uppercase">Listing review queue</h1><p className="mt-2">Approval never publishes automatically. Review first, then publish as a separate accountable action.</p></div>{error && <Notice tone="error">{error}</Notice>}{jobs.map((job) => <article key={job.id} className={`${card} p-6`}><span className="border border-black bg-[#e8ff36] px-2 py-1 font-mono text-xs uppercase">{job.status.replace('_', ' ')}</span><h2 className="mt-3 text-3xl font-black">{job.title}</h2><p className="font-bold">{job.company} · {job.location}</p><p className="mt-4 whitespace-pre-wrap leading-7">{job.description}</p><div className="mt-5 flex flex-wrap gap-3">{job.status === 'pending_review' ? <><button className={button} onClick={() => decide(job, 'approve')}>Approve</button><button className={secondaryButton} onClick={() => decide(job, 'reject')}>Reject with reason</button></> : <button className={button} onClick={() => decide(job, 'publish')}>Publish chronologically</button>}</div></article>)}{jobs.length === 0 && <Notice>Nothing is waiting for review.</Notice>}</div>;
}

function CandidateApplications() { const [items, setItems] = useState<any[]>([]); const [error, setError] = useState(''); useEffect(() => { api<{applications:any[]}>('/me/applications').then((data) => setItems(data.applications)).catch((err) => setError(err.message)); }, []); return <div><h1 className="text-4xl font-black uppercase">My applications</h1><p className="mt-2">Applications are attributable to your current Passport.</p>{error && <div className="mt-5"><Notice tone="error">{error}</Notice></div>}<div className="mt-6 grid gap-4">{items.map(({application, job}) => <Link to={`/jobs/${job.id}`} className={`${card} p-5`} key={application.id}><span className="font-mono text-xs uppercase">{application.status}</span><h2 className="text-2xl font-black">{job.title}</h2><p>{job.company}</p></Link>)}</div>{!error && items.length === 0 && <div className="mt-5"><Notice>No applications yet.</Notice></div>}</div>; }

function formatSalary(job: Job) { if (job.salaryMin != null && job.salaryMax != null) return `$${job.salaryMin.toLocaleString('en-AU')}–$${job.salaryMax.toLocaleString('en-AU')}`; return job.salaryText || 'Salary supplied on request'; }
function formatDate(value: string | null) { if (!value) return 'Not set'; return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)); }
function numberOrNull(value: FormDataEntryValue | null) { const text = String(value || '').trim(); return text ? Number(text) : null; }

export default function App() { return <HashRouter><Shell><Routes><Route path="/" element={<JobsHome/>}/><Route path="/sign-in" element={<AuthPage/>}/><Route path="/jobs/:jobId" element={<JobDetails/>}/><Route path="/passport/:slug" element={<PublicPassport/>}/><Route path="/passport" element={<Guard role="candidate"><PassportEditor/></Guard>}/><Route path="/applications" element={<Guard role="candidate"><CandidateApplications/></Guard>}/><Route path="/employer" element={<Guard role="employer"><EmployerDashboard/></Guard>}/><Route path="/post-job" element={<Guard role="employer"><PostJobPage/></Guard>}/><Route path="/admin" element={<Guard role="admin"><AdminReview/></Guard>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></Shell></HashRouter>; }
