<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tournament extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'game',
        'tournament_type',
        'format',
        'group_stage_format',
        'final_stage_format',
        'participants_per_group',
        'advance_per_group',
        'swiss_rounds',
        'swiss_top_cut_players',
        'current_round',
        'pts_for_match_win',
        'pts_for_match_tie',
        'pts_for_game_win',
        'pts_for_game_tie',
        'pts_for_bye',
        'break_ties',
        'registration_type',
        'registration_fee',
        'require_team',
        'max_participants',
        'stadiums',
        'judge_code',
        'start_time',
        'tentative',
        'enable_voting',
        'enable_predictions',
        'third_place_match',
        'placement_matches_fifth_seventh',
        'de_split_participants',
        'de_grand_finals',
        'notify_participants',
        'status',
    ];

    protected $hidden = ['judge_code'];

    protected function casts(): array
    {
        return [
            'break_ties' => 'boolean',
            'require_team' => 'boolean',
            'tentative' => 'boolean',
            'enable_voting' => 'boolean',
            'enable_predictions' => 'boolean',
            'third_place_match' => 'boolean',
            'placement_matches_fifth_seventh' => 'boolean',
            'de_split_participants' => 'boolean',
            'notify_participants' => 'boolean',
            'start_time' => 'datetime',
            'swiss_top_cut_players' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class)->orderBy('seed');
    }

    public function matches(): HasMany
    {
        return $this->hasMany(TournamentMatch::class)->orderBy('round')->orderBy('match_number');
    }

    public function swissStandings(): HasMany
    {
        return $this->hasMany(SwissStanding::class)->orderBy('rank');
    }
}
