<?php

namespace App\Events;

use App\Models\Tournament;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TournamentUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Tournament $tournament)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('tournament.' . $this->tournament->id),
        ];
    }

    public function broadcastWith(): array
    {
        return ['tournament_id' => $this->tournament->id];
    }
}
