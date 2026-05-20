<?php

namespace Everest\Services\Billing;

use Everest\Models\Server;
use Everest\Services\Servers\SuspensionService;

class ServerRenewalService
{
    public function __construct(private SuspensionService $suspensionService)
    {
    }

    /**
     * Process the renewal of an existing billable server.
     */
    public function handle(Server $server): Server
    {
        if ($server->isSuspended()) {
            $this->suspensionService->toggle($server, SuspensionService::ACTION_UNSUSPEND);
        }

        $base = $server->renewal_date ?? now();
        $date = $base
            ->addDays(config('modules.billing.renewal.days'))
            ->toDateTimeString();

        $server->update(['renewal_date' => $date]);

        return $server;
    }
}
