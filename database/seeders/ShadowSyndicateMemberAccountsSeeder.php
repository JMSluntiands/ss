<?php

namespace Database\Seeders;

use App\Models\SiteMember;
use App\Models\User;
use App\Services\MemberAccountService;
use Illuminate\Database\Seeder;

class ShadowSyndicateMemberAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $service = app(MemberAccountService::class);

        SiteMember::query()->orderBy('sort_order')->each(function (SiteMember $member) use ($service): void {
            if ($member->user_id) {
                return;
            }

            $matched = User::query()
                ->where(fn ($q) => $q
                    ->where('email', 'like', '%'.strtolower($member->name).'%')
                    ->orWhere('blader_name', $member->name)
                    ->orWhere('name', $member->name))
                ->first();

            if ($matched) {
                $service->linkMemberToUser($member, $matched);

                return;
            }

            $service->provisionForMember($member);
        });
    }
}
