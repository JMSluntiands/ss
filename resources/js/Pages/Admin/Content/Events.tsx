import AdminLayout from '@/Layouts/AdminLayout';
import { applyTournamentToEventForm, type TournamentForEvent } from '@/utils/eventTournament';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface SiteEvent {
    id: number;
    title: string;
    description: string | null;
    organizer: string | null;
    date: string;
    time: string | null;
    location: string;
    map_address: string | null;
    map_lat: number | null;
    map_lng: number | null;
    format: string | null;
    slots: string | null;
    entry_fee: string | null;
    prizes: Array<{ place: string; prize: string }> | null;
    status: string;
    participants: number | null;
    winner: string | null;
    runner_up: string | null;
    is_upcoming: boolean;
    tournament_id: number | null;
    created_at: string;
}

interface PaginatedData<T> {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
    total: number;
}

interface EventForm {
    title: string;
    description: string;
    organizer: string;
    date: string;
    time: string;
    location: string;
    map_address: string;
    map_lat: string;
    map_lng: string;
    format: string;
    slots: string;
    entry_fee: string;
    prizes: Array<{ place: string; prize: string }>;
    status: string;
    participants: string;
    winner: string;
    runner_up: string;
    is_upcoming: boolean;
    tournament_id: string;
}

const emptyEvent: EventForm = {
    title: '',
    description: '',
    organizer: '',
    date: '',
    time: '',
    location: '',
    map_address: '',
    map_lat: '',
    map_lng: '',
    format: '',
    slots: '',
    entry_fee: '',
    prizes: [],
    status: 'upcoming',
    participants: '',
    winner: '',
    runner_up: '',
    is_upcoming: true,
    tournament_id: '',
};

const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors';

const labelClass = 'block text-xs font-medium text-gray-400 mb-1.5';

const statusColors: Record<string, string> = {
    upcoming: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    ongoing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-zinc-700/30 text-gray-400 border-zinc-700/50',
};

export default function Events({
    events,
    tournaments,
    userName,
}: {
    events: PaginatedData<SiteEvent>;
    tournaments: TournamentForEvent[];
    userName: string;
}) {
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<SiteEvent | null>(null);
    const [form, setForm] = useState<EventForm>(emptyEvent);
    const [confirmDelete, setConfirmDelete] = useState<SiteEvent | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleTournamentChange = (tournamentId: string) => {
        setForm((prev) => applyTournamentToEventForm(prev, tournamentId, tournaments, userName));
    };

    const openCreate = () => {
        if (tournaments.length === 0) {
            alert('Create a tournament first before adding an event.');
            return;
        }
        setEditingEvent(null);
        setForm({ ...emptyEvent, prizes: [] });
        setShowModal(true);
    };

    const openEdit = (event: SiteEvent) => {
        setEditingEvent(event);
        setForm({
            title: event.title,
            description: event.description ?? '',
            organizer: event.organizer ?? '',
            date: event.date,
            time: event.time ?? '',
            location: event.location,
            map_address: event.map_address ?? '',
            map_lat: event.map_lat?.toString() ?? '',
            map_lng: event.map_lng?.toString() ?? '',
            format: event.format ?? '',
            slots: event.slots ?? '',
            entry_fee: event.entry_fee ?? '',
            prizes: event.prizes ?? [],
            status: event.status,
            participants: event.participants?.toString() ?? '',
            winner: event.winner ?? '',
            runner_up: event.runner_up ?? '',
            is_upcoming: event.is_upcoming,
            tournament_id: event.tournament_id?.toString() ?? '',
        });
        setShowModal(true);
    };

    const addPrize = () => {
        setForm({ ...form, prizes: [...form.prizes, { place: '', prize: '' }] });
    };

    const removePrize = (index: number) => {
        setForm({ ...form, prizes: form.prizes.filter((_, i) => i !== index) });
    };

    const updatePrize = (index: number, field: 'place' | 'prize', value: string) => {
        const updated = form.prizes.map((p, i) => (i === index ? { ...p, [field]: value } : p));
        setForm({ ...form, prizes: updated });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const payload = {
            title: form.title,
            description: form.description || null,
            organizer: form.organizer || null,
            date: form.date,
            time: form.time || null,
            location: form.location,
            map_address: form.map_address || null,
            map_lat: form.map_lat ? parseFloat(form.map_lat) : null,
            map_lng: form.map_lng ? parseFloat(form.map_lng) : null,
            format: form.format || null,
            slots: form.slots || null,
            entry_fee: form.entry_fee || null,
            prizes: form.prizes.length > 0 ? form.prizes : null,
            status: form.status,
            participants: form.participants ? parseInt(form.participants) : null,
            winner: form.winner || null,
            runner_up: form.runner_up || null,
            is_upcoming: form.is_upcoming,
            tournament_id: form.tournament_id ? parseInt(form.tournament_id, 10) : null,
        };

        if (editingEvent) {
            router.put(route('admin.content.events.update', editingEvent.id), payload, {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => setShowModal(false),
            });
        } else {
            router.post(route('admin.content.events.store'), payload, {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const handleDelete = (event: SiteEvent) => {
        setProcessing(true);
        router.delete(route('admin.content.events.destroy', event.id), {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setConfirmDelete(null);
            },
        });
    };

    return (
        <AdminLayout currentPage="events">
            <Head title="Events" />

            <div className="p-6 lg:p-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Events</h1>
                        <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                        <p className="text-sm text-gray-500 mt-3">
                            {events.total} total event{events.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-700 to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Event
                    </button>
                </div>

                {/* Events Table */}
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800/60">
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Organizer</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date / Time</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Location</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Entrance Fee</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {events.data.map((event) => (
                                    <tr key={event.id} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white truncate max-w-[220px]">{event.title}</p>
                                                {event.format && (
                                                    <p className="text-xs text-gray-500">{event.format}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="text-sm text-gray-400">{event.organizer ?? '—'}</span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div>
                                                <span className="text-sm text-gray-400">
                                                    {new Date(event.date).toLocaleDateString()}
                                                </span>
                                                {event.time && (
                                                    <p className="text-xs text-gray-600">{event.time}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="text-sm text-gray-400 truncate max-w-[150px] block">{event.location}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                statusColors[event.status] ?? statusColors.upcoming
                                            }`}>
                                                {event.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="text-sm text-gray-400">{event.entry_fee ?? '—'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(event)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete(event)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {events.data.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <p className="text-gray-500 text-sm">No events yet.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {events.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1 mt-6">
                        {events.links.map((link, idx) => (
                            <button
                                key={idx}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                disabled={!link.url}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                    link.active
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        : link.url
                                        ? 'text-gray-500 hover:text-white hover:bg-zinc-800'
                                        : 'text-gray-700 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="fixed z-50 inset-0 flex items-start justify-center p-4 overflow-y-auto">
                        <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50 p-6 my-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                    {editingEvent ? 'Edit Event' : 'Add Event'}
                                </h3>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Link Tournament */}
                                <div>
                                    <label className={labelClass}>Link to Tournament *</label>
                                    <select
                                        value={form.tournament_id}
                                        onChange={(e) => handleTournamentChange(e.target.value)}
                                        required
                                        className={inputClass}
                                    >
                                        <option value="">Select a tournament...</option>
                                        {tournaments.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-gray-600 mt-1">
                                        Auto-fills title, description, organizer, and format from the tournament.
                                    </p>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className={labelClass}>Title</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        required
                                        className={inputClass}
                                        placeholder='e.g. "SS Holiday Wednesday Hatak"'
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className={labelClass}>Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        rows={3}
                                        className={`${inputClass} resize-none`}
                                        placeholder="Event description (optional)"
                                    />
                                </div>

                                {/* Organizer */}
                                <div>
                                    <label className={labelClass}>Organizer</label>
                                    <input
                                        type="text"
                                        value={form.organizer}
                                        onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                                        className={inputClass}
                                        placeholder='e.g. "Harold"'
                                    />
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Date</label>
                                        <input
                                            type="date"
                                            value={form.date}
                                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Time</label>
                                        <input
                                            type="time"
                                            value={form.time}
                                            onChange={(e) => setForm({ ...form, time: e.target.value })}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className={labelClass}>Location</label>
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        required
                                        className={inputClass}
                                        placeholder='e.g. "SM Olongapo City Downtown 4th floor"'
                                    />
                                </div>

                                {/* Map Address */}
                                <div>
                                    <label className={labelClass}>Map Address</label>
                                    <input
                                        type="text"
                                        value={form.map_address}
                                        onChange={(e) => setForm({ ...form, map_address: e.target.value })}
                                        className={inputClass}
                                        placeholder='e.g. "SM City Olongapo Downtown, Olongapo City"'
                                    />
                                </div>

                                {/* Format */}
                                <div>
                                    <label className={labelClass}>Format</label>
                                    <input
                                        type="text"
                                        value={form.format}
                                        onChange={(e) => setForm({ ...form, format: e.target.value })}
                                        className={inputClass}
                                        placeholder='e.g. "Standard 3G"'
                                    />
                                </div>

                                {/* Players & Entrance Fee */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Players</label>
                                        <input
                                            type="text"
                                            value={form.slots}
                                            onChange={(e) => setForm({ ...form, slots: e.target.value })}
                                            className={inputClass}
                                            placeholder="e.g. 20"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Entrance Fee</label>
                                        <input
                                            type="text"
                                            value={form.entry_fee}
                                            onChange={(e) => setForm({ ...form, entry_fee: e.target.value })}
                                            className={inputClass}
                                            placeholder="e.g. 150"
                                        />
                                    </div>
                                </div>

                                {/* Prizes */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-medium text-gray-400">Prizes</label>
                                        <button
                                            type="button"
                                            onClick={addPrize}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add Prize
                                        </button>
                                    </div>
                                    {form.prizes.length === 0 && (
                                        <p className="text-xs text-gray-600 py-3 text-center border border-dashed border-zinc-700/50 rounded-xl">
                                            No prizes added yet. Click &ldquo;Add Prize&rdquo; to get started.
                                        </p>
                                    )}
                                    <div className="space-y-2">
                                        {form.prizes.map((prize, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                                <input
                                                    type="text"
                                                    value={prize.place}
                                                    onChange={(e) => updatePrize(index, 'place', e.target.value)}
                                                    className={`${inputClass} flex-[2]`}
                                                    placeholder='e.g. "Champion"'
                                                />
                                                <input
                                                    type="text"
                                                    value={prize.prize}
                                                    onChange={(e) => updatePrize(index, 'prize', e.target.value)}
                                                    className={`${inputClass} flex-[3]`}
                                                    placeholder='e.g. "Dranstrike no code"'
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removePrize(index)}
                                                    className="mt-1 p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Status & Participants */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Status</label>
                                        <select
                                            value={form.status}
                                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                                            className={inputClass}
                                        >
                                            <option value="upcoming">Upcoming</option>
                                            <option value="ongoing">Ongoing</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Participants</label>
                                        <input
                                            type="number"
                                            value={form.participants}
                                            onChange={(e) => setForm({ ...form, participants: e.target.value })}
                                            className={inputClass}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {/* Winner & Runner-up */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Winner</label>
                                        <input
                                            type="text"
                                            value={form.winner}
                                            onChange={(e) => setForm({ ...form, winner: e.target.value })}
                                            className={inputClass}
                                            placeholder="Winner name"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Runner-up</label>
                                        <input
                                            type="text"
                                            value={form.runner_up}
                                            onChange={(e) => setForm({ ...form, runner_up: e.target.value })}
                                            className={inputClass}
                                            placeholder="Runner-up name"
                                        />
                                    </div>
                                </div>

                                {/* Is Upcoming Toggle */}
                                <div className="flex items-center gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, is_upcoming: !form.is_upcoming })}
                                        className={`relative w-10 h-5 rounded-full transition-colors ${
                                            form.is_upcoming ? 'bg-red-500' : 'bg-zinc-700'
                                        }`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                            form.is_upcoming ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                    </button>
                                    <span className="text-sm text-gray-400">
                                        {form.is_upcoming ? 'Upcoming Event' : 'Past Event'}
                                    </span>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-700 to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110 transition-all disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
                    <div className="fixed z-50 inset-0 flex items-center justify-center p-4">
                        <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white">Delete Event</h3>
                            </div>
                            <p className="text-sm text-gray-400 mb-6">
                                Are you sure you want to delete &ldquo;{confirmDelete.title}&rdquo;? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(confirmDelete)}
                                    disabled={processing}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-700 to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110 transition-all disabled:opacity-50"
                                >
                                    {processing ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
