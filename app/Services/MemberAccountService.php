<?php

namespace App\Services;

use App\Models\SiteMember;
use App\Models\User;
use App\Support\UserAccountType;
use Illuminate\Support\Str;

class MemberAccountService
{
    public function tournamentBladerName(User $user): string
    {
        if ($user->blader_name) {
            return $user->blader_name;
        }

        $user->loadMissing('siteMember');

        if ($user->siteMember?->name) {
            return $user->siteMember->name;
        }

        return $user->name;
    }

    public function resolveUserByBladerName(string $bladerName): ?User
    {
        $normalized = trim($bladerName);

        if ($normalized === '') {
            return null;
        }

        return User::query()
            ->where('blader_name', $normalized)
            ->orWhere('name', $normalized)
            ->orWhereHas('siteMember', fn ($q) => $q->where('name', $normalized))
            ->first();
    }

    /**
     * @return array<int, array{id: int, label: string, email: string, has_member: bool}>
     */
    public function searchLinkableAccounts(string $query, int $limit = 10): array
    {
        $query = trim($query);

        if (mb_strlen($query) < 2) {
            return [];
        }

        $like = '%'.$query.'%';

        return User::query()
            ->with('siteMember:id,name,user_id')
            ->where(function ($builder) use ($like) {
                $builder
                    ->where('blader_name', 'like', $like)
                    ->orWhere('name', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhereHas('siteMember', fn ($q) => $q->where('name', 'like', $like));
            })
            ->orderBy('name')
            ->limit($limit)
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'label' => $user->blader_name ?: ($user->siteMember?->name ?? $user->name),
                'email' => $user->email,
                'has_member' => $user->siteMember !== null,
            ])
            ->all();
    }

    public function provisionForMember(
        SiteMember $member,
        ?string $email = null,
        ?string $password = null,
    ): User {
        if ($member->user_id) {
            $member->load('user');

            return $member->user;
        }

        $existing = User::query()
            ->whereHas('siteMember', fn ($q) => $q->where('id', $member->id))
            ->orWhere(fn ($q) => $q
                ->where('blader_name', $member->name)
                ->orWhere('name', $member->name))
            ->first();

        if ($existing) {
            $this->linkMemberToUser($member, $existing);

            return $existing;
        }

        $email ??= $this->defaultEmailForMember($member);
        $password ??= config('tournamentx.member_default_password', 'ShadowSyndicate2026!');

        $user = User::create([
            'name' => $member->name,
            'blader_name' => $member->name,
            'email' => $email,
            'password' => bcrypt($password),
            'role' => 'user',
            'account_type' => UserAccountType::MEMBER,
            'can_create_tournaments' => false,
            'can_manage_tournaments' => false,
            'can_manage_events' => false,
            'can_use_judge' => false,
            'can_score_matches' => false,
        ]);

        $this->linkMemberToUser($member, $user);

        return $user;
    }

    public function enforceMemberRestrictions(User $user): void
    {
        if ($user->isAdmin()) {
            return;
        }

        $user->update([
            'account_type' => UserAccountType::MEMBER,
            'can_create_tournaments' => false,
            'can_manage_tournaments' => false,
            'can_manage_events' => false,
            'can_use_judge' => false,
            'can_score_matches' => false,
        ]);
    }

    public function linkMemberToUser(SiteMember $member, User $user): void
    {
        SiteMember::query()
            ->where('user_id', $user->id)
            ->where('id', '!=', $member->id)
            ->update(['user_id' => null]);

        $member->update(['user_id' => $user->id]);

        if (! $user->blader_name) {
            $user->update(['blader_name' => $member->name]);
        }

        $this->enforceMemberRestrictions($user->fresh());
    }

    public function defaultEmailForMember(SiteMember $member): string
    {
        $slug = Str::slug($member->name);
        $domain = config('tournamentx.member_email_domain', 'shadowsyndicate.com');
        $base = "{$slug}@{$domain}";
        $email = $base;
        $suffix = 1;

        while (User::query()->where('email', $email)->exists()) {
            $email = "{$slug}{$suffix}@{$domain}";
            $suffix++;
        }

        return $email;
    }
}
