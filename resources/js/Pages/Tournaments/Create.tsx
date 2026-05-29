import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface Tournament {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    tournament_type: string;
    format: string;
    group_stage_format: string | null;
    final_stage_format: string | null;
    participants_per_group: number | null;
    advance_per_group: number | null;
    break_ties: boolean;
    pts_for_match_win: number | null;
    pts_for_match_tie: number | null;
    pts_for_game_win: number | null;
    pts_for_game_tie: number | null;
    pts_for_bye: number | null;
    swiss_rounds: number | null;
    swiss_top_cut_players: number | null;
    stadiums: number | null;
    third_place_match: boolean;
    placement_matches_fifth_seventh: boolean;
}

interface Props {
    tournament?: Tournament;
}

type PlacementTone = 'yes' | 'maybe' | 'no' | 'na';

function placementToneClass(tone: PlacementTone): string {
    switch (tone) {
        case 'yes':
            return 'text-emerald-400/95';
        case 'maybe':
            return 'text-amber-400/95';
        case 'no':
            return 'text-slate-500';
        case 'na':
            return 'text-slate-400';
        default:
            return 'text-slate-500';
    }
}

function placementLabel(tone: PlacementTone): string {
    switch (tone) {
        case 'yes':
            return 'Playoff';
        case 'maybe':
            return 'If bracket fits';
        case 'no':
            return 'None';
        case 'na':
            return 'Bracket';
        default:
            return '';
    }
}

/** Explains which ranks get extra placement matches (matches backend behaviour). */
function PlacementRanksSummary({
    tournament_type,
    format,
    group_stage_format,
    final_stage_format,
    third_place_match,
    placement_matches_fifth_seventh,
    swiss_top_cut_players,
}: {
    tournament_type: string;
    format: string;
    group_stage_format: string | null;
    final_stage_format: string | null;
    third_place_match: boolean;
    placement_matches_fifth_seventh: boolean;
    swiss_top_cut_players: string;
}) {
    const topCutN = parseInt(String(swiss_top_cut_players ?? ''), 10) || 0;
    const finalElim = tournament_type === 'two_stage' ? (final_stage_format || 'single_elimination') : format;
    const groupFmt = group_stage_format || 'swiss';

    const rowsForSingleElim = (): { rank: string; tone: PlacementTone; detail: string }[] => [
        {
            rank: '3rd',
            tone: third_place_match ? 'yes' : 'no',
            detail: third_place_match
                ? 'Bronze match between the two semi-final losers.'
                : 'No separate bronze match; both semi-final losers tie for 3rd unless you handle it manually.',
        },
        {
            rank: '4th',
            tone: third_place_match ? 'yes' : 'no',
            detail: third_place_match
                ? 'Loser of the bronze match.'
                : 'No extra match—same situation as 3rd if bronze is off.',
        },
        {
            rank: '5th–7th',
            tone: placement_matches_fifth_seventh ? 'maybe' : 'no',
            detail: placement_matches_fifth_seventh
                ? 'Extra mini-bracket for the four quarter-final losers (5th vs 6th final, 7th from semi losers). Only created if the bracket has a quarter-final round (usually 8+ teams).'
                : 'Turn on “5th–7th placement mini-bracket” to add these matches (independent of 3rd place).',
        },
        {
            rank: '8th–12th',
            tone: 'no',
            detail:
                'No automatic playoff pairs (e.g. 7–8, 9–10) through 12th yet—ordering follows main single-elim results. Full paired placement ladders could be added later.',
        },
    ];

    const rowsForDoubleElim = (): { rank: string; tone: PlacementTone; detail: string }[] => [
        {
            rank: '3rd–12th',
            tone: 'na',
            detail:
                'Double elimination resolves most ranks through winners / losers brackets and grand finals. The placement checkboxes here only affect single elimination; they do not add a separate bronze path in double elim.',
        },
    ];

    const rowsStandings = (label: string): { rank: string; tone: PlacementTone; detail: string }[] => [
        {
            rank: '3rd–12th',
            tone: 'na',
            detail: `${label}: final order comes from standings / match results, not from the single-elim placement options below.`,
        },
    ];

    return (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 space-y-3">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placement (3rd–12th)</p>
                <p className="text-[11px] text-slate-500 mt-1">
                    Which ranks get <span className="text-slate-400">extra</span> playoff matches, based on format and your placement options.
                </p>
            </div>

            {tournament_type === 'two_stage' ? (
                <div className="space-y-4">
                    <div>
                        <p className="text-[10px] font-bold text-cyan-500/90 uppercase tracking-wider mb-2">
                            Group stage ({groupFmt === 'swiss' ? 'Swiss' : 'Round Robin'})
                        </p>
                        <div className="space-y-2 pl-1 border-l border-slate-700/60 ml-1">
                            {rowsStandings('Group stage').map((r) => (
                                <div key={r.rank} className="pl-3">
                                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                        <span className="text-xs font-bold text-white w-16 shrink-0">{r.rank}</span>
                                        <span className={`text-[11px] font-semibold ${placementToneClass(r.tone)}`}>{placementLabel(r.tone)}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{r.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-cyan-500/90 uppercase tracking-wider mb-2">
                            Final stage ({finalElim === 'double_elimination' ? 'Double Elimination' : 'Single Elimination'})
                        </p>
                        <div className="space-y-2 pl-1 border-l border-slate-700/60 ml-1">
                            {(finalElim === 'double_elimination' ? rowsForDoubleElim() : rowsForSingleElim()).map((r) => (
                                <div key={r.rank} className="pl-3">
                                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                        <span className="text-xs font-bold text-white w-16 shrink-0">{r.rank}</span>
                                        <span className={`text-[11px] font-semibold ${placementToneClass(r.tone)}`}>{placementLabel(r.tone)}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{r.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : tournament_type === 'single_elimination' && (format === 'swiss' || format === 'round_robin') && topCutN >= 2 ? (
                <div className="space-y-4">
                    <div>
                        <p className="text-[10px] font-bold text-cyan-500/90 uppercase tracking-wider mb-2">
                            {format === 'round_robin' ? 'Round Robin' : 'Swiss rounds'} (before cut)
                        </p>
                        <div className="space-y-2 pl-1 border-l border-slate-700/60 ml-1">
                            {rowsStandings('Swiss rounds').map((r) => (
                                <div key={r.rank} className="pl-3">
                                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                        <span className="text-xs font-bold text-white w-16 shrink-0">{r.rank}</span>
                                        <span className={`text-[11px] font-semibold ${placementToneClass(r.tone)}`}>{placementLabel(r.tone)}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{r.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-cyan-500/90 uppercase tracking-wider mb-2">
                            Playoff bracket (top {topCutN} from standings, single elimination)
                        </p>
                        <div className="space-y-2 pl-1 border-l border-slate-700/60 ml-1">
                            {rowsForSingleElim().map((r) => (
                                <div key={r.rank} className="pl-3">
                                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                        <span className="text-xs font-bold text-white w-16 shrink-0">{r.rank}</span>
                                        <span className={`text-[11px] font-semibold ${placementToneClass(r.tone)}`}>{placementLabel(r.tone)}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{r.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : format === 'swiss' || format === 'round_robin' ? (
                <div className="space-y-2 pl-1 border-l border-slate-700/60 ml-1">
                    {rowsStandings('Swiss / Round Robin').map((r) => (
                        <div key={r.rank} className="pl-3">
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                <span className="text-xs font-bold text-white w-16 shrink-0">{r.rank}</span>
                                <span className={`text-[11px] font-semibold ${placementToneClass(r.tone)}`}>{placementLabel(r.tone)}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{r.detail}</p>
                        </div>
                    ))}
                </div>
            ) : format === 'double_elimination' ? (
                <div className="space-y-2 pl-1 border-l border-slate-700/60 ml-1">
                    {rowsForDoubleElim().map((r) => (
                        <div key={r.rank} className="pl-3">
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                <span className="text-xs font-bold text-white w-16 shrink-0">{r.rank}</span>
                                <span className={`text-[11px] font-semibold ${placementToneClass(r.tone)}`}>{placementLabel(r.tone)}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{r.detail}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2 pl-1 border-l border-slate-700/60 ml-1">
                    {rowsForSingleElim().map((r) => (
                        <div key={r.rank} className="pl-3">
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                <span className="text-xs font-bold text-white w-16 shrink-0">{r.rank}</span>
                                <span className={`text-[11px] font-semibold ${placementToneClass(r.tone)}`}>{placementLabel(r.tone)}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{r.detail}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Create({ tournament }: Props) {
    const user = usePage().props.auth.user;
    const [showAdvanced, setShowAdvanced] = useState(false);
    const isEditing = !!tournament;

    const { data, setData, post, put, processing, errors } = useForm({
        name: tournament?.name ?? '',
        slug: tournament?.slug ?? '',
        description: tournament?.description ?? '',
        tournament_type: tournament?.tournament_type ?? 'single_elimination',
        format: tournament?.format ?? 'single_elimination',
        group_stage_format: tournament?.group_stage_format ?? 'swiss',
        final_stage_format: tournament?.final_stage_format ?? 'single_elimination',
        participants_per_group: tournament?.participants_per_group?.toString() ?? '4',
        advance_per_group: tournament?.advance_per_group?.toString() ?? '2',
        break_ties: tournament?.break_ties ?? false,
        pts_for_match_win: tournament?.pts_for_match_win?.toString() ?? '1.0',
        pts_for_match_tie: tournament?.pts_for_match_tie?.toString() ?? '0.5',
        pts_for_game_win: tournament?.pts_for_game_win?.toString() ?? '0.0',
        pts_for_game_tie: tournament?.pts_for_game_tie?.toString() ?? '0.0',
        pts_for_bye: tournament?.pts_for_bye?.toString() ?? '1.0',
        swiss_rounds: tournament?.swiss_rounds?.toString() ?? '',
        swiss_top_cut_players:
            tournament?.swiss_top_cut_players != null && tournament.swiss_top_cut_players > 0
                ? String(tournament.swiss_top_cut_players)
                : '',
        stadiums: tournament?.stadiums?.toString() ?? '',
        third_place_match: tournament?.third_place_match ?? false,
        placement_matches_fifth_seventh: tournament?.placement_matches_fifth_seventh ?? false,
    });

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleNameChange = (value: string) => {
        setData((prev) => ({
            ...prev,
            name: value,
            slug: generateSlug(value),
        }));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('tournaments.update', tournament.id));
        } else {
            post(route('tournaments.store'));
        }
    };

    const topCutPlayers = parseInt(String(data.swiss_top_cut_players ?? ''), 10) || 0;
    const finalElimForPlacement =
        data.tournament_type === 'two_stage'
            ? (data.final_stage_format || 'single_elimination')
            : data.tournament_type === 'single_elimination' && (data.format === 'swiss' || data.format === 'round_robin') && topCutPlayers >= 2
              ? 'single_elimination'
              : data.format;
    const usesSingleElimPlacement = finalElimForPlacement === 'single_elimination';

    const inputClass =
        'block w-full rounded-xl border border-slate-700/50 bg-slate-800/50 py-3 px-4 text-white placeholder-slate-500 transition-all focus:border-cyan-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20';
    const labelClass = 'block text-sm font-medium text-slate-300 mb-2';
    const selectClass = `${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10`;
    const sectionTitleClass = 'text-xs font-bold tracking-wider text-slate-500 uppercase';

    return (
        <AuthenticatedLayout currentPage="tournaments">
            <Head title={isEditing ? 'Edit Tournament' : 'New Tournament'} />

            <div className="p-6 lg:p-10 max-w-4xl">
                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-white italic">{isEditing ? 'Edit Tournament' : 'New Tournament'}</h1>
                    <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                </div>

                <form onSubmit={submit} className="space-y-10">
                    {/* ============ BASIC INFO ============ */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className={sectionTitleClass}>Basic Info</h2>
                        </div>

                        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-5">
                            {/* Host */}
                            <div>
                                <label className={labelClass}>Host</label>
                                <div className="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/50 py-3 px-4">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-white text-sm">{user.name}</span>
                                </div>
                            </div>

                            {/* Tournament Name */}
                            <div>
                                <label htmlFor="name" className={labelClass}>
                                    Tournament name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="Enter tournament name"
                                    required
                                    className={inputClass}
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            {/* URL */}
                            <div>
                                <label htmlFor="slug" className={labelClass}>URL</label>
                                <div className="flex items-center rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
                                    <span className="px-4 py-3 text-sm text-slate-500 bg-slate-800/80 border-r border-slate-700/50 whitespace-nowrap">
                                        beybladex.com/t/
                                    </span>
                                    <input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        placeholder="tournament-url"
                                        className="flex-1 bg-transparent py-3 px-4 text-white placeholder-slate-500 focus:outline-none"
                                    />
                                </div>
                                <InputError message={errors.slug} className="mt-2" />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className={labelClass}>Description</label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Add a description for your tournament..."
                                    rows={4}
                                    className={`${inputClass} resize-none`}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {/* Stadiums */}
                            <div>
                                <label htmlFor="stadiums" className={labelClass}>Number of Stadiums</label>
                                <input
                                    id="stadiums"
                                    type="number"
                                    value={data.stadiums}
                                    onChange={(e) => setData('stadiums', e.target.value)}
                                    placeholder="e.g. 4"
                                    min="1"
                                    className={`${inputClass} max-w-[200px]`}
                                />
                                <p className="mt-1 text-xs text-slate-500">How many stadiums are available for matches.</p>
                                <InputError message={errors.stadiums} className="mt-2" />
                            </div>
                        </div>
                    </section>

                    {/* ============ GAME INFO ============ */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className={sectionTitleClass}>Game Info</h2>
                        </div>

                        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-5">
                            {/* Type */}
                            <div>
                                <label className={labelClass}>Type</label>
                                <div className="space-y-3">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="tournament_type"
                                            value="single_elimination"
                                            checked={data.tournament_type === 'single_elimination'}
                                            onChange={() => setData((prev) => ({
                                                ...prev,
                                                tournament_type: 'single_elimination',
                                                format: prev.format === 'swiss' || prev.format === 'round_robin'
                                                    ? prev.format
                                                    : 'single_elimination',
                                            }))}
                                            className="mt-0.5 h-4 w-4 border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20 focus:ring-offset-0"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                                                Single Stage Tournament
                                            </span>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                One stage from start to finish. For Swiss with a playoff bracket, choose Swiss below and set{' '}
                                                <span className="text-slate-400">top cut (top N)</span>.
                                            </p>
                                        </div>
                                    </label>
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="tournament_type"
                                            value="two_stage"
                                            checked={data.tournament_type === 'two_stage'}
                                            onChange={() => setData((prev) => ({
                                                ...prev,
                                                tournament_type: 'two_stage',
                                                format: prev.group_stage_format || 'swiss',
                                            }))}
                                            className="mt-0.5 h-4 w-4 border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20 focus:ring-offset-0"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                                                Two Stage Tournament
                                            </span>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Swiss or round robin in two groups, then a <span className="text-slate-400">top cut</span> into a final
                                                bracket (single or double elimination). Configure how many advance per group below.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Format - Single Stage */}
                            {data.tournament_type === 'single_elimination' && (
                                <div>
                                    <label htmlFor="format" className={labelClass}>
                                        Format <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        id="format"
                                        value={data.format}
                                        onChange={(e) => setData('format', e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="single_elimination">Single Elimination</option>
                                        <option value="double_elimination">Double Elimination</option>
                                        <option value="round_robin">Round Robin</option>
                                        <option value="swiss">Swiss</option>
                                    </select>

                                    {data.format === 'round_robin' && (
                                        <div className="mt-5 pt-5 border-t border-slate-700/30 space-y-4">
                                            <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 px-4 py-3 space-y-3">
                                                <p className="text-xs font-bold uppercase tracking-wider text-cyan-400/90">Top cut (optional)</p>
                                                <p className="text-xs text-slate-400 leading-relaxed">
                                                    After all Round Robin rounds finish, the top players by standings can enter a{' '}
                                                    <span className="text-slate-300 font-medium">single elimination playoff</span>. Leave blank for
                                                    standings-only (no playoff bracket). For two parallel groups into one finals bracket, use Two stage.
                                                </p>
                                                <div>
                                                    <label htmlFor="rr_top_cut_players" className={labelClass}>
                                                        Players in playoff bracket (top N)
                                                    </label>
                                                    <input
                                                        id="rr_top_cut_players"
                                                        type="number"
                                                        min={2}
                                                        max={512}
                                                        value={data.swiss_top_cut_players}
                                                        onChange={(e) => setData('swiss_top_cut_players', e.target.value)}
                                                        placeholder="e.g. 8 — leave blank for no playoff"
                                                        className={`${inputClass} max-w-[200px]`}
                                                    />
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Must be at least 2 if set. Bracket is seeded from Round Robin standings (1st vs lowest, etc.).
                                                    </p>
                                                    <InputError message={errors.swiss_top_cut_players} className="mt-2" />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setData((prev) => ({
                                                            ...prev,
                                                            tournament_type: 'two_stage',
                                                            group_stage_format: 'round_robin',
                                                            format: 'round_robin',
                                                            final_stage_format: 'single_elimination',
                                                        }))
                                                    }
                                                    className="text-xs font-semibold rounded-lg px-3 py-2 bg-cyan-600/20 text-cyan-200 border border-cyan-500/30 hover:bg-cyan-600/30 transition-colors"
                                                >
                                                    Switch to two-stage (top cut layout)
                                                </button>
                                            </div>
                                            <div>
                                                <label htmlFor="rr_rounds_single" className={labelClass}>Number of rounds</label>
                                                <input
                                                    id="rr_rounds_single"
                                                    type="number"
                                                    value={data.swiss_rounds}
                                                    onChange={(e) => setData('swiss_rounds', e.target.value)}
                                                    placeholder="Auto (recommended)"
                                                    min="1"
                                                    className={`${inputClass} max-w-[200px]`}
                                                />
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Default (blank): full round robin — everyone plays everyone once. Even players: participants − 1 rounds.
                                                    Odd players: participants rounds (one bye per round). Set a lower number only if you want a shortened
                                                    schedule (not everyone will meet).
                                                </p>
                                            </div>
                                            <div className="space-y-4">
                                                {[
                                                    { key: 'pts_for_match_win' as const, label: 'points per match win' },
                                                    { key: 'pts_for_match_tie' as const, label: 'points per match tie' },
                                                    { key: 'pts_for_game_win' as const, label: 'points per game/set win' },
                                                    { key: 'pts_for_game_tie' as const, label: 'points per game/set tie' },
                                                    { key: 'pts_for_bye' as const, label: 'points per bye' },
                                                ].map((field) => (
                                                    <div key={field.key} className="flex items-center gap-4">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={data[field.key]}
                                                            onChange={(e) => setData(field.key, e.target.value)}
                                                            className="w-24 rounded-xl border border-slate-700/50 bg-slate-800/50 py-2.5 px-4 text-white text-sm text-center transition-all focus:border-cyan-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                                        />
                                                        <span className="text-sm text-slate-400">{field.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {data.format === 'swiss' && (
                                        <div className="mt-5 pt-5 border-t border-slate-700/30 space-y-4">
                                            <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 px-4 py-3 space-y-3">
                                                <p className="text-xs font-bold uppercase tracking-wider text-cyan-400/90">Top cut (optional)</p>
                                                <p className="text-xs text-slate-400 leading-relaxed">
                                                    After all Swiss rounds finish, the top players by standings can enter a{' '}
                                                    <span className="text-slate-300 font-medium">single elimination playoff</span>. Leave the field blank for
                                                    Swiss-only (standings decide final order). For two parallel Swiss groups into one finals bracket, use
                                                    Two stage instead.
                                                </p>
                                                <div>
                                                    <label htmlFor="swiss_top_cut_players" className={labelClass}>
                                                        Players in playoff bracket (top N)
                                                    </label>
                                                    <input
                                                        id="swiss_top_cut_players"
                                                        type="number"
                                                        min={2}
                                                        max={512}
                                                        value={data.swiss_top_cut_players}
                                                        onChange={(e) => setData('swiss_top_cut_players', e.target.value)}
                                                        placeholder="e.g. 8 — leave blank for no playoff"
                                                        className={`${inputClass} max-w-[200px]`}
                                                    />
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Must be at least 2 if set. The bracket is built from Swiss standings order (1st seed vs lowest, etc.).
                                                    </p>
                                                    <InputError message={errors.swiss_top_cut_players} className="mt-2" />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setData((prev) => ({
                                                            ...prev,
                                                            tournament_type: 'two_stage',
                                                            group_stage_format: 'swiss',
                                                            format: 'swiss',
                                                            final_stage_format: 'single_elimination',
                                                        }))
                                                    }
                                                    className="text-xs font-semibold rounded-lg px-3 py-2 bg-cyan-600/20 text-cyan-200 border border-cyan-500/30 hover:bg-cyan-600/30 transition-colors"
                                                >
                                                    Switch to two-stage (two Swiss groups → finals)
                                                </button>
                                            </div>
                                            <div>
                                                <label htmlFor="swiss_rounds_single" className={labelClass}>Number of rounds</label>
                                                <input
                                                    id="swiss_rounds_single"
                                                    type="number"
                                                    value={data.swiss_rounds}
                                                    onChange={(e) => setData('swiss_rounds', e.target.value)}
                                                    placeholder="Auto (recommended)"
                                                    min="1"
                                                    className={`${inputClass} max-w-[200px]`}
                                                />
                                                <p className="mt-1 text-xs text-slate-500">Leave blank for automatic calculation based on participant count.</p>
                                            </div>
                                            <div className="space-y-4">
                                                {[
                                                    { key: 'pts_for_match_win' as const, label: 'points per match win' },
                                                    { key: 'pts_for_match_tie' as const, label: 'points per match tie' },
                                                    { key: 'pts_for_game_win' as const, label: 'points per game/set win' },
                                                    { key: 'pts_for_game_tie' as const, label: 'points per game/set tie' },
                                                    { key: 'pts_for_bye' as const, label: 'points per bye' },
                                                ].map((field) => (
                                                    <div key={field.key} className="flex items-center gap-4">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={data[field.key]}
                                                            onChange={(e) => setData(field.key, e.target.value)}
                                                            className="w-24 rounded-xl border border-slate-700/50 bg-slate-800/50 py-2.5 px-4 text-white text-sm text-center transition-all focus:border-cyan-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                                        />
                                                        <span className="text-sm text-slate-400">{field.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(data.format === 'single_elimination' || data.format === 'double_elimination') && (
                                        <label className="flex items-center gap-2 mt-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={data.break_ties}
                                                onChange={(e) => setData('break_ties', e.target.checked)}
                                                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20 focus:ring-offset-0"
                                            />
                                            <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                                                Break ties with placement matches
                                            </span>
                                        </label>
                                    )}
                                </div>
                            )}

                            {/* Two Stage Configuration */}
                            {data.tournament_type === 'two_stage' && (
                                <>
                                    {/* Group Stage */}
                                    <div>
                                        <label htmlFor="group_stage_format" className={labelClass}>
                                            Group Stage <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            id="group_stage_format"
                                            value={data.group_stage_format}
                                            onChange={(e) => setData((prev) => ({
                                                ...prev,
                                                group_stage_format: e.target.value,
                                                format: e.target.value,
                                            }))}
                                            className={selectClass}
                                        >
                                            <option value="swiss">Swiss</option>
                                            <option value="round_robin">Round Robin</option>
                                        </select>

                                        <div className="mt-5 pt-5 border-t border-slate-700/30 space-y-4">
                                            <p className="text-xs font-bold uppercase tracking-wider text-cyan-500/80">Top cut into finals</p>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="number"
                                                    value={data.participants_per_group}
                                                    onChange={(e) => setData('participants_per_group', e.target.value)}
                                                    min="2"
                                                    className="w-24 rounded-xl border border-slate-700/50 bg-slate-800/50 py-2.5 px-4 text-white text-sm text-center transition-all focus:border-cyan-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                                />
                                                <span className="text-sm text-slate-400">
                                                    participants <em className="text-slate-500">compete</em> in each group
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="number"
                                                    value={data.advance_per_group}
                                                    onChange={(e) => setData('advance_per_group', e.target.value)}
                                                    min="1"
                                                    className="w-24 rounded-xl border border-slate-700/50 bg-slate-800/50 py-2.5 px-4 text-white text-sm text-center transition-all focus:border-cyan-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                                />
                                                <span className="text-sm text-slate-400">
                                                    participants <em className="text-slate-500">advance</em> from each group
                                                </span>
                                            </div>
                                            {(data.group_stage_format === 'swiss' || data.group_stage_format === 'round_robin') && (
                                                <div className="pt-2">
                                                    <label htmlFor="swiss_top_cut_two_stage" className={labelClass}>
                                                        Total in playoff bracket (optional)
                                                    </label>
                                                    <input
                                                        id="swiss_top_cut_two_stage"
                                                        type="number"
                                                        min={2}
                                                        max={512}
                                                        value={data.swiss_top_cut_players}
                                                        onChange={(e) => setData('swiss_top_cut_players', e.target.value)}
                                                        placeholder="e.g. 16 — overrides per-group math"
                                                        className={`${inputClass} max-w-[200px]`}
                                                    />
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        If set, standings use this total instead of advance × number of groups.
                                                    </p>
                                                    <InputError message={errors.swiss_top_cut_players} className="mt-2" />
                                                </div>
                                            )}
                                        </div>

                                        {(data.group_stage_format === 'swiss' || data.group_stage_format === 'round_robin') && (
                                            <div className="mt-5 pt-5 border-t border-slate-700/30 space-y-4">
                                                <div>
                                                    <label htmlFor="swiss_rounds_two_stage" className={labelClass}>Number of rounds</label>
                                                    <input
                                                        id="swiss_rounds_two_stage"
                                                        type="number"
                                                        value={data.swiss_rounds}
                                                        onChange={(e) => setData('swiss_rounds', e.target.value)}
                                                        placeholder="Auto (recommended)"
                                                        min="1"
                                                        className={`${inputClass} max-w-[200px]`}
                                                    />
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {data.group_stage_format === 'round_robin'
                                                            ? 'Leave blank for full round robin (everyone vs everyone). Set fewer rounds only for a shortened group stage.'
                                                            : 'Leave blank for automatic calculation based on participant count.'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-5 pt-5 border-t border-slate-700/30 space-y-4">
                                            {[
                                                { key: 'pts_for_match_win' as const, label: 'points per match win' },
                                                { key: 'pts_for_match_tie' as const, label: 'points per match tie' },
                                                { key: 'pts_for_game_win' as const, label: 'points per game/set win' },
                                                { key: 'pts_for_game_tie' as const, label: 'points per game/set tie' },
                                                { key: 'pts_for_bye' as const, label: 'points per bye' },
                                            ].map((field) => (
                                                <div key={field.key} className="flex items-center gap-4">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={data[field.key]}
                                                        onChange={(e) => setData(field.key, e.target.value)}
                                                        className="w-24 rounded-xl border border-slate-700/50 bg-slate-800/50 py-2.5 px-4 text-white text-sm text-center transition-all focus:border-cyan-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                                    />
                                                    <span className="text-sm text-slate-400">{field.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Final Stage */}
                                    <div>
                                        <label htmlFor="final_stage_format" className={labelClass}>
                                            Final Stage <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            id="final_stage_format"
                                            value={data.final_stage_format}
                                            onChange={(e) => setData('final_stage_format', e.target.value)}
                                            className={selectClass}
                                        >
                                            <option value="single_elimination">Single Elimination</option>
                                            <option value="double_elimination">Double Elimination</option>
                                        </select>

                                        <label className="flex items-center gap-2 mt-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={data.break_ties}
                                                onChange={(e) => setData('break_ties', e.target.checked)}
                                                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20 focus:ring-offset-0"
                                            />
                                            <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                                                Break ties with placement matches
                                            </span>
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>


                    {/* ============ ADVANCED OPTIONS ============ */}
                    <section>
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Advanced Options
                            <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showAdvanced && (
                            <div className="mt-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-4">
                                {!usesSingleElimPlacement && (
                                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-100/90 leading-relaxed">
                                        These toggles are saved with the tournament but{' '}
                                        <span className="font-semibold text-amber-50">only apply when the bracket is single elimination</span>{' '}
                                        (single-stage single elim, or two-stage with a single-elimination final). Swiss / round robin / double elim do not
                                        generate these placement brackets. Switch format (or final stage) to single elimination to enable them when the
                                        bracket is generated.
                                    </div>
                                )}

                                <div className={!usesSingleElimPlacement ? 'space-y-4 opacity-80' : 'space-y-4'}>
                                    <label
                                        className={`flex items-center gap-3 group ${
                                            usesSingleElimPlacement ? 'cursor-pointer' : 'cursor-not-allowed'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            disabled={!usesSingleElimPlacement}
                                            checked={data.third_place_match}
                                            onChange={(e) => setData('third_place_match', e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <div>
                                            <span
                                                className={`text-sm text-slate-300 ${
                                                    usesSingleElimPlacement ? 'group-hover:text-white' : ''
                                                } transition-colors`}
                                            >
                                                Include a 3rd place match (bronze)
                                            </span>
                                            <p className="text-xs text-slate-500">
                                                Adds one match between the two semi-final losers to decide 3rd and 4th. Does not add the 5th–7th
                                                mini-bracket—that is a separate option below.
                                            </p>
                                        </div>
                                    </label>

                                    <label
                                        className={`flex items-center gap-3 group ${
                                            usesSingleElimPlacement ? 'cursor-pointer' : 'cursor-not-allowed'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            disabled={!usesSingleElimPlacement}
                                            checked={data.placement_matches_fifth_seventh}
                                            onChange={(e) => setData('placement_matches_fifth_seventh', e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <div>
                                            <span
                                                className={`text-sm text-slate-300 ${
                                                    usesSingleElimPlacement ? 'group-hover:text-white' : ''
                                                } transition-colors`}
                                            >
                                                5th–7th placement mini-bracket (QF losers)
                                            </span>
                                            <p className="text-xs text-slate-500">
                                                Only when the bracket has a quarter-final round (typically 8+ players): extra matches among the four QF
                                                losers for 5th, 6th, and 7th. Independent of the bronze match.
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                <PlacementRanksSummary
                                    tournament_type={data.tournament_type}
                                    format={data.format}
                                    group_stage_format={data.group_stage_format}
                                    final_stage_format={data.final_stage_format}
                                    third_place_match={data.third_place_match}
                                    placement_matches_fifth_seventh={data.placement_matches_fifth_seventh}
                                    swiss_top_cut_players={data.swiss_top_cut_players}
                                />
                            </div>
                        )}
                    </section>

                    {/* ============ SUBMIT ============ */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800/80">
                        <a
                            href={route('dashboard')}
                            className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700/50 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
                        >
                            Cancel
                        </a>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                isEditing ? 'Update Tournament' : 'Save and Continue'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
