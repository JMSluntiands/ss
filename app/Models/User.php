<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'blader_name',
        'email',
        'password',
        'role',
        'can_manage_tournaments',
        'can_use_judge',
        'can_score_matches',
        'can_create_tournaments',
        'can_manage_events',
    ];

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isSiteMember(): bool
    {
        $this->loadMissing('siteMember');

        return $this->siteMember !== null;
    }

    public function canCreateTournaments(): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        if ($this->isSiteMember()) {
            return false;
        }

        return (bool) $this->can_create_tournaments;
    }

    public function canManageEvents(): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        if ($this->isSiteMember()) {
            return false;
        }

        return (bool) $this->can_manage_events;
    }

    public function canManageTournaments(): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        if ($this->isSiteMember()) {
            return false;
        }

        return (bool) $this->can_manage_tournaments;
    }

    public function canUseJudge(): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        if ($this->isSiteMember()) {
            return false;
        }

        return (bool) $this->can_use_judge;
    }

    public function canScoreMatches(): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        if ($this->isSiteMember()) {
            return false;
        }

        return (bool) $this->can_score_matches;
    }

    public function tournaments()
    {
        return $this->hasMany(\App\Models\Tournament::class);
    }

    public function siteMember()
    {
        return $this->hasOne(SiteMember::class);
    }

    public function eventRegistrations()
    {
        return $this->hasMany(EventRegistration::class);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
